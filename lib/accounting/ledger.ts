/**
 * Ledger management functions
 * Phase 7 Week 2 - Core Accounting Engine
 */

import { createClient } from '@/lib/supabase/server';
import type {
  LedgerAccount,
  LedgerBalance,
  PartnerType,
} from './types';

/**
 * Gets existing ledger for a partner or creates a new one
 *
 * @param partner_id - The partner's ID (customer or supplier)
 * @param partner_type - Whether this is a 'customer' or 'supplier'
 * @param partner_name - The partner's name (for ledger creation)
 * @param company_id - The company ID
 * @returns The ledger account record
 *
 * @example
 * ```typescript
 * const ledger = await getOrCreateLedger(
 *   'customer-123',
 *   'customer',
 *   'ABC Traders',
 *   'company-123'
 * );
 * // Returns existing ledger or creates new one under "Sundry Debtors"
 * ```
 */
export async function getOrCreateLedger(
  partner_id: string,
  partner_type: PartnerType,
  partner_name: string,
  company_id: string
): Promise<LedgerAccount> {
  const supabase = await createClient();

  // Step 1: Try to find existing ledger for this partner
  const { data: existing_ledger } = await supabase
    .from('ledger_accounts')
    .select('*')
    .eq('partner_id', partner_id)
    .eq('company_id', company_id)
    .single();

  if (existing_ledger) {
    return existing_ledger as LedgerAccount;
  }

  // Step 2: If not found, create a new ledger account

  // Get the correct account group (Sundry Debtors or Sundry Creditors)
  const groupName = partner_type === 'customer' ? 'Sundry Debtors' : 'Sundry Creditors';

  const { data: account_group } = await supabase
    .from('account_groups')
    .select('id, nature')
    .eq('name', groupName)
    .eq('company_id', company_id)
    .single();

  if (!account_group) {
    throw new Error(`Account group "${groupName}" not found. Please run database seeding.`);
  }

  // Determine account type based on group nature
  const account_type = partner_type === 'customer' ? 'asset' : 'liability';
  const balance_type = partner_type === 'customer' ? 'debit' : 'credit';

  // Step 3: Create the ledger account
  const { data: new_ledger, error } = await supabase
    .from('ledger_accounts')
    .insert({
      name: partner_name,
      account_group_id: account_group.id,
      account_type,
      current_balance: 0,
      balance_type,
      partner_id,
      is_system_ledger: false,
      company_id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create ledger account: ${error.message}`);
  }

  return new_ledger as LedgerAccount;
}

/**
 * Calculates the current balance of a ledger account from journal entries
 *
 * @param ledger_account_id - The ledger account ID
 * @param company_id - The company ID
 * @returns Current balance and whether it's debit or credit
 *
 * @example
 * ```typescript
 * const balance = await calculateLedgerBalance('ledger-123', 'company-123');
 * // Returns: { balance: 11800, balance_type: 'debit' }
 * // Meaning: Customer owes ₹11,800
 * ```
 */
export async function calculateLedgerBalance(
  ledger_account_id: string,
  company_id: string
): Promise<LedgerBalance> {
  const supabase = await createClient();

  // Get ledger account to know if it's normally debit or credit
  const { data: ledger } = await supabase
    .from('ledger_accounts')
    .select('account_type')
    .eq('id', ledger_account_id)
    .eq('company_id', company_id)
    .single();

  if (!ledger) {
    throw new Error('Ledger account not found');
  }

  // Sum all debit and credit entries for this ledger
  const { data: entries } = await supabase
    .from('journal_entry_lines')
    .select('debit_amount, credit_amount')
    .eq('ledger_account_id', ledger_account_id)
    .eq('company_id', company_id);

  if (!entries || entries.length === 0) {
    // No transactions yet, return zero balance
    const default_balance_type =
      ledger.account_type === 'asset' || ledger.account_type === 'expense'
        ? 'debit'
        : 'credit';

    return {
      balance: 0,
      balance_type: default_balance_type,
    };
  }

  // Calculate total debits and credits
  const total_debit = entries.reduce((sum, entry) => sum + entry.debit_amount, 0);
  const total_credit = entries.reduce((sum, entry) => sum + entry.credit_amount, 0);

  // Determine balance and its type
  // For assets and expenses: Debit increases, Credit decreases
  // For liabilities and income: Credit increases, Debit decreases

  let balance: number;
  let balance_type: 'debit' | 'credit';

  if (ledger.account_type === 'asset' || ledger.account_type === 'expense') {
    // Debit balance accounts
    balance = total_debit - total_credit;
    balance_type = balance >= 0 ? 'debit' : 'credit';
    balance = Math.abs(balance);
  } else {
    // Credit balance accounts (liability, income)
    balance = total_credit - total_debit;
    balance_type = balance >= 0 ? 'credit' : 'debit';
    balance = Math.abs(balance);
  }

  return {
    balance,
    balance_type,
  };
}
