/**
 * Invoice accounting functions
 * Phase 7 Week 3 Part 1 - Invoice Creation
 */

import { createClient } from '@/lib/supabase/server';
import { createJournalEntry } from './core';
import { calculateGST, getGSTRate } from './gst';
import { getOrCreateLedger } from './ledger';
import type {
  InvoiceItem,
  InvoiceTotals,
  JournalEntryLine
} from './types';

/**
 * Calculate invoice totals from line items
 */
export function calculateInvoiceTotals(
  items: InvoiceItem[],
  invoiceDiscountAmount: number = 0,
  adjustmentAmount: number = 0
): InvoiceTotals {
  // Calculate subtotal (sum of all line item quantities * unit rates)
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_rate);
  }, 0);

  // Calculate total line-level discounts
  const lineDiscounts = items.reduce((sum, item) => {
    return sum + (item.discount_amount || 0);
  }, 0);

  // Total discount = line discounts + invoice-level discount
  const total_discount = lineDiscounts + invoiceDiscountAmount;

  // Taxable amount = subtotal - discounts
  const taxable_amount = subtotal - total_discount;

  // Sum GST amounts from items
  const cgst_amount = items.reduce((sum, item) => sum + (item.cgst_amount || 0), 0);
  const sgst_amount = items.reduce((sum, item) => sum + (item.sgst_amount || 0), 0);
  const igst_amount = items.reduce((sum, item) => sum + (item.igst_amount || 0), 0);
  const gst_amount = cgst_amount + sgst_amount + igst_amount;

  // Total amount = taxable amount + GST + adjustments
  const total_amount = taxable_amount + gst_amount + adjustmentAmount;

  return {
    subtotal,
    total_discount,
    taxable_amount,
    cgst_amount,
    sgst_amount,
    igst_amount,
    gst_amount,
    adjustment_amount: adjustmentAmount,
    total_amount,
  };
}

/**
 * Calculate GST for a single invoice item
 */
export async function calculateItemGST(
  item: Omit<InvoiceItem, 'cgst_rate' | 'cgst_amount' | 'sgst_rate' | 'sgst_amount' | 'igst_rate' | 'igst_amount'>,
  customerState: string,
  companyState: string,
  companyId: string,
  gstRate?: number
): Promise<InvoiceItem> {
  // Get GST rate if not provided
  const rate = gstRate || await getGSTRate(companyId);

  // Calculate taxable amount (quantity * unit_rate - discount)
  const taxableAmount = (item.quantity * item.unit_rate) - (item.discount_amount || 0);

  // Calculate GST
  const gst = calculateGST(taxableAmount, customerState, companyState, rate);

  // Return complete item with GST
  return {
    ...item,
    taxable_amount: taxableAmount,
    cgst_rate: gst.cgst > 0 ? rate / 2 : 0,
    cgst_amount: gst.cgst,
    sgst_rate: gst.sgst > 0 ? rate / 2 : 0,
    sgst_amount: gst.sgst,
    igst_rate: gst.igst > 0 ? rate : 0,
    igst_amount: gst.igst,
    line_total: taxableAmount + gst.total_gst,
  };
}

/**
 * Create journal entry for a finalized invoice
 *
 * Dr: Customer (Sundry Debtors) - Total Amount
 * Cr: Sales - Taxable Amount
 * Cr: CGST Output - CGST Amount (if intra-state)
 * Cr: SGST Output - SGST Amount (if intra-state)
 * Cr: IGST Output - IGST Amount (if inter-state)
 */
export async function createInvoiceJournalEntry(
  invoiceId: string,
  customerId: string,
  totals: InvoiceTotals,
  companyId: string,
  userId: string,
  invoiceNumber: string,
  invoiceDate: string
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

  // Get system ledgers
  const { data: ledgers } = await supabase
    .from('ledger_accounts')
    .select('id, name')
    .eq('company_id', companyId)
    .eq('is_system_ledger', true)
    .in('name', ['Sales', 'CGST Output', 'SGST Output', 'IGST Output']);

  if (!ledgers) {
    throw new Error('System ledgers not found');
  }

  const salesLedger = ledgers.find((l) => l.name === 'Sales');
  const cgstLedger = ledgers.find((l) => l.name === 'CGST Output');
  const sgstLedger = ledgers.find((l) => l.name === 'SGST Output');
  const igstLedger = ledgers.find((l) => l.name === 'IGST Output');

  if (!salesLedger) {
    throw new Error('Sales ledger not found');
  }

  // Build journal entry lines
  const lines: JournalEntryLine[] = [];

  // Dr: Customer
  lines.push({
    ledger_account_id: customerLedger.id,
    debit_amount: totals.total_amount,
    credit_amount: 0,
    bill_reference: invoiceNumber,
  });

  // Cr: Sales
  lines.push({
    ledger_account_id: salesLedger.id,
    debit_amount: 0,
    credit_amount: totals.taxable_amount,
  });

  // Cr: CGST Output (if applicable)
  if (totals.cgst_amount > 0 && cgstLedger) {
    lines.push({
      ledger_account_id: cgstLedger.id,
      debit_amount: 0,
      credit_amount: totals.cgst_amount,
    });
  }

  // Cr: SGST Output (if applicable)
  if (totals.sgst_amount > 0 && sgstLedger) {
    lines.push({
      ledger_account_id: sgstLedger.id,
      debit_amount: 0,
      credit_amount: totals.sgst_amount,
    });
  }

  // Cr: IGST Output (if applicable)
  if (totals.igst_amount > 0 && igstLedger) {
    lines.push({
      ledger_account_id: igstLedger.id,
      debit_amount: 0,
      credit_amount: totals.igst_amount,
    });
  }

  // Create journal entry
  const journalEntryId = await createJournalEntry({
    transaction_type: 'invoice',
    transaction_id: invoiceId,
    entry_date: invoiceDate,
    narration: `Invoice ${invoiceNumber}`,
    lines,
    company_id: companyId,
    created_by: userId,
  });

  return journalEntryId;
}

/**
 * Create COGS (Cost of Goods Sold) journal entry for invoice
 *
 * Dr: Cost of Goods Sold - Total Cost
 * Cr: Inventory - Total Cost
 *
 * Cost is calculated from stock_units.cost_price_per_unit (or product.cost_price_per_unit as fallback)
 */
export async function createCOGSEntry(
  invoiceId: string,
  dispatchId: string,
  companyId: string,
  userId: string,
  invoiceNumber: string,
  invoiceDate: string
): Promise<string | null> {
  const supabase = await createClient();

  // Get dispatch items with stock unit cost
  const { data: dispatchItems } = await supabase
    .from('goods_dispatch_items')
    .select(`
      id,
      stock_unit_id,
      dispatched_quantity,
      stock_units!inner(
        id,
        product_id,
        size_quantity,
        products!inner(
          cost_price_per_unit
        )
      )
    `)
    .eq('dispatch_id', dispatchId);

  if (!dispatchItems || dispatchItems.length === 0) {
    console.warn('No dispatch items found for COGS calculation');
    return null;
  }

  // Calculate total COGS
  let totalCost = 0;
  for (const item of dispatchItems) {
    const quantity = item.dispatched_quantity || 0;
    const costPerUnit = (item.stock_units as any)?.products?.cost_price_per_unit || 0;
    totalCost += quantity * costPerUnit;
  }

  // If no cost, skip COGS entry
  if (totalCost === 0) {
    console.warn('Total cost is zero, skipping COGS entry');
    return null;
  }

  // Get system ledgers
  const { data: ledgers } = await supabase
    .from('ledger_accounts')
    .select('id, name')
    .eq('company_id', companyId)
    .eq('is_system_ledger', true)
    .in('name', ['Cost of Goods Sold', 'Inventory']);

  if (!ledgers || ledgers.length < 2) {
    throw new Error('COGS or Inventory ledger not found');
  }

  const cogsLedger = ledgers.find((l) => l.name === 'Cost of Goods Sold');
  const inventoryLedger = ledgers.find((l) => l.name === 'Inventory');

  if (!cogsLedger || !inventoryLedger) {
    throw new Error('COGS or Inventory ledger not found');
  }

  // Build journal entry lines
  const lines: JournalEntryLine[] = [
    {
      ledger_account_id: cogsLedger.id,
      debit_amount: totalCost,
      credit_amount: 0,
    },
    {
      ledger_account_id: inventoryLedger.id,
      debit_amount: 0,
      credit_amount: totalCost,
    },
  ];

  // Create journal entry
  const journalEntryId = await createJournalEntry({
    transaction_type: 'invoice',
    transaction_id: invoiceId,
    entry_date: invoiceDate,
    narration: `COGS for Invoice ${invoiceNumber}`,
    lines,
    company_id: companyId,
    created_by: userId,
  });

  return journalEntryId;
}

/**
 * Create journal entry for credit note
 * Reverses the original invoice journal entries
 *
 * Original Invoice:
 * Dr: Customer (Accounts Receivable)
 * Cr: Sales
 * Cr: GST Output
 *
 * Credit Note (Reversal):
 * Dr: Sales (reverses revenue)
 * Dr: GST Output (reverses tax liability)
 * Cr: Customer (reduces receivable)
 */
export async function createCreditNoteJournalEntry(
  creditNoteId: string,
  customerId: string,
  totals: InvoiceTotals,
  companyId: string,
  userId: string,
  creditNoteNumber: string,
  creditNoteDate: string
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

  // Get system ledgers
  const { data: ledgers } = await supabase
    .from('ledger_accounts')
    .select('id, name')
    .eq('company_id', companyId)
    .eq('is_system_ledger', true)
    .in('name', ['Sales', 'CGST Output', 'SGST Output', 'IGST Output']);

  if (!ledgers) {
    throw new Error('System ledgers not found');
  }

  const salesLedger = ledgers.find((l) => l.name === 'Sales');
  const cgstLedger = ledgers.find((l) => l.name === 'CGST Output');
  const sgstLedger = ledgers.find((l) => l.name === 'SGST Output');
  const igstLedger = ledgers.find((l) => l.name === 'IGST Output');

  if (!salesLedger) {
    throw new Error('Sales ledger not found');
  }

  // Build journal entry lines (REVERSED from invoice)
  // Use absolute values of the negative amounts
  const lines: JournalEntryLine[] = [];

  // Dr: Sales (reverses revenue - use absolute value)
  lines.push({
    ledger_account_id: salesLedger.id,
    debit_amount: Math.abs(totals.taxable_amount),
    credit_amount: 0,
  });

  // Dr: CGST Output (reverses tax liability - use absolute value)
  if (totals.cgst_amount !== 0 && cgstLedger) {
    lines.push({
      ledger_account_id: cgstLedger.id,
      debit_amount: Math.abs(totals.cgst_amount),
      credit_amount: 0,
    });
  }

  // Dr: SGST Output (reverses tax liability - use absolute value)
  if (totals.sgst_amount !== 0 && sgstLedger) {
    lines.push({
      ledger_account_id: sgstLedger.id,
      debit_amount: Math.abs(totals.sgst_amount),
      credit_amount: 0,
    });
  }

  // Dr: IGST Output (reverses tax liability - use absolute value)
  if (totals.igst_amount !== 0 && igstLedger) {
    lines.push({
      ledger_account_id: igstLedger.id,
      debit_amount: Math.abs(totals.igst_amount),
      credit_amount: 0,
    });
  }

  // Cr: Customer (reduces accounts receivable - use absolute value)
  lines.push({
    ledger_account_id: customerLedger.id,
    debit_amount: 0,
    credit_amount: Math.abs(totals.total_amount),
    bill_reference: creditNoteNumber,
  });

  // Create journal entry
  const journalEntryId = await createJournalEntry({
    transaction_type: 'invoice',
    transaction_id: creditNoteId,
    entry_date: creditNoteDate,
    narration: `Credit Note ${creditNoteNumber}`,
    lines,
    company_id: companyId,
    created_by: userId,
  });

  return journalEntryId;
}
