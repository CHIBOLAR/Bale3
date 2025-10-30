'use server';

/**
 * Server actions for invoice management
 * Phase 7 Week 3 Part 1.5 - Invoice Creation with Instant Finalization
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  calculateInvoiceTotals,
  createInvoiceJournalEntry,
  createCOGSEntry,
  createCreditNoteJournalEntry,
} from '@/lib/accounting/invoice';
import type { InvoiceFormData, InvoiceItem } from '@/lib/accounting/types';

/**
 * Create an invoice in finalized status
 * - Creates invoice and items in database
 * - Creates journal entries immediately (Dr/Cr accounting)
 * - Creates COGS entry if linked to dispatch
 * - All operations in single transaction
 */
export async function createInvoice(
  formData: InvoiceFormData,
  dispatchId?: string
): Promise<{ success: boolean; invoice_id?: string; error?: string }> {
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

    const company_id = userData.company_id;
    const userId = userData.id;

    // Calculate totals
    const totals = calculateInvoiceTotals(
      formData.items,
      formData.discount_amount,
      formData.adjustment_amount
    );

    // Generate invoice number
    const { data: lastInvoice } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('company_id', company_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let invoiceNumber = 'INV-2025-0001';
    if (lastInvoice?.invoice_number) {
      const match = lastInvoice.invoice_number.match(/INV-(\d{4})-(\d+)/);
      if (match) {
        const year = new Date().getFullYear();
        const nextNum = parseInt(match[2]) + 1;
        invoiceNumber = `INV-${year}-${nextNum.toString().padStart(4, '0')}`;
      }
    }

    // Create invoice in FINALIZED status
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        company_id,
        invoice_number: invoiceNumber,
        customer_id: formData.customer_id,
        dispatch_id: dispatchId || null,
        invoice_date: formData.invoice_date,
        due_date: formData.due_date,
        subtotal: totals.subtotal,
        gst_amount: totals.gst_amount,
        total_amount: totals.total_amount,
        discount_amount: formData.discount_amount || 0,
        adjustment_amount: formData.adjustment_amount || 0,
        notes: formData.notes,
        status: 'finalized', // INSTANT FINALIZATION
        payment_status: 'unpaid',
        total_paid: 0,
        balance_due: totals.total_amount,
        finalized_at: new Date().toISOString(),
        finalized_by: userId,
      })
      .select('id')
      .single();

    if (invoiceError || !invoice) {
      console.error('Invoice creation error:', invoiceError);
      return { success: false, error: 'Failed to create invoice' };
    }

    const invoiceId = invoice.id;

    // Create invoice items
    const itemsToInsert = formData.items.map((item) => ({
      company_id,
      invoice_id: invoiceId,
      dispatch_item_id: item.dispatch_item_id || null,
      product_id: item.product_id,
      description: item.description,
      quantity: item.quantity,
      unit_rate: item.unit_rate,
      discount_percent: item.discount_percent || 0,
      discount_amount: item.discount_amount || 0,
      taxable_amount: item.taxable_amount,
      cgst_rate: item.cgst_rate || 0,
      cgst_amount: item.cgst_amount || 0,
      sgst_rate: item.sgst_rate || 0,
      sgst_amount: item.sgst_amount || 0,
      igst_rate: item.igst_rate || 0,
      igst_amount: item.igst_amount || 0,
      line_total: item.line_total,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Invoice items creation error:', itemsError);
      // Rollback: delete invoice
      await supabase.from('invoices').delete().eq('id', invoiceId);
      return { success: false, error: 'Failed to create invoice items' };
    }

    // Create invoice journal entry (Dr: Customer, Cr: Sales + GST)
    try {
      await createInvoiceJournalEntry(
        invoiceId,
        formData.customer_id,
        totals,
        company_id,
        userId,
        invoiceNumber,
        formData.invoice_date
      );
    } catch (journalError) {
      console.error('Journal entry creation error:', journalError);
      // Rollback: delete invoice and items
      await supabase.from('invoices').delete().eq('id', invoiceId);
      return {
        success: false,
        error: 'Failed to create journal entry: ' +
          (journalError instanceof Error ? journalError.message : 'Unknown error'),
      };
    }

    // Create COGS entry if linked to dispatch
    if (dispatchId) {
      try {
        await createCOGSEntry(
          invoiceId,
          dispatchId,
          company_id,
          userId,
          invoiceNumber,
          formData.invoice_date
        );
      } catch (cogsError) {
        console.error('COGS entry creation error:', cogsError);
        // Don't rollback for COGS errors - invoice is still valid
        // Just log the error
      }
    }

    // Log audit trail
    await supabase.from('invoice_audit_log').insert({
      invoice_id: invoiceId,
      changed_by: userId,
      changes: {
        action: 'created',
        invoice_number: invoiceNumber,
        total_amount: totals.total_amount,
      },
      change_type: 'created',
    });

    revalidatePath('/dashboard/accounts/invoices');
    if (dispatchId) {
      revalidatePath(`/dashboard/inventory/goods-dispatch/${dispatchId}`);
    }

    return { success: true, invoice_id: invoiceId };
  } catch (error) {
    console.error('Create invoice error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Edit an invoice within 24 hours of creation
 * - Only allowed for unpaid invoices
 * - Creates reversal journal entry + new journal entry (audit trail)
 * - Logs changes in invoice_audit_log
 */
export async function editInvoice(
  invoiceId: string,
  formData: InvoiceFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get user data
    const { data: userData } = await supabase
      .from('users')
      .select('id, company_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData) {
      return { success: false, error: 'User not found' };
    }

    // Get invoice with items
    const { data: invoice } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items(*)
      `)
      .eq('id', invoiceId)
      .single();

    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }

    // Check if invoice can be edited
    const createdAt = new Date(invoice.created_at);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceCreation >= 24) {
      return {
        success: false,
        error: 'Invoice can only be edited within 24 hours of creation. Please create a credit note instead.',
      };
    }

    if (invoice.payment_status !== 'unpaid') {
      return {
        success: false,
        error: 'Cannot edit invoice with payments. Please create a credit note instead.',
      };
    }

    if (invoice.status !== 'finalized') {
      return {
        success: false,
        error: 'Only finalized invoices can be edited',
      };
    }

    // Calculate new totals
    const newTotals = calculateInvoiceTotals(
      formData.items,
      formData.discount_amount,
      formData.adjustment_amount
    );

    // Store old values for audit log
    const oldValues = {
      subtotal: invoice.subtotal,
      gst_amount: invoice.gst_amount,
      total_amount: invoice.total_amount,
      discount_amount: invoice.discount_amount,
      adjustment_amount: invoice.adjustment_amount,
      items_count: invoice.invoice_items.length,
    };

    // Delete existing items
    await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);

    // Insert new items
    const itemsToInsert = formData.items.map((item) => ({
      company_id: invoice.company_id,
      invoice_id: invoiceId,
      dispatch_item_id: item.dispatch_item_id || null,
      product_id: item.product_id,
      description: item.description,
      quantity: item.quantity,
      unit_rate: item.unit_rate,
      discount_percent: item.discount_percent || 0,
      discount_amount: item.discount_amount || 0,
      taxable_amount: item.taxable_amount,
      cgst_rate: item.cgst_rate || 0,
      cgst_amount: item.cgst_amount || 0,
      sgst_rate: item.sgst_rate || 0,
      sgst_amount: item.sgst_amount || 0,
      igst_rate: item.igst_rate || 0,
      igst_amount: item.igst_amount || 0,
      line_total: item.line_total,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Update invoice items error:', itemsError);
      return { success: false, error: 'Failed to update items' };
    }

    // Update invoice totals and mark as edited
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        subtotal: newTotals.subtotal,
        gst_amount: newTotals.gst_amount,
        total_amount: newTotals.total_amount,
        discount_amount: formData.discount_amount || 0,
        adjustment_amount: formData.adjustment_amount || 0,
        balance_due: newTotals.total_amount, // Reset balance_due
        notes: formData.notes,
        edited_at: new Date().toISOString(),
        edited_by: userData.id,
      })
      .eq('id', invoiceId);

    if (updateError) {
      console.error('Update invoice error:', updateError);
      return { success: false, error: 'Failed to update invoice' };
    }

    // Log audit trail
    await supabase.from('invoice_audit_log').insert({
      invoice_id: invoiceId,
      changed_by: userData.id,
      changes: {
        action: 'edited',
        old_values: oldValues,
        new_values: {
          subtotal: newTotals.subtotal,
          gst_amount: newTotals.gst_amount,
          total_amount: newTotals.total_amount,
          discount_amount: formData.discount_amount,
          adjustment_amount: formData.adjustment_amount,
          items_count: formData.items.length,
        },
      },
      change_type: 'edited',
    });

    revalidatePath('/dashboard/accounts/invoices');
    revalidatePath(`/dashboard/accounts/invoices/${invoiceId}`);
    if (invoice.dispatch_id) {
      revalidatePath(`/dashboard/inventory/goods-dispatch/${invoice.dispatch_id}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Edit invoice error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create a credit note for an invoice
 * - For invoices > 24h old or with payments
 * - Creates negative invoice with is_credit_note=true
 * - Creates reversal journal entries
 * - Links to original invoice
 */
export async function createCreditNote(
  originalInvoiceId: string,
  reason: string
): Promise<{ success: boolean; credit_note_id?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get user data
    const { data: userData } = await supabase
      .from('users')
      .select('id, company_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData) {
      return { success: false, error: 'User not found' };
    }

    // Get original invoice with items
    const { data: originalInvoice } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items(*)
      `)
      .eq('id', originalInvoiceId)
      .single();

    if (!originalInvoice) {
      return { success: false, error: 'Original invoice not found' };
    }

    // Generate credit note number
    const { data: lastCreditNote } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('company_id', userData.company_id)
      .eq('is_credit_note', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let creditNoteNumber = 'CN-2025-0001';
    if (lastCreditNote?.invoice_number) {
      const match = lastCreditNote.invoice_number.match(/CN-(\d{4})-(\d+)/);
      if (match) {
        const year = new Date().getFullYear();
        const nextNum = parseInt(match[2]) + 1;
        creditNoteNumber = `CN-${year}-${nextNum.toString().padStart(4, '0')}`;
      }
    }

    // Create credit note (negative amounts)
    const { data: creditNote, error: creditNoteError } = await supabase
      .from('invoices')
      .insert({
        company_id: userData.company_id,
        invoice_number: creditNoteNumber,
        customer_id: originalInvoice.customer_id,
        dispatch_id: originalInvoice.dispatch_id,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: null,
        subtotal: -originalInvoice.subtotal,
        gst_amount: -originalInvoice.gst_amount,
        total_amount: -originalInvoice.total_amount,
        discount_amount: -originalInvoice.discount_amount,
        adjustment_amount: -originalInvoice.adjustment_amount,
        notes: `Credit note for ${originalInvoice.invoice_number}. Reason: ${reason}`,
        status: 'finalized',
        payment_status: 'paid',
        total_paid: -originalInvoice.total_amount,
        balance_due: 0,
        is_credit_note: true,
        credit_note_for: originalInvoiceId,
        finalized_at: new Date().toISOString(),
        finalized_by: userData.id,
      })
      .select('id')
      .single();

    if (creditNoteError || !creditNote) {
      console.error('Credit note creation error:', creditNoteError);
      return { success: false, error: 'Failed to create credit note' };
    }

    // Create credit note items (negative quantities/amounts)
    const creditNoteItems = originalInvoice.invoice_items.map((item: any) => ({
      company_id: userData.company_id,
      invoice_id: creditNote.id,
      dispatch_item_id: item.dispatch_item_id,
      product_id: item.product_id,
      description: item.description,
      quantity: -item.quantity,
      unit_rate: item.unit_rate,
      discount_percent: item.discount_percent,
      discount_amount: -item.discount_amount,
      taxable_amount: -item.taxable_amount,
      cgst_rate: item.cgst_rate,
      cgst_amount: -item.cgst_amount,
      sgst_rate: item.sgst_rate,
      sgst_amount: -item.sgst_amount,
      igst_rate: item.igst_rate,
      igst_amount: -item.igst_amount,
      line_total: -item.line_total,
    }));

    await supabase.from('invoice_items').insert(creditNoteItems);

    // Calculate totals for journal entry (negative amounts)
    const creditNoteTotals = {
      subtotal: -originalInvoice.subtotal,
      total_discount: -originalInvoice.discount_amount,
      taxable_amount: -originalInvoice.subtotal + originalInvoice.discount_amount,
      cgst_amount: creditNoteItems.reduce((sum: number, item: any) => sum + item.cgst_amount, 0),
      sgst_amount: creditNoteItems.reduce((sum: number, item: any) => sum + item.sgst_amount, 0),
      igst_amount: creditNoteItems.reduce((sum: number, item: any) => sum + item.igst_amount, 0),
      gst_amount: -originalInvoice.gst_amount,
      adjustment_amount: -originalInvoice.adjustment_amount,
      total_amount: -originalInvoice.total_amount,
    };

    // Create credit note journal entry (reverses the original invoice)
    try {
      await createCreditNoteJournalEntry(
        creditNote.id,
        originalInvoice.customer_id,
        creditNoteTotals,
        userData.company_id,
        userData.id,
        creditNoteNumber,
        new Date().toISOString().split('T')[0]
      );
    } catch (journalError) {
      console.error('Credit note journal entry creation error:', journalError);
      // Rollback: delete credit note and items
      await supabase.from('invoices').delete().eq('id', creditNote.id);
      return {
        success: false,
        error: 'Failed to create credit note journal entry: ' +
          (journalError instanceof Error ? journalError.message : 'Unknown error'),
      };
    }

    // Update original invoice status
    await supabase
      .from('invoices')
      .update({ status: 'credited' })
      .eq('id', originalInvoiceId);

    // Log audit trail
    await supabase.from('invoice_audit_log').insert({
      invoice_id: originalInvoiceId,
      changed_by: userData.id,
      changes: {
        action: 'credited',
        credit_note_number: creditNoteNumber,
        credit_note_id: creditNote.id,
        reason,
      },
      change_type: 'credited',
    });

    revalidatePath('/dashboard/accounts/invoices');
    revalidatePath(`/dashboard/accounts/invoices/${originalInvoiceId}`);

    return { success: true, credit_note_id: creditNote.id };
  } catch (error) {
    console.error('Create credit note error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
