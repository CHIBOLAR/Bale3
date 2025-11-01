'use server';

/**
 * Server actions for payment recording
 * Updated to work with auto-journal creation triggers
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

type PaymentMethod = 'cash' | 'cheque' | 'bank_transfer' | 'upi' | 'card' | 'neft_rtgs' | 'imps' | 'others';

interface RecordPaymentData {
  invoice_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  bank_account_id?: string;
  cheque_number?: string;
  upi_ref?: string;
  transaction_reference?: string;
  notes?: string;
}

/**
 * Record a payment received for an invoice
 * - Creates payment record in payments_received table
 * - Trigger automatically creates journal entry and updates invoice balance
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
    // Trigger will automatically:
    // 1. Create journal entry (Dr: Cash/Bank, Cr: Customer)
    // 2. Update invoice balance and payment status
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
        transaction_reference: data.transaction_reference || null,
        notes: data.notes || null,
      })
      .select('id')
      .single();

    if (paymentError || !payment) {
      console.error('Payment creation error:', paymentError);
      return { success: false, error: 'Failed to create payment record: ' + (paymentError?.message || 'Unknown error') };
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

// Journal entries are now automatically created by database triggers
// See: create_receipt_journal_entry() function and trigger in database migrations
