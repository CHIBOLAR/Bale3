// Standard Goods Receipt Display Types
// These types define the consistent format for displaying goods receipts
// regardless of how they were originally stored in the database

import { GoodsReceiptLinkType } from './inventory';

// ============================================
// Standard Display Types
// ============================================

/**
 * Standard format for displaying a goods receipt in lists
 * All goods receipts will be transformed to this format for consistent display
 */
export interface StandardGoodsReceiptListItem {
  id: string;
  receipt_number: string;
  receipt_date: string;
  created_at: string;

  // Receipt type and source
  link_type: GoodsReceiptLinkType;
  link_type_display: string; // Human-readable: "Purchase", "Transfer", etc.

  // Source information (partner OR warehouse)
  source_type: 'partner' | 'warehouse' | 'none';
  source_id: string | null;
  source_name: string | null;

  // Destination warehouse
  warehouse_id: string;
  warehouse_name: string;

  // Quantities
  total_quantity: number; // Total quantity received
  total_items: number; // Number of different products
  total_stock_units: number; // Number of individual stock units created

  // Invoice details (optional)
  invoice_number: string | null;
  invoice_amount: number | null;

  // Additional info
  transport_details: string | null;
  notes: string | null;
}

/**
 * Standard format for displaying full goods receipt details
 */
export interface StandardGoodsReceiptDetail {
  // Basic information
  id: string;
  receipt_number: string;
  receipt_date: string;
  created_at: string;
  updated_at: string;

  // Type and source
  link_type: GoodsReceiptLinkType;
  link_type_display: string;

  // Source (partner OR warehouse)
  source_type: 'partner' | 'warehouse' | 'none';
  source: {
    id: string;
    name: string;
    type?: string; // For partners: 'supplier', 'customer', etc.
  } | null;

  // Destination
  warehouse: {
    id: string;
    name: string;
  };

  // Invoice details
  invoice_number: string | null;
  invoice_amount: number | null;

  // Transport and notes
  transport_details: string | null;
  notes: string | null;
  attachments: string[] | null;

  // Items received
  items: StandardGoodsReceiptItem[];

  // Stock units created
  stock_units: StandardStockUnitSummary[];

  // Summary totals
  totals: {
    total_quantity: number;
    total_items: number;
    total_stock_units: number;
    total_size: number; // Total meters/units
    total_wastage: number;
  };
}

/**
 * Standard format for goods receipt items
 */
export interface StandardGoodsReceiptItem {
  id: string;
  product: {
    id: string;
    name: string;
    product_number: string;
    material: string;
    color: string;
    measuring_unit: string;
  };
  quantity_received: number;
  notes: string | null;
}

/**
 * Standard format for stock unit summary in receipt detail
 */
export interface StandardStockUnitSummary {
  id: string;
  unit_number: string;
  qr_code: string;
  product: {
    id: string;
    name: string;
    product_number: string;
    material: string;
    color: string;
  };
  size_quantity: number;
  wastage: number;
  quality_grade: string;
  location_description: string;
  status: string;
  status_display: string;
  date_received: string;
  manufacturing_date: string;
  notes: string | null;
}

// ============================================
// Transformation Helper Types
// ============================================

/**
 * Raw database response type (what we get from Supabase)
 * This helps us transform inconsistent old data into standard format
 */
export interface RawGoodsReceiptData {
  id: string;
  receipt_number: string;
  receipt_date: string;
  link_type: GoodsReceiptLinkType;
  invoice_number?: string | null;
  invoice_amount?: number | null;
  transport_details?: string | null;
  notes?: string | null;
  attachments?: string[] | null;
  created_at: string;
  updated_at?: string;

  // Warehouse (destination)
  warehouse_id?: string;
  warehouses?: any; // Can be object or array

  // Source partner
  issued_by_partner_id?: string | null;
  partners?: any; // Can be object or array

  // Source warehouse
  issued_by_warehouse_id?: string | null;
  source_warehouses?: any; // Can be object or array
  issued_warehouse?: any; // Alternate field name

  // Items and quantities
  goods_receipt_items?: any[];
  total_quantity?: number;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Transforms link_type to human-readable display text
 */
export function formatLinkType(linkType: GoodsReceiptLinkType): string {
  const linkTypeMap: Record<GoodsReceiptLinkType, string> = {
    purchase: 'Purchase',
    transfer: 'Transfer',
    job_work_return: 'Job Work Return',
    sales_return: 'Sales Return',
    production: 'Production',
  };
  return linkTypeMap[linkType] || linkType;
}

/**
 * Transforms stock unit status to human-readable display text
 */
export function formatStockUnitStatus(status: string): string {
  const statusMap: Record<string, string> = {
    received: 'Received',
    available: 'Available',
    reserved: 'Reserved',
    dispatched: 'Dispatched',
    removed: 'Removed',
  };
  return statusMap[status] || status;
}

/**
 * Gets status badge color classes
 */
export function getStatusBadgeClass(status: string): string {
  const statusClasses: Record<string, string> = {
    received: 'bg-blue-100 text-blue-800',
    available: 'bg-green-100 text-green-800',
    reserved: 'bg-yellow-100 text-yellow-800',
    dispatched: 'bg-purple-100 text-purple-800',
    removed: 'bg-red-100 text-red-800',
  };
  return statusClasses[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Formats date for display
 */
export function formatReceiptDate(dateString: string, format: 'short' | 'long' | 'full' = 'short'): string {
  const date = new Date(dateString);

  if (format === 'short') {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  // full
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats currency for display
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '-';
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Normalizes array field from Supabase response
 * Supabase sometimes returns single object, sometimes array
 */
export function normalizeRelation<T>(data: T | T[] | null | undefined): T | null {
  if (!data) return null;
  if (Array.isArray(data)) {
    return data.length > 0 ? data[0] : null;
  }
  return data;
}
