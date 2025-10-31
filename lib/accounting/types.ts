/**
 * TypeScript interfaces for the accounting module
 * Phase 7 Week 2 - Core Accounting Engine
 */

/**
 * Represents a single line (debit or credit) in a journal entry
 */
export interface JournalEntryLine {
  ledger_account_id: string;
  debit_amount: number;
  credit_amount: number;
  bill_reference?: string | null;
}

/**
 * Represents a complete journal entry (transaction header)
 */
export interface JournalEntry {
  transaction_type: 'invoice' | 'purchase_invoice' | 'payment_received' | 'payment_made';
  transaction_id: string;
  entry_date: string; // ISO date format
  narration: string;
  lines: JournalEntryLine[];
  company_id: string;
  created_by: string;
}

/**
 * Result of double-entry validation
 */
export interface DoubleEntryValidation {
  valid: boolean;
  total_debit: number;
  total_credit: number;
  difference: number;
  error_message?: string;
}

/**
 * Represents a ledger account in the chart of accounts
 */
export interface LedgerAccount {
  id: string;
  name: string;
  account_group_id: string;
  account_type: 'asset' | 'liability' | 'income' | 'expense';
  current_balance: number;
  balance_type: 'debit' | 'credit';
  partner_id?: string | null;
  is_system_ledger: boolean;
  company_id: string;
}

/**
 * Result of ledger balance calculation
 */
export interface LedgerBalance {
  balance: number;
  balance_type: 'debit' | 'credit';
}

/**
 * GST calculation breakdown
 */
export interface GSTCalculation {
  cgst: number;
  sgst: number;
  igst: number;
  total_gst: number;
  total_amount: number;
}

/**
 * Partner type for ledger creation
 */
export type PartnerType = 'customer' | 'supplier';

/**
 * Transaction type for journal entries
 */
export type TransactionType = 'invoice' | 'purchase_invoice' | 'payment_received' | 'payment_made';

/**
 * Invoice status
 * Note: 'draft' kept for backward compatibility but not used in new invoices
 */
export type InvoiceStatus = 'draft' | 'finalized' | 'cancelled' | 'credited';

/**
 * Payment status
 */
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

/**
 * Invoice type for GST reporting (GSTR-1)
 */
export type InvoiceType = 'B2B' | 'B2C' | 'Export' | 'SEZ';

/**
 * Transport mode options
 */
export type TransportMode = 'Road' | 'Rail' | 'Air' | 'Ship';

/**
 * Represents a single line item in an invoice
 */
export interface InvoiceItem {
  id?: string;
  dispatch_item_id?: string | null;
  product_id: string;
  product_name?: string;
  description?: string | null;
  hsn_code?: string | null;
  sac_code?: string | null;
  unit_of_measurement?: string;
  quantity: number;
  unit_rate: number;
  discount_percent?: number;
  discount_amount?: number;
  taxable_amount: number;
  cgst_rate?: number;
  cgst_amount?: number;
  sgst_rate?: number;
  sgst_amount?: number;
  igst_rate?: number;
  igst_amount?: number;
  line_total: number;
}

/**
 * Form data for creating/editing an invoice
 * Note: Status removed - invoices are always created as 'finalized'
 */
export interface InvoiceFormData {
  customer_id: string;
  dispatch_id?: string | null;
  invoice_date: string; // ISO date format
  due_date?: string | null;
  items: InvoiceItem[];
  discount_amount?: number;
  adjustment_amount?: number;
  notes?: string | null;
  // GST Compliance
  place_of_supply?: string;
  invoice_type?: InvoiceType;
  reverse_charge?: boolean;
  // Transport Details (from goods dispatch)
  vehicle_number?: string | null;
  lr_rr_number?: string | null;
  lr_rr_date?: string | null;
  transport_mode?: TransportMode | null;
  transporter_name?: string | null;
  distance_km?: number | null;
  // E-Way Bill
  e_way_bill_number?: string | null;
  e_way_bill_date?: string | null;
}

/**
 * Complete invoice with all details
 */
export interface Invoice {
  id: string;
  company_id: string;
  invoice_number: string;
  customer_id: string;
  dispatch_id?: string | null;
  invoice_date: string;
  due_date?: string | null;
  subtotal: number;
  gst_amount: number;
  cgst_amount?: number;
  sgst_amount?: number;
  igst_amount?: number;
  total_amount: number;
  discount_amount?: number;
  adjustment_amount?: number;
  payment_status: PaymentStatus;
  status: InvoiceStatus;
  notes?: string | null;
  finalized_at?: string | null;
  finalized_by?: string | null;
  total_paid: number;
  balance_due: number;
  items?: InvoiceItem[];
  // GST Compliance fields
  place_of_supply?: string | null;
  invoice_type?: string;
  reverse_charge?: boolean;
  // E-Invoice fields
  e_invoice_irn?: string | null;
  e_invoice_ack_no?: number | null;
  e_invoice_ack_date?: string | null;
  e_invoice_qr?: string | null;
  // E-Way Bill fields
  e_way_bill_number?: string | null;
  e_way_bill_date?: string | null;
  // Transport Details
  vehicle_number?: string | null;
  lr_rr_number?: string | null;
  lr_rr_date?: string | null;
  transport_mode?: string | null;
  transporter_name?: string | null;
  distance_km?: number | null;
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Result of invoice totals calculation
 */
export interface InvoiceTotals {
  subtotal: number;
  total_discount: number;
  taxable_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  gst_amount: number;
  adjustment_amount: number;
  total_amount: number;
}

/**
 * Invoice audit log entry
 */
export interface InvoiceAuditLog {
  id: string;
  invoice_id: string;
  changed_at: string;
  changed_by: string;
  changes: Record<string, any>;
  change_type: 'created' | 'edited' | 'credited';
  created_at: string;
}
