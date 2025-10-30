/**
 * Core double-entry accounting logic
 * Phase 7 Week 2 - Core Accounting Engine
 */

import { createClient } from '@/lib/supabase/server';
import type {
  JournalEntry,
  JournalEntryLine,
  DoubleEntryValidation,
} from './types';

/**
 * Validates that a journal entry is balanced (total debit = total credit)
 *
 * @param lines - Array of journal entry lines with debit and credit amounts
 * @returns Validation result with totals and any error message
 *
 * @example
 * ```typescript
 * const result = validateDoubleEntry([
 *   { ledger_account_id: '1', debit_amount: 11800, credit_amount: 0 },
 *   { ledger_account_id: '2', debit_amount: 0, credit_amount: 10000 },
 *   { ledger_account_id: '3', debit_amount: 0, credit_amount: 900 },
 *   { ledger_account_id: '4', debit_amount: 0, credit_amount: 900 },
 * ]);
 * // Returns: { valid: true, total_debit: 11800, total_credit: 11800, difference: 0 }
 * ```
 */
export function validateDoubleEntry(
  lines: JournalEntryLine[]
): DoubleEntryValidation {
  // Calculate totals
  const total_debit = lines.reduce((sum, line) => sum + line.debit_amount, 0);
  const total_credit = lines.reduce((sum, line) => sum + line.credit_amount, 0);
  const difference = Math.abs(total_debit - total_credit);

  // Check if balanced (allowing for small floating point errors)
  const valid = difference < 0.01;

  return {
    valid,
    total_debit,
    total_credit,
    difference,
    error_message: valid
      ? undefined
      : `Journal entry is not balanced. Debit: ₹${total_debit}, Credit: ₹${total_credit}, Difference: ₹${difference}`,
  };
}

/**
 * Creates a journal entry with validation and saves to database
 *
 * @param entry - Journal entry data including lines, transaction details
 * @returns Created journal entry ID or throws error if invalid
 *
 * @throws {Error} If journal entry is not balanced (Dr ≠ Cr)
 * @throws {Error} If database operation fails
 *
 * @example
 * ```typescript
 * const journalEntryId = await createJournalEntry({
 *   transaction_type: 'invoice',
 *   transaction_id: 'inv-123',
 *   entry_date: '2025-01-26',
 *   narration: 'Sales Invoice INV-2025-001',
 *   company_id: 'company-123',
 *   created_by: 'user-123',
 *   lines: [
 *     { ledger_account_id: 'customer-1', debit_amount: 11800, credit_amount: 0 },
 *     { ledger_account_id: 'sales', debit_amount: 0, credit_amount: 10000 },
 *     { ledger_account_id: 'cgst-output', debit_amount: 0, credit_amount: 900 },
 *     { ledger_account_id: 'sgst-output', debit_amount: 0, credit_amount: 900 },
 *   ],
 * });
 * ```
 */
export async function createJournalEntry(
  entry: JournalEntry
): Promise<string> {
  // Step 1: Validate double-entry (Dr = Cr)
  const validation = validateDoubleEntry(entry.lines);

  if (!validation.valid) {
    throw new Error(validation.error_message || 'Journal entry is not balanced');
  }

  // Step 2: Get Supabase client
  const supabase = await createClient();

  try {
    // Step 3: Generate entry number (format: JE-2025-0001)
    const currentYear = new Date(entry.entry_date).getFullYear();
    const { data: lastEntry } = await supabase
      .from('journal_entries')
      .select('entry_number')
      .eq('company_id', entry.company_id)
      .like('entry_number', `JE-${currentYear}-%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let entryNumber: string;
    if (lastEntry?.entry_number) {
      const lastNumber = parseInt(lastEntry.entry_number.split('-')[2]);
      entryNumber = `JE-${currentYear}-${String(lastNumber + 1).padStart(4, '0')}`;
    } else {
      entryNumber = `JE-${currentYear}-0001`;
    }

    // Step 4: Create journal entry header
    const { data: journalEntry, error: entryError } = await supabase
      .from('journal_entries')
      .insert({
        entry_number: entryNumber,
        transaction_type: entry.transaction_type,
        transaction_id: entry.transaction_id,
        entry_date: entry.entry_date,
        narration: entry.narration,
        company_id: entry.company_id,
        created_by: entry.created_by,
      })
      .select('id')
      .single();

    if (entryError) {
      throw new Error(`Failed to create journal entry: ${entryError.message}`);
    }

    // Step 5: Create journal entry lines
    const linesToInsert = entry.lines.map((line) => ({
      journal_entry_id: journalEntry.id,
      ledger_account_id: line.ledger_account_id,
      debit_amount: line.debit_amount,
      credit_amount: line.credit_amount,
      bill_reference: line.bill_reference || null,
      company_id: entry.company_id,
    }));

    const { error: linesError } = await supabase
      .from('journal_entry_lines')
      .insert(linesToInsert);

    if (linesError) {
      // Rollback: delete journal entry if lines fail
      await supabase
        .from('journal_entries')
        .delete()
        .eq('id', journalEntry.id);

      throw new Error(`Failed to create journal entry lines: ${linesError.message}`);
    }

    // Step 6: Return created journal entry ID
    return journalEntry.id;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while creating journal entry');
  }
}
