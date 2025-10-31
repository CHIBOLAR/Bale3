'use server';

/**
 * Server action to finalize draft invoice
 * Updates transport details, changes status to finalized, creates journal entries
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  createInvoiceJournalEntry,
  createCOGSEntry,
} from '@/lib/accounting/invoice';

interface FinalizeInvoiceData {
  invoice_id: string;
  transport_details?: {
    vehicle_number?: string;
    lr_rr_number?: string;
    lr_rr_date?: string;
    transport_mode?: string;
    transporter_name?: string;
    distance_km?: number;
  };
  e_way_bill?: {
    number?: string;
    date?: string;
  };
  terms_and_conditions?: string;
}

export async function finalizeInvoice(
  data: FinalizeInvoiceData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
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

    const userId = userData.id;
    const company_id = userData.company_id;

    if (!company_id) {
      return { success: false, error: 'User is not assigned to a company' };
    }

    // Get existing invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', data.invoice_id)
      .eq('company_id', company_id)
      .single();

    if (invoiceError || !invoice) {
      return { success: false, error: 'Invoice not found' };
    }

    // Check if already finalized
    if (invoice.status === 'finalized') {
      return { success: false, error: 'Invoice is already finalized' };
    }

    // Update invoice with transport details and finalize
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        // Transport Details
        vehicle_number: data.transport_details?.vehicle_number,
        lr_rr_number: data.transport_details?.lr_rr_number,
        lr_rr_date: data.transport_details?.lr_rr_date,
        transport_mode: data.transport_details?.transport_mode,
        transporter_name: data.transport_details?.transporter_name,
        distance_km: data.transport_details?.distance_km,
        // E-Way Bill
        e_way_bill_number: data.e_way_bill?.number,
        e_way_bill_date: data.e_way_bill?.date,
        // Terms
        terms_and_conditions: data.terms_and_conditions,
        // Status
        status: 'finalized',
        finalized_at: new Date().toISOString(),
        finalized_by: userId,
      })
      .eq('id', data.invoice_id);

    if (updateError) {
      console.error('Error updating invoice:', updateError);
      return { success: false, error: 'Failed to update invoice' };
    }

    // Create journal entries
    try {
      // Create invoice journal entry (Dr Customer, Cr Sales, Cr GST)
      await createInvoiceJournalEntry(
        invoice.id,
        invoice.customer_id,
        {
          subtotal: invoice.subtotal,
          total_discount: invoice.discount_amount || 0,
          taxable_amount: invoice.subtotal - (invoice.discount_amount || 0),
          gst_amount: invoice.gst_amount,
          cgst_amount: invoice.cgst_amount,
          sgst_amount: invoice.sgst_amount,
          igst_amount: invoice.igst_amount,
          adjustment_amount: invoice.adjustment_amount || 0,
          total_amount: invoice.total_amount,
        },
        company_id,
        userId,
        invoice.invoice_number,
        invoice.invoice_date
      );

      // Create COGS entry if linked to dispatch (Dr COGS, Cr Inventory)
      if (invoice.dispatch_id) {
        await createCOGSEntry(
          invoice.id,
          invoice.dispatch_id,
          company_id,
          userId,
          invoice.invoice_number,
          invoice.invoice_date
        );
      }
    } catch (journalError) {
      console.error('Journal entry error:', journalError);
      // Invoice updated but journal failed - log for manual fixing
      return {
        success: false,
        error: 'Invoice finalized but journal entries failed. Please contact administrator.',
      };
    }

    // Revalidate paths
    revalidatePath('/dashboard/invoices');
    revalidatePath(`/dashboard/invoices/${invoice.id}`);
    if (invoice.dispatch_id) {
      revalidatePath('/dashboard/inventory/goods-dispatch');
      revalidatePath(`/dashboard/inventory/goods-dispatch/${invoice.dispatch_id}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error finalizing invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to finalize invoice',
    };
  }
}
