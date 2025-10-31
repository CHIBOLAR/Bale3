'use server';

/**
 * Server action to generate invoice preview from goods dispatch
 * Auto-populates HSN codes, GST breakdown, transport details
 * Returns preview data without saving to database
 */

import { createClient } from '@/lib/supabase/server';
import { calculateItemGST } from '@/lib/accounting/invoice';
import type { InvoiceItem } from '@/lib/accounting/types';
import type { InvoicePDFData } from '@/lib/utils/invoice-pdf';

interface InvoicePreviewData extends InvoicePDFData {
  // Additional data for the preview form
  customer_id: string;
  dispatch_id: string;
  items_with_metadata: InvoiceItem[];
}

export async function generateInvoicePreview(dispatchId: string): Promise<{
  success: boolean;
  data?: InvoicePreviewData;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get current user and company
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: userData } = await supabase
      .from('users')
      .select('company_id, companies!inner(name, address_line1, address_line2, city, state, country, pin_code, gst_number, phone, email)')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData) {
      return { success: false, error: 'User data not found' };
    }

    const companyId = userData.company_id;
    const companyData = userData.companies as any;

    // Validate company_id exists
    if (!companyId) {
      console.error('Missing company_id for user:', user.id);
      return { success: false, error: 'User is not assigned to a company. Please contact administrator.' };
    }

    // Validate company data exists
    if (!companyData) {
      console.error('Missing company data for company_id:', companyId);
      return { success: false, error: 'Company information not found. Please contact administrator.' };
    }

    // Build company address from separate fields
    const addressParts = [
      companyData.address_line1,
      companyData.address_line2,
      companyData.city,
      companyData.state,
      companyData.country,
      companyData.pin_code,
    ].filter(Boolean);

    const companyAddress = addressParts.join(', ');
    const companyState = companyData.state || '';
    const companyGSTIN = companyData.gst_number || null;

    // Get goods dispatch with full details
    const { data: dispatch, error: dispatchError } = await supabase
      .from('goods_dispatches')
      .select(`
        id,
        dispatch_number,
        dispatch_date,
        dispatch_to_partner_id,
        vehicle_number,
        lr_rr_number,
        lr_rr_date,
        transport_mode,
        transporter_name,
        distance_km,
        e_way_bill_required,
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
      .eq('id', dispatchId)
      .single();

    if (dispatchError || !dispatch) {
      return { success: false, error: 'Goods dispatch not found' };
    }

    // Check if invoice already exists
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id, invoice_number')
      .eq('dispatch_id', dispatchId)
      .maybeSingle();

    if (existingInvoice) {
      return { success: false, error: `Invoice already exists: ${existingInvoice.invoice_number}` };
    }

    // Get customer details with GST info
    const customerId = dispatch.dispatch_to_partner_id;
    if (!customerId) {
      return { success: false, error: 'No customer assigned to dispatch' };
    }

    const { data: customer } = await supabase
      .from('partners')
      .select('id, first_name, last_name, company_name, gstin, state, billing_address, customer_type')
      .eq('id', customerId)
      .single();

    if (!customer) {
      return { success: false, error: 'Customer not found' };
    }

    const customerName = customer.company_name || `${customer.first_name} ${customer.last_name}`;
    const customerState = customer.state || '';

    // Auto-determine invoice type based on GSTIN
    const invoiceType = customer.gstin ? 'B2B' : 'B2C';

    // Convert dispatch items to invoice items with auto-populated HSN and GST
    const invoiceItems: InvoiceItem[] = [];
    const dispatchItems = dispatch.goods_dispatch_items as any[];

    for (const dispatchItem of dispatchItems) {
      const stockUnit = dispatchItem.stock_units;
      const product = stockUnit.products;

      const quantity = dispatchItem.dispatched_quantity ||
        (stockUnit.size_quantity - stockUnit.wastage);

      const unitRate = product.selling_price_per_unit || product.cost_price_per_unit || 0;

      // Auto-populate HSN/SAC from product
      const hsnCode = product.hsn_code || null;
      const sacCode = product.sac_code || null;

      // Calculate GST for this item
      const itemWithGST = await calculateItemGST(
        {
          dispatch_item_id: dispatchItem.id,
          product_id: product.id,
          product_name: product.name,
          description: `${product.name}${product.material ? ' - ' + product.material : ''}${product.color ? ' (' + product.color + ')' : ''}`,
          hsn_code: hsnCode,
          sac_code: sacCode,
          unit_of_measurement: 'PCS', // Default, can be made configurable
          quantity,
          unit_rate: unitRate,
          discount_percent: 0,
          discount_amount: 0,
          taxable_amount: quantity * unitRate,
          line_total: quantity * unitRate,
        },
        customerState,
        companyState,
        companyId
      );

      invoiceItems.push(itemWithGST);
    }

    // Calculate totals
    const subtotal = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unit_rate), 0);
    const totalDiscount = 0; // Can be added by accountant
    const taxableAmount = subtotal - totalDiscount;
    const cgstTotal = invoiceItems.reduce((sum, item) => sum + (item.cgst_amount || 0), 0);
    const sgstTotal = invoiceItems.reduce((sum, item) => sum + (item.sgst_amount || 0), 0);
    const igstTotal = invoiceItems.reduce((sum, item) => sum + (item.igst_amount || 0), 0);
    const totalAmount = taxableAmount + cgstTotal + sgstTotal + igstTotal;

    // Build preview data
    const previewData: InvoicePreviewData = {
      // Invoice info (will be generated on approval)
      invoice_number: 'PREVIEW', // Temporary, will be auto-generated on save
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: null,

      // Company info
      company: {
        name: companyData.name,
        address: companyAddress,
        gstin: companyGSTIN || undefined,
        phone: companyData.phone || undefined,
        email: companyData.email || undefined,
        state: companyState,
      },

      // Customer info
      customer: {
        name: customerName,
        address: customer.billing_address,
        gstin: customer.gstin,
        state: customerState,
      },

      // Items
      items: invoiceItems.map(item => ({
        description: item.description || '',
        hsn_code: item.hsn_code || undefined,
        sac_code: item.sac_code || undefined,
        unit_of_measurement: item.unit_of_measurement,
        quantity: item.quantity,
        unit_rate: item.unit_rate,
        discount_amount: item.discount_amount,
        taxable_amount: item.taxable_amount,
        cgst_rate: item.cgst_rate,
        cgst_amount: item.cgst_amount,
        sgst_rate: item.sgst_rate,
        sgst_amount: item.sgst_amount,
        igst_rate: item.igst_rate,
        igst_amount: item.igst_amount,
        line_total: item.line_total,
      })),

      // Totals
      subtotal,
      total_discount: totalDiscount,
      taxable_amount: taxableAmount,
      cgst_total: cgstTotal,
      sgst_total: sgstTotal,
      igst_total: igstTotal,
      adjustment_amount: 0,
      total_amount: totalAmount,

      // GST Compliance (auto-populated)
      place_of_supply: customerState,
      invoice_type: invoiceType,
      reverse_charge: false,

      // Transport details (from dispatch)
      vehicle_number: dispatch.vehicle_number,
      lr_rr_number: dispatch.lr_rr_number,
      lr_rr_date: dispatch.lr_rr_date,
      transport_mode: dispatch.transport_mode,
      transporter_name: dispatch.transporter_name,
      distance_km: dispatch.distance_km,

      // E-Way Bill (to be added by accountant if required)
      e_way_bill_number: undefined,
      e_way_bill_date: undefined,

      // E-Invoice (not generated yet)
      e_invoice_irn: undefined,
      e_invoice_qr: undefined,

      // Notes
      notes: dispatch.notes,
      is_credit_note: false,

      // Additional metadata for preview form
      customer_id: customerId,
      dispatch_id: dispatchId,
      items_with_metadata: invoiceItems,
    };

    return {
      success: true,
      data: previewData,
    };
  } catch (error) {
    console.error('Error generating invoice preview:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate invoice preview',
    };
  }
}
