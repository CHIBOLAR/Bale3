'use server';

/**
 * Server actions for payment recording
 * Phase 7 Week 3 Part 3 - Payment Recording (Manual Entry)
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createJournalEntry } from '@/lib/accounting/core';
import { getOrCreateLedger } from '@/lib/accounting/ledger';

interface RecordPaymentData {
  invoice_id: string;
  amount: number;
  payment_method: 'cash' | 'bank' | 'cheque' | 'upi';
  payment_date: string;
  bank_account_id?: string;
  cheque_number?: string;
  upi_ref?: string;
  notes?: string;
}

/**
 * Record a payment received for an invoice
 * - Updates invoice payment_status and balance_due
 * - Creates payment record in payments_received table
 * - Creates journal entry (Dr: Cash/Bank, Cr: Customer)
 * - Section 269ST compliance check (blocks cash >₹2L)
 */
export async function recordPayment(
  data: RecordPaymentData
): Promise<{ success: boolean; payment_id?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get user's company_id
    const { data: userData } = await supabase
      .from('users')
      .select('id, company_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData) {
      return { success: false, error: 'User not found' };
    }

    // Get invoice
    const { data: invoice } = await supabase
      .from('invoices')
      .select(`
        *,
        partners:customer_id (
          id,
          company_name,
          first_name,
          last_name
        )
      `)
      .eq('id', data.invoice_id)
      .single();

    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }

    // Check invoice status
    if (invoice.status !== 'finalized') {
      return { success: false, error: 'Can only record payments for finalized invoices' };
    }

    if (invoice.payment_status === 'paid') {
      return { success: false, error: 'Invoice is already fully paid' };
    }

    // Calculate remaining balance
    const currentBalance = parseFloat(invoice.balance_due) || parseFloat(invoice.total_amount);

    if (data.amount > currentBalance) {
      return {
        success: false,
        error: `Payment amount (₹${data.amount}) exceeds balance due (₹${currentBalance})`
      };
    }

    // Section 269ST compliance check - block cash payments >₹2L
    if (data.payment_method === 'cash' && data.amount > 200000) {
      return {
        success: false,
        error: 'Section 269ST: Cash payments above ₹2,00,000 are not allowed. Please use bank transfer, cheque, or UPI.',
      };
    }

    // Calculate new totals
    const newTotalPaid = parseFloat(invoice.total_paid || 0) + data.amount;
    const newBalanceDue = parseFloat(invoice.total_amount) - newTotalPaid;
    const newPaymentStatus = newBalanceDue === 0 ? 'paid' : newBalanceDue < parseFloat(invoice.total_amount) ? 'partial' : 'unpaid';

    // Generate payment number
    const { data: lastPayment } = await supabase
      .from('payments_received')
      .select('payment_number')
      .eq('company_id', userData.company_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let paymentNumber = 'PMT-2025-0001';
    if (lastPayment?.payment_number) {
      const match = lastPayment.payment_number.match(/PMT-(\d{4})-(\d+)/);
      if (match) {
        const year = new Date().getFullYear();
        const nextNum = parseInt(match[2]) + 1;
        paymentNumber = `PMT-${year}-${nextNum.toString().padStart(4, '0')}`;
      }
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments_received')
      .insert({
        company_id: userData.company_id,
        payment_number: paymentNumber,
        customer_id: invoice.customer_id,
        invoice_id: data.invoice_id,
        amount: data.amount,
        payment_method: data.payment_method,
        payment_date: data.payment_date,
        bank_account_id: data.bank_account_id || null,
        cheque_number: data.cheque_number || null,
        upi_ref: data.upi_ref || null,
        notes: data.notes || null,
      })
      .select('id')
      .single();

    if (paymentError || !payment) {
      console.error('Payment creation error:', paymentError);
      return { success: false, error: 'Failed to create payment record' };
    }

    // Update invoice
    const { error: invoiceUpdateError } = await supabase
      .from('invoices')
      .update({
        total_paid: newTotalPaid,
        balance_due: newBalanceDue,
        payment_status: newPaymentStatus,
      })
      .eq('id', data.invoice_id);

    if (invoiceUpdateError) {
      console.error('Invoice update error:', invoiceUpdateError);
      // Rollback payment
      await supabase.from('payments_received').delete().eq('id', payment.id);
      return { success: false, error: 'Failed to update invoice' };
    }

    // Create journal entry
    try {
      await createPaymentJournalEntry(
        payment.id,
        invoice.customer_id,
        data.amount,
        data.payment_method,
        userData.company_id,
        userData.id,
        paymentNumber,
        data.payment_date,
        data.bank_account_id,
        invoice.invoice_number
      );
    } catch (journalError) {
      console.error('Journal entry creation error:', journalError);
      // Rollback payment and invoice update
      await supabase.from('payments_received').delete().eq('id', payment.id);
      await supabase
        .from('invoices')
        .update({
          total_paid: invoice.total_paid,
          balance_due: invoice.balance_due,
          payment_status: invoice.payment_status,
        })
        .eq('id', data.invoice_id);
      return {
        success: false,
        error: 'Failed to create journal entry: ' +
          (journalError instanceof Error ? journalError.message : 'Unknown error'),
      };
    }

    revalidatePath('/dashboard/invoices');
    revalidatePath(`/dashboard/invoices/${data.invoice_id}`);

    return { success: true, payment_id: payment.id };
  } catch (error) {
    console.error('Record payment error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create journal entry for payment received
 *
 * Dr: Cash/Bank Account - Payment Amount
 * Cr: Customer (Sundry Debtors) - Payment Amount
 */
async function createPaymentJournalEntry(
  paymentId: string,
  customerId: string,
  amount: number,
  paymentMethod: string,
  companyId: string,
  userId: string,
  paymentNumber: string,
  paymentDate: string,
  bankAccountId?: string,
  invoiceNumber?: string
): Promise<string> {
  const supabase = await createClient();

  // Get customer name for ledger
  const { data: customer } = await supabase
    .from('partners')
    .select('first_name, last_name, company_name')
    .eq('id', customerId)
    .single();

  if (!customer) {
    throw new Error('Customer not found');
  }

  const customerName = customer.company_name || `${customer.first_name} ${customer.last_name}`;

  // Get or create customer ledger
  const customerLedger = await getOrCreateLedger(
    customerId,
    'customer',
    customerName,
    companyId
  );

  // Determine debit ledger based on payment method
  let debitLedgerId: string;
  let debitLedgerName: string;

  if (paymentMethod === 'cash') {
    // Get Cash-in-Hand ledger
    const { data: cashLedger } = await supabase
      .from('ledger_accounts')
      .select('id, name')
      .eq('company_id', companyId)
      .eq('is_system_ledger', true)
      .eq('name', 'Cash-in-Hand')
      .single();

    if (!cashLedger) {
      throw new Error('Cash-in-Hand ledger not found');
    }

    debitLedgerId = cashLedger.id;
    debitLedgerName = cashLedger.name;
  } else {
    // Get bank account ledger (or default bank account)
    if (bankAccountId) {
      const { data: bankAccount } = await supabase
        .from('cash_bank_accounts')
        .select('ledger_account_id, ledger_accounts(id, name)')
        .eq('id', bankAccountId)
        .single();

      if (!bankAccount || !bankAccount.ledger_accounts) {
        throw new Error('Bank account not found');
      }

      debitLedgerId = (bankAccount.ledger_accounts as any).id;
      debitLedgerName = (bankAccount.ledger_accounts as any).name;
    } else {
      // Use default bank account
      const { data: defaultBank } = await supabase
        .from('ledger_accounts')
        .select('id, name')
        .eq('company_id', companyId)
        .eq('is_system_ledger', true)
        .eq('name', 'Bank Account (Default)')
        .single();

      if (!defaultBank) {
        throw new Error('Default bank account not found');
      }

      debitLedgerId = defaultBank.id;
      debitLedgerName = defaultBank.name;
    }
  }

  // Build journal entry lines
  const lines = [
    {
      ledger_account_id: debitLedgerId,
      debit_amount: amount,
      credit_amount: 0,
      bill_reference: paymentNumber,
    },
    {
      ledger_account_id: customerLedger.id,
      debit_amount: 0,
      credit_amount: amount,
      bill_reference: invoiceNumber || paymentNumber,
    },
  ];

  // Create journal entry
  const journalEntryId = await createJournalEntry({
    transaction_type: 'payment_received',
    transaction_id: paymentId,
    entry_date: paymentDate,
    narration: `Payment received ${paymentNumber}${invoiceNumber ? ` for Invoice ${invoiceNumber}` : ''} via ${paymentMethod}`,
    lines,
    company_id: companyId,
    created_by: userId,
  });

  return journalEntryId;
}
