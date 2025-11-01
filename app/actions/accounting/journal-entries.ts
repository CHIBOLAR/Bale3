'use server';

/**
 * Server actions for journal entries management
 */

import { createClient } from '@/lib/supabase/server';

export interface JournalEntryLine {
  id: string;
  ledger_account_id: string;
  ledger_name: string;
  account_type: string;
  debit_amount: number;
  credit_amount: number;
  bill_reference: string | null;
}

export interface JournalEntry {
  id: string;
  entry_number: string;
  entry_date: string;
  transaction_type: string;
  narration: string | null;
  is_opening_entry: boolean;
  created_at: string;
  total_debit: number;
  total_credit: number;
  lines: JournalEntryLine[];
}

/**
 * Get all journal entries with their lines
 */
export async function getJournalEntries(filters?: {
  startDate?: string;
  endDate?: string;
  transactionType?: string;
  search?: string;
}): Promise<{ success: boolean; data?: JournalEntry[]; error?: string }> {
  try {
    const supabase = await createClient();

    // Get current user's company
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData) {
      return { success: false, error: 'User not found' };
    }

    // Build query
    let query = supabase
      .from('journal_entries')
      .select(
        `
        id,
        entry_number,
        entry_date,
        transaction_type,
        narration,
        is_opening_entry,
        created_at
      `
      )
      .eq('company_id', userData.company_id)
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.startDate) {
      query = query.gte('entry_date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('entry_date', filters.endDate);
    }
    if (filters?.transactionType && filters.transactionType !== 'all') {
      query = query.eq('transaction_type', filters.transactionType);
    }

    const { data: entries, error: entriesError } = await query;

    if (entriesError) {
      return { success: false, error: entriesError.message };
    }

    if (!entries || entries.length === 0) {
      return { success: true, data: [] };
    }

    // Get all lines for these entries
    const entryIds = entries.map((e) => e.id);
    const { data: lines, error: linesError } = await supabase
      .from('journal_entry_lines')
      .select(
        `
        id,
        journal_entry_id,
        ledger_account_id,
        debit_amount,
        credit_amount,
        bill_reference,
        ledger_accounts (
          name,
          account_type
        )
      `
      )
      .in('journal_entry_id', entryIds);

    if (linesError) {
      return { success: false, error: linesError.message };
    }

    // Combine entries with their lines
    const journalEntries: JournalEntry[] = entries.map((entry) => {
      const entryLines = (lines || [])
        .filter((line: any) => line.journal_entry_id === entry.id)
        .map((line: any) => ({
          id: line.id,
          ledger_account_id: line.ledger_account_id,
          ledger_name: line.ledger_accounts?.name || 'Unknown',
          account_type: line.ledger_accounts?.account_type || '',
          debit_amount: parseFloat(line.debit_amount || 0),
          credit_amount: parseFloat(line.credit_amount || 0),
          bill_reference: line.bill_reference,
        }));

      const total_debit = entryLines.reduce((sum, line) => sum + line.debit_amount, 0);
      const total_credit = entryLines.reduce((sum, line) => sum + line.credit_amount, 0);

      return {
        ...entry,
        total_debit,
        total_credit,
        lines: entryLines,
      };
    });

    // Apply search filter if provided
    let filteredEntries = journalEntries;
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredEntries = journalEntries.filter(
        (entry) =>
          entry.entry_number.toLowerCase().includes(searchLower) ||
          entry.narration?.toLowerCase().includes(searchLower) ||
          entry.lines.some((line) => line.ledger_name.toLowerCase().includes(searchLower))
      );
    }

    return { success: true, data: filteredEntries };
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch journal entries',
    };
  }
}

/**
 * Create a manual journal entry
 */
export async function createManualJournalEntry(data: {
  entry_date: string;
  narration: string;
  lines: Array<{
    ledger_account_id: string;
    debit_amount: number;
    credit_amount: number;
  }>;
}): Promise<{ success: boolean; entry_id?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: userData } = await supabase
      .from('users')
      .select('id, company_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData) {
      return { success: false, error: 'User not found' };
    }

    // Validate lines
    if (!data.lines || data.lines.length < 2) {
      return { success: false, error: 'At least 2 lines are required for a journal entry' };
    }

    // Calculate totals
    const totalDebit = data.lines.reduce((sum, line) => sum + line.debit_amount, 0);
    const totalCredit = data.lines.reduce((sum, line) => sum + line.credit_amount, 0);

    // Validate Dr = Cr
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return {
        success: false,
        error: `Journal entry is not balanced. Debit: ₹${totalDebit.toFixed(2)}, Credit: ₹${totalCredit.toFixed(2)}`,
      };
    }

    // Check Section 269ST for cash transactions > 2L
    const { data: cashLedger } = await supabase
      .from('ledger_accounts')
      .select('id')
      .eq('company_id', userData.company_id)
      .eq('name', 'Cash')
      .eq('is_system_ledger', true)
      .single();

    if (cashLedger) {
      const cashDebit = data.lines
        .filter((line) => line.ledger_account_id === cashLedger.id)
        .reduce((sum, line) => sum + line.debit_amount, 0);

      if (cashDebit > 200000) {
        return {
          success: false,
          error: 'Section 269ST: Cash receipts above ₹2,00,000 are not allowed',
        };
      }
    }

    // Generate entry number
    const { data: lastEntry } = await supabase
      .from('journal_entries')
      .select('entry_number')
      .eq('company_id', userData.company_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let entryNumber = 'JE-2025-0001';
    if (lastEntry?.entry_number) {
      const match = lastEntry.entry_number.match(/JE-(\d{4})-(\d+)/);
      if (match) {
        const year = new Date().getFullYear();
        const nextNum = parseInt(match[2]) + 1;
        entryNumber = `JE-${year}-${nextNum.toString().padStart(4, '0')}`;
      }
    }

    // Create journal entry
    const { data: journalEntry, error: entryError } = await supabase
      .from('journal_entries')
      .insert({
        company_id: userData.company_id,
        entry_number: entryNumber,
        entry_date: data.entry_date,
        transaction_type: 'manual',
        narration: data.narration,
        created_by: userData.id,
      })
      .select()
      .single();

    if (entryError) {
      return { success: false, error: entryError.message };
    }

    // Create journal entry lines
    const lines = data.lines.map((line) => ({
      journal_entry_id: journalEntry.id,
      ledger_account_id: line.ledger_account_id,
      debit_amount: line.debit_amount,
      credit_amount: line.credit_amount,
    }));

    const { error: linesError } = await supabase.from('journal_entry_lines').insert(lines);

    if (linesError) {
      // Rollback: delete the journal entry
      await supabase.from('journal_entries').delete().eq('id', journalEntry.id);
      return { success: false, error: linesError.message };
    }

    // Update ledger balances
    for (const line of data.lines) {
      const amount = line.debit_amount - line.credit_amount;
      const { error: updateError } = await supabase.rpc('update_ledger_balance', {
        p_ledger_id: line.ledger_account_id,
        p_amount: amount,
      });

      if (updateError) {
        console.error('Error updating ledger balance:', updateError);
      }
    }

    return { success: true, entry_id: journalEntry.id };
  } catch (error) {
    console.error('Error creating manual journal entry:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create journal entry',
    };
  }
}

/**
 * Get all ledger accounts for dropdown
 */
export async function getLedgerAccounts(): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    name: string;
    account_type: string;
    current_balance: number;
  }>;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData) {
      return { success: false, error: 'User not found' };
    }

    const { data: ledgers, error } = await supabase
      .from('ledger_accounts')
      .select('id, name, account_type, current_balance')
      .eq('company_id', userData.company_id)
      .eq('is_active', true)
      .order('name');

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: ledgers || [] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch ledger accounts',
    };
  }
}
