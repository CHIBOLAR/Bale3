/**
 * Centralized Goods Receipt Queries
 * All goods receipt queries should use these functions to ensure consistent data format
 */

import { createClient } from '@/lib/supabase/server';
import {
  StandardGoodsReceiptListItem,
  StandardGoodsReceiptDetail,
  StandardGoodsReceiptItem,
  StandardStockUnitSummary,
  RawGoodsReceiptData,
  formatLinkType,
  formatStockUnitStatus,
  normalizeRelation,
} from '@/lib/types/goods-receipt';

// ============================================
// Transformation Functions
// ============================================

/**
 * Transforms raw database data to standard list item format
 * Handles inconsistencies in old vs new data
 */
function transformToListItem(raw: RawGoodsReceiptData): StandardGoodsReceiptListItem {
  // Normalize relations (handle array or object)
  const warehouse = normalizeRelation(raw.warehouses);
  const partner = normalizeRelation(raw.partners);
  const sourceWarehouse = normalizeRelation(raw.source_warehouses || raw.issued_warehouse);

  // Determine source type and name
  let sourceType: 'partner' | 'warehouse' | 'none' = 'none';
  let sourceId: string | null = null;
  let sourceName: string | null = null;

  if (partner) {
    sourceType = 'partner';
    sourceId = partner.id;
    sourceName = partner.company_name;
  } else if (sourceWarehouse) {
    sourceType = 'warehouse';
    sourceId = sourceWarehouse.id;
    sourceName = sourceWarehouse.name;
  }

  // Calculate totals from items if available
  const items = raw.goods_receipt_items || [];
  const totalQuantity = raw.total_quantity || items.reduce((sum: number, item: any) => sum + (item.quantity_received || 0), 0);
  const totalItems = items.length;

  return {
    id: raw.id,
    receipt_number: raw.receipt_number,
    receipt_date: raw.receipt_date,
    created_at: raw.created_at,

    link_type: raw.link_type,
    link_type_display: formatLinkType(raw.link_type),

    source_type: sourceType,
    source_id: sourceId,
    source_name: sourceName,

    warehouse_id: raw.warehouse_id || warehouse?.id || '',
    warehouse_name: warehouse?.name || 'Unknown Warehouse',

    total_quantity: totalQuantity,
    total_items: totalItems,
    total_stock_units: 0, // Will be calculated separately if needed

    invoice_number: raw.invoice_number || null,
    invoice_amount: raw.invoice_amount || null,

    transport_details: raw.transport_details || null,
    notes: raw.notes || null,
  };
}

/**
 * Transforms receipt items to standard format
 */
function transformReceiptItems(items: any[]): StandardGoodsReceiptItem[] {
  return items.map((item) => {
    const product = normalizeRelation(item.products);
    return {
      id: item.id,
      product: {
        id: product?.id || '',
        name: product?.name || 'Unknown Product',
        product_number: product?.product_number || '',
        material: product?.material || '',
        color: product?.color || '',
        measuring_unit: product?.measuring_unit || 'mtr',
      },
      quantity_received: item.quantity_received || 0,
      notes: item.notes || null,
    };
  });
}

/**
 * Transforms stock units to standard summary format
 */
function transformStockUnits(units: any[]): StandardStockUnitSummary[] {
  return units.map((unit) => {
    const product = normalizeRelation(unit.products);
    return {
      id: unit.id,
      unit_number: unit.unit_number,
      qr_code: unit.qr_code,
      product: {
        id: product?.id || '',
        name: product?.name || 'Unknown Product',
        product_number: product?.product_number || '',
        material: product?.material || '',
        color: product?.color || '',
      },
      size_quantity: unit.size_quantity || 0,
      wastage: unit.wastage || 0,
      quality_grade: unit.quality_grade || 'Standard',
      location_description: unit.location_description || 'Warehouse',
      status: unit.status,
      status_display: formatStockUnitStatus(unit.status),
      date_received: unit.date_received,
      manufacturing_date: unit.manufacturing_date,
      notes: unit.notes || null,
    };
  });
}

// ============================================
// Query Functions
// ============================================

/**
 * Get all goods receipts as standardized list items
 * Supports pagination and filtering
 */
export async function getStandardGoodsReceiptsList(options?: {
  companyId?: string;
  page?: number;
  pageSize?: number;
  warehouseId?: string;
  linkType?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}): Promise<{
  receipts: StandardGoodsReceiptListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}> {
  const supabase = await createClient();

  // Get company_id if not provided
  let companyId = options?.companyId;
  if (!companyId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData?.company_id) throw new Error('Company not found');
    companyId = userData.company_id;
  }

  const page = options?.page || 1;
  const pageSize = options?.pageSize || 25;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  // Build query
  let query = supabase
    .from('goods_receipts')
    .select(
      `
      id,
      receipt_number,
      receipt_date,
      link_type,
      invoice_number,
      invoice_amount,
      transport_details,
      notes,
      created_at,
      warehouse_id,
      issued_by_partner_id,
      issued_by_warehouse_id,
      warehouses!warehouse_id (id, name),
      partners:issued_by_partner_id (id, company_name),
      source_warehouses:issued_by_warehouse_id (id, name)
    `,
      { count: 'exact' }
    )
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('receipt_date', { ascending: false })
    .range(start, end);

  // Apply filters
  if (options?.warehouseId) {
    query = query.eq('warehouse_id', options.warehouseId);
  }
  if (options?.linkType) {
    query = query.eq('link_type', options.linkType);
  }
  if (options?.dateFrom) {
    query = query.gte('receipt_date', options.dateFrom);
  }
  if (options?.dateTo) {
    query = query.lte('receipt_date', options.dateTo);
  }
  if (options?.search) {
    query = query.or(
      `receipt_number.ilike.%${options.search}%,invoice_number.ilike.%${options.search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching receipts:', error);
    throw error;
  }

  // Fetch quantities separately for performance
  const receiptIds = data?.map((r) => r.id) || [];
  let quantityMap = new Map<string, number>();

  if (receiptIds.length > 0) {
    const { data: itemCounts } = await supabase
      .from('goods_receipt_items')
      .select('receipt_id, quantity_received')
      .in('receipt_id', receiptIds);

    if (itemCounts) {
      itemCounts.forEach((item) => {
        const current = quantityMap.get(item.receipt_id) || 0;
        quantityMap.set(item.receipt_id, current + (item.quantity_received || 0));
      });
    }
  }

  // Transform to standard format
  const receipts = (data || []).map((raw) => {
    const standardReceipt = transformToListItem(raw);
    // Override total_quantity with calculated value
    standardReceipt.total_quantity = quantityMap.get(raw.id) || 0;
    return standardReceipt;
  });

  return {
    receipts,
    totalCount: count || 0,
    page,
    pageSize,
  };
}

/**
 * Get a single goods receipt with full details in standardized format
 */
export async function getStandardGoodsReceiptDetail(
  receiptId: string,
  companyId?: string
): Promise<StandardGoodsReceiptDetail | null> {
  const supabase = await createClient();

  // Get company_id if not provided
  if (!companyId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData?.company_id) throw new Error('Company not found');
    companyId = userData.company_id;
  }

  // Fetch receipt with relations
  const { data: receipt, error: receiptError } = await supabase
    .from('goods_receipts')
    .select(
      `
      *,
      warehouses!warehouse_id (id, name),
      partners:issued_by_partner_id (id, company_name, partner_type),
      source_warehouses:issued_by_warehouse_id (id, name)
    `
    )
    .eq('id', receiptId)
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .single();

  if (receiptError || !receipt) {
    console.error('Error fetching receipt:', receiptError);
    return null;
  }

  // Fetch receipt items
  const { data: items, error: itemsError } = await supabase
    .from('goods_receipt_items')
    .select(
      `
      id,
      quantity_received,
      notes,
      products (id, name, product_number, material, color, measuring_unit)
    `
    )
    .eq('receipt_id', receiptId)
    .eq('company_id', companyId);

  if (itemsError) {
    console.error('Error fetching items:', itemsError);
  }

  // Fetch stock units
  const itemIds = (items || []).map((item) => item.id);
  const { data: stockUnits, error: unitsError } = await supabase
    .from('stock_units')
    .select(
      `
      id,
      unit_number,
      qr_code,
      size_quantity,
      wastage,
      quality_grade,
      location_description,
      status,
      date_received,
      manufacturing_date,
      notes,
      products (id, name, product_number, material, color)
    `
    )
    .in('receipt_item_id', itemIds.length > 0 ? itemIds : ['00000000-0000-0000-0000-000000000000'])
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('unit_number');

  if (unitsError) {
    console.error('Error fetching stock units:', unitsError);
  }

  // Normalize relations
  const warehouse = normalizeRelation(receipt.warehouses);
  const partner = normalizeRelation(receipt.partners);
  const sourceWarehouse = normalizeRelation(receipt.source_warehouses);

  // Determine source
  let sourceType: 'partner' | 'warehouse' | 'none' = 'none';
  let source = null;

  if (partner) {
    sourceType = 'partner';
    source = {
      id: partner.id,
      name: partner.company_name,
      type: partner.partner_type,
    };
  } else if (sourceWarehouse) {
    sourceType = 'warehouse';
    source = {
      id: sourceWarehouse.id,
      name: sourceWarehouse.name,
    };
  }

  // Transform items and stock units
  const standardItems = transformReceiptItems(items || []);
  const standardStockUnits = transformStockUnits(stockUnits || []);

  // Calculate totals
  const totalQuantity = standardItems.reduce((sum, item) => sum + item.quantity_received, 0);
  const totalSize = standardStockUnits.reduce((sum, unit) => sum + unit.size_quantity, 0);
  const totalWastage = standardStockUnits.reduce((sum, unit) => sum + unit.wastage, 0);

  return {
    id: receipt.id,
    receipt_number: receipt.receipt_number,
    receipt_date: receipt.receipt_date,
    created_at: receipt.created_at,
    updated_at: receipt.updated_at || receipt.created_at,

    link_type: receipt.link_type,
    link_type_display: formatLinkType(receipt.link_type),

    source_type: sourceType,
    source,

    warehouse: {
      id: warehouse?.id || '',
      name: warehouse?.name || 'Unknown Warehouse',
    },

    invoice_number: receipt.invoice_number,
    invoice_amount: receipt.invoice_amount,

    transport_details: receipt.transport_details,
    notes: receipt.notes,
    attachments: receipt.attachments,

    items: standardItems,
    stock_units: standardStockUnits,

    totals: {
      total_quantity: totalQuantity,
      total_items: standardItems.length,
      total_stock_units: standardStockUnits.length,
      total_size: totalSize,
      total_wastage: totalWastage,
    },
  };
}

/**
 * Get goods receipts summary stats for dashboard
 */
export async function getGoodsReceiptsStats(companyId?: string): Promise<{
  total_receipts: number;
  total_this_month: number;
  total_quantity_received: number;
  total_value: number;
}> {
  const supabase = await createClient();

  // Get company_id if not provided
  if (!companyId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData?.company_id) throw new Error('Company not found');
    companyId = userData.company_id;
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Get total receipts
  const { count: totalReceipts } = await supabase
    .from('goods_receipts')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .is('deleted_at', null);

  // Get receipts this month
  const { count: totalThisMonth } = await supabase
    .from('goods_receipts')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .gte('receipt_date', startOfMonth.toISOString());

  // Get total value (sum of invoice amounts)
  const { data: receiptsWithInvoices } = await supabase
    .from('goods_receipts')
    .select('invoice_amount')
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .not('invoice_amount', 'is', null);

  const totalValue = (receiptsWithInvoices || []).reduce(
    (sum, r) => sum + (r.invoice_amount || 0),
    0
  );

  return {
    total_receipts: totalReceipts || 0,
    total_this_month: totalThisMonth || 0,
    total_quantity_received: 0, // Can be calculated if needed
    total_value: totalValue,
  };
}
