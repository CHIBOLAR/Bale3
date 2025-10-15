// Inventory Management Types

// ============================================
// Stock Units
// ============================================

export type StockUnitStatus = 'received' | 'available' | 'reserved' | 'dispatched' | 'removed';

export interface StockUnit {
  id: string;
  company_id: string;
  product_id: string;
  warehouse_id: string;
  unit_number: string;
  qr_code: string;
  size_quantity: number;
  wastage: number;
  quality_grade: string;
  location_description: string;
  status: StockUnitStatus;
  date_received: string; // Date string
  manufacturing_date: string; // Date string
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  modified_by: string | null;
  deleted_at: string | null;
}

export interface StockUnitWithRelations extends StockUnit {
  products: {
    id: string;
    name: string;
    material: string;
    color: string;
    product_number: string;
  };
  warehouses: {
    id: string;
    name: string;
  };
}

export interface CreateStockUnitInput {
  product_id: string;
  warehouse_id: string;
  size_quantity: number;
  wastage: number;
  quality_grade: string;
  location_description: string;
  status: StockUnitStatus;
  manufacturing_date: string;
  notes?: string;
}

// ============================================
// Goods Receipt
// ============================================

export type GoodsReceiptLinkType = 'purchase' | 'transfer' | 'job_work_return' | 'sales_return' | 'production';

export interface GoodsReceipt {
  id: string;
  company_id: string;
  warehouse_id: string;
  receipt_number: string;
  issued_by_partner_id: string | null;
  issued_by_warehouse_id: string | null;
  agent_id: string | null;
  link_type: GoodsReceiptLinkType;
  sales_order_id: string | null;
  job_work_id: string | null;
  receipt_date: string; // Date string
  invoice_number: string | null;
  invoice_amount: number | null;
  transport_details: string | null;
  notes: string | null;
  attachments: string[] | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  modified_by: string | null;
  deleted_at: string | null;
}

export interface GoodsReceiptWithRelations extends GoodsReceipt {
  warehouses: {
    id: string;
    name: string;
  };
  partners?: {
    id: string;
    company_name: string;
    partner_type: string;
  };
  issued_warehouse?: {
    id: string;
    name: string;
  };
}

export interface CreateGoodsReceiptInput {
  warehouse_id: string;
  issued_by_partner_id?: string;
  issued_by_warehouse_id?: string;
  agent_id?: string;
  link_type: GoodsReceiptLinkType;
  receipt_date: string;
  invoice_number?: string;
  invoice_amount?: number;
  transport_details?: string;
  notes?: string;
  attachments?: string[];
}

// ============================================
// Goods Receipt Items
// ============================================

export interface GoodsReceiptItem {
  id: string;
  company_id: string;
  receipt_id: string;
  product_id: string;
  quantity_received: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoodsReceiptItemWithRelations extends GoodsReceiptItem {
  products: {
    id: string;
    name: string;
    material: string;
    color: string;
    product_number: string;
  };
}

export interface CreateGoodsReceiptItemInput {
  product_id: string;
  quantity_received: number;
  notes?: string;
  // Stock unit details for each unit (same length as quantity_received)
  stock_unit_details: CreateStockUnitInput[];
}

// ============================================
// Combined Types for Form Handling
// ============================================

export interface GoodsReceiptFormData extends CreateGoodsReceiptInput {
  items: CreateGoodsReceiptItemInput[];
}

export interface StockUnitFormData {
  size_quantity: number;
  wastage: number;
  quality_grade: string;
  location_description: string;
  manufacturing_date: string;
  notes?: string;
}

export interface SpecificationItem extends StockUnitFormData {
  quantity: number; // Number of rolls with this identical specification
}

export interface ProductSelectionItem {
  product_id: string;
  product_name: string;
  fabric_type: string;
  color: string;
  product_number: string;
  specifications: SpecificationItem[]; // Multiple batches with different specs
}

// ============================================
// List/Filter Types
// ============================================

export interface StockUnitFilters {
  warehouse_id?: string;
  status?: StockUnitStatus;
  search?: string; // Search by barcode, product name, unit number
  product_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface GoodsReceiptFilters {
  warehouse_id?: string;
  partner_id?: string;
  link_type?: GoodsReceiptLinkType;
  date_from?: string;
  date_to?: string;
  search?: string; // Search by receipt number, invoice number
}

// ============================================
// Goods Dispatch
// ============================================

export type GoodsDispatchLinkType = 'sales_order' | 'job_work' | 'purchase_return' | 'other';
export type GoodsDispatchStatus = 'pending' | 'in_transit' | 'delivered' | 'cancelled';

export interface GoodsDispatch {
  id: string;
  company_id: string;
  warehouse_id: string;
  dispatch_number: string;
  dispatch_to_partner_id: string | null;
  dispatch_to_warehouse_id: string | null;
  agent_id: string | null;
  link_type: GoodsDispatchLinkType;
  sales_order_id: string | null;
  job_work_id: string | null;
  dispatch_date: string; // Date string
  due_date: string | null; // Date string
  invoice_number: string | null;
  invoice_amount: number | null;
  transport_details: string | null;
  status: GoodsDispatchStatus;
  notes: string | null;
  attachments: string[] | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  modified_by: string | null;
  deleted_at: string | null;
}

export interface GoodsDispatchWithRelations extends GoodsDispatch {
  warehouses: {
    id: string;
    name: string;
  };
  dispatch_to_partner?: {
    id: string;
    company_name: string;
    partner_type: string;
  };
  dispatch_to_warehouse?: {
    id: string;
    name: string;
  };
  agents?: {
    id: string;
    name: string;
  };
}

export interface CreateGoodsDispatchInput {
  warehouse_id: string;
  dispatch_to_partner_id?: string;
  dispatch_to_warehouse_id?: string;
  agent_id?: string;
  link_type: GoodsDispatchLinkType;
  sales_order_id?: string;
  job_work_id?: string;
  dispatch_date: string;
  due_date?: string;
  invoice_number?: string;
  invoice_amount?: number;
  transport_details?: string;
  status?: GoodsDispatchStatus;
  notes?: string;
  attachments?: string[];
}

// ============================================
// Goods Dispatch Items
// ============================================

export interface GoodsDispatchItem {
  id: string;
  company_id: string;
  dispatch_id: string;
  stock_unit_id: string;
  created_at: string;
  updated_at: string;
}

export interface GoodsDispatchItemWithRelations extends GoodsDispatchItem {
  stock_units: StockUnitWithRelations;
}

// ============================================
// Combined Types for Dispatch Form Handling
// ============================================

export interface GoodsDispatchFormData extends CreateGoodsDispatchInput {
  stock_unit_ids: string[];
}

export interface SelectedStockUnitItem extends StockUnitWithRelations {
  // Extended properties for dispatch UI
  selected_quantity?: number; // For partial dispatch (if needed)
}

// ============================================
// Dispatch Filters
// ============================================

export interface GoodsDispatchFilters {
  warehouse_id?: string;
  partner_id?: string;
  status?: GoodsDispatchStatus;
  link_type?: GoodsDispatchLinkType;
  date_from?: string;
  date_to?: string;
  search?: string; // Search by dispatch number, invoice number
}

// ============================================
// QR Code / Barcode Batches
// ============================================

export type BarcodeBatchStatus = 'pending' | 'generating' | 'completed' | 'failed';

export interface LabelLayoutConfig {
  paperSize?: string; // A4, Letter, etc.
  labelWidth?: number; // in mm
  labelHeight?: number; // in mm
  marginTop?: number;
  marginLeft?: number;
  spacing?: number;
  qrSize?: number; // QR code size
  fontSize?: number;
  labelsPerRow?: number;
  labelsPerColumn?: number;
}

export interface BarcodeBatch {
  id: string;
  company_id: string;
  warehouse_id: string;
  batch_name: string;
  layout_config: LabelLayoutConfig;
  fields_selected: string[]; // Array of field names to display on label
  pdf_url: string | null;
  status: BarcodeBatchStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
  modified_by: string | null;
}

export interface BarcodeBatchWithRelations extends BarcodeBatch {
  warehouses: {
    id: string;
    name: string;
  };
  items_count?: number; // Number of stock units in batch
}

export interface BarcodeBatchItem {
  id: string;
  batch_id: string;
  stock_unit_id: string;
  barcode_generated_at: string | null;
}

export interface BarcodeBatchItemWithRelations extends BarcodeBatchItem {
  stock_units: StockUnitWithRelations;
}

export interface CreateBarcodeBatchInput {
  warehouse_id: string;
  batch_name: string;
  layout_config?: LabelLayoutConfig;
  fields_selected: string[];
  stock_unit_ids: string[];
}

// ============================================
// QR Code Label Field Options
// ============================================

export interface QRLabelFieldOption {
  id: string;
  label: string;
  category: 'product' | 'stock_unit';
}

export const PRODUCT_LABEL_FIELDS: QRLabelFieldOption[] = [
  { id: 'product_name', label: 'Product name', category: 'product' },
  { id: 'product_number', label: 'Product number', category: 'product' },
  { id: 'hsn_code', label: 'HSN code', category: 'product' },
  { id: 'material', label: 'Material', category: 'product' },
  { id: 'color', label: 'Color', category: 'product' },
  { id: 'gsm', label: 'GSM', category: 'product' },
  { id: 'sale_price', label: 'Sale price', category: 'product' },
];

export const STOCK_UNIT_LABEL_FIELDS: QRLabelFieldOption[] = [
  { id: 'unit_number', label: 'Unit number', category: 'stock_unit' },
  { id: 'made_on', label: 'Made on', category: 'stock_unit' },
  { id: 'size', label: 'Size', category: 'stock_unit' },
  { id: 'wastage', label: 'Wastage', category: 'stock_unit' },
  { id: 'quality_grade', label: 'Quality', category: 'stock_unit' },
  { id: 'location', label: 'Location', category: 'stock_unit' },
];

// ============================================
// QR Code Generation Types
// ============================================

export interface StockUnitQRStatus {
  stock_unit_id: string;
  has_qr: boolean;
  batch_id?: string;
  generated_at?: string;
}

export interface ProductQRSummary {
  product_id: string;
  product_name: string;
  total_units: number;
  qr_pending_count: number;
  qr_generated_count: number;
  last_added_date: string;
}
