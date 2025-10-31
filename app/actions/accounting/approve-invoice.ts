'use server';

/**
 * Server action to approve and finalize invoice from preview
 * Saves invoice to database and creates journal entries
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  calculateInvoiceTotals,
  createInvoiceJournalEntry,
  createCOGSEntry,
  calculateItemGST,
} from '@/lib/accounting/invoice';
import type { InvoiceItem } from '@/lib/accounting/types';

interface ApproveInvoiceData {
  dispatch_id: string;
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
}

export async function approveInvoice(
  data: ApproveInvoiceData
): Promise<{ success: boolean; invoice_id?: string; error?: string }> {
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
      .select('id, company_id, companies!inner(state)')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData) {
      return { success: false, error: 'User not found' };
    }

    const company_id = userData.company_id;
    const userId = userData.id;
    const companyState = (userData.companies as any)?.state || '';

    // Get goods dispatch with full details
    const { data: dispatch, error: dispatchError } = await supabase
      .from('goods_dispatches')
      .select(`
        id,
        dispatch_number,
        dispatch_date,
        dispatch_to_partner_id,
        notes,
        goods_dispatch_items!inner(
          id,
          dispatched_quantity,
          stock_units!inner(
            id,
            size_quantity,
            wastage,
            products!inner(
              id,
              name,
              material,
              color,
              cost_price_per_unit,
              selling_price_per_unit,
              hsn_code,
              sac_code
            )
          )
        )
      `)
      .eq('id', data.dispatch_id)
      .single();

    if (dispatchError || !dispatch) {
      return { success: false, error: 'Goods dispatch not found' };
    }

    // Check if invoice already exists
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id, invoice_number')
      .eq('dispatch_id', data.dispatch_id)
      .maybeSingle();

    if (existingInvoice) {
      return { success: false, error: `Invoice already exists: ${existingInvoice.invoice_number}` };
    }

    // Get customer details
    const customerId = dispatch.dispatch_to_partner_id;
    if (!customerId) {
      return { success: false, error: 'No customer assigned to dispatch' };
    }

    const { data: customer } = await supabase
      .from('partners')
      .select('id, first_name, last_name, company_name, gstin, state')
      .eq('id', customerId)
      .single();

    if (!customer) {
      return { success: false, error: 'Customer not found' };
    }

    const customerState = customer.state || '';

    // Auto-determine invoice type
    const invoiceType = customer.gstin ? 'B2B' : 'B2C';

    // Convert dispatch items to invoice items
    const invoiceItems: InvoiceItem[] = [];
    const dispatchItems = dispatch.goods_dispatch_items as any[];

    for (const dispatchItem of dispatchItems) {
      const stockUnit = dispatchItem.stock_units;
      const product = stockUnit.products;

      const quantity = dispatchItem.dispatched_quantity ||
        (stockUnit.size_quantity - stockUnit.wastage);

      const unitRate = product.selling_price_per_unit || product.cost_price_per_unit || 0;

      // Calculate GST for this item
      const itemWithGST = await calculateItemGST(
        {
          dispatch_item_id: dispatchItem.id,
          product_id: product.id,
          product_name: product.name,
          description: `${product.name}${product.material ? ' - ' + product.material : ''}${product.color ? ' (' + product.color + ')' : ''}`,
          hsn_code: product.hsn_code || null,
          sac_code: product.sac_code || null,
          unit_of_measurement: 'PCS',
          quantity,
          unit_rate: unitRate,
          discount_percent: 0,
          discount_amount: 0,
          taxable_amount: quantity * unitRate,
          line_total: quantity * unitRate,
        },
        customerState,
        companyState,
        company_id
      );

      invoiceItems.push(itemWithGST);
    }

    // Calculate totals
    const totals = calculateInvoiceTotals(invoiceItems, 0, 0);

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

    const invoiceDate = new Date().toISOString().split('T')[0];

    // Create invoice with GST compliance fields
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        company_id,
        invoice_number: invoiceNumber,
        customer_id: customerId,
        dispatch_id: data.dispatch_id,
        invoice_date: invoiceDate,
        due_date: null,
        subtotal: totals.subtotal,
        gst_amount: totals.gst_amount,
        cgst_amount: totals.cgst_amount,
        sgst_amount: totals.sgst_amount,
        igst_amount: totals.igst_amount,
        total_amount: totals.total_amount,
        discount_amount: 0,
        adjustment_amount: 0,
        notes: dispatch.notes,
        // GST Compliance
        place_of_supply: customerState,
        invoice_type: invoiceType,
        reverse_charge: false,
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
        // Status
        status: 'finalized',
        payment_status: 'unpaid',
        total_paid: 0,
        balance_due: totals.total_amount,
        finalized_at: new Date().toISOString(),
        finalized_by: userId,
      })
      .select()
      .single();

    if (invoiceError || !invoice) {
      console.error('Invoice creation error:', invoiceError);
      return { success: false, error: 'Failed to create invoice' };
    }

    // Create invoice items
    const itemsToInsert = invoiceItems.map((item) => ({
      company_id,
      invoice_id: invoice.id,
      dispatch_item_id: item.dispatch_item_id,
      product_id: item.product_id,
      description: item.description,
      hsn_code: item.hsn_code,
      sac_code: item.sac_code,
      unit_of_measurement: item.unit_of_measurement,
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
      console.error('Invoice items error:', itemsError);
      return { success: false, error: 'Failed to create invoice items' };
    }

    // Create journal entries
    try {
      await createInvoiceJournalEntry(
        invoice.id,
        customerId,
        totals,
        company_id,
        userId,
        invoiceNumber,
        invoiceDate
      );

      // Create COGS entry if linked to dispatch
      await createCOGSEntry(
        invoice.id,
        data.dispatch_id,
        company_id,
        userId,
        invoiceNumber,
        invoiceDate
      );
    } catch (journalError) {
      console.error('Journal entry error:', journalError);
      // Invoice created but journal failed - log for manual fixing
      return {
        success: false,
        error: 'Invoice created but journal entries failed. Please contact administrator.',
      };
    }

    // Revalidate paths
    revalidatePath('/dashboard/invoices');
    revalidatePath(`/dashboard/invoices/${invoice.id}`);
    revalidatePath('/dashboard/inventory/goods-dispatch');
    revalidatePath(`/dashboard/inventory/goods-dispatch/${data.dispatch_id}`);

    return {
      success: true,
      invoice_id: invoice.id,
    };
  } catch (error) {
    console.error('Error approving invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve invoice',
    };
  }
}
