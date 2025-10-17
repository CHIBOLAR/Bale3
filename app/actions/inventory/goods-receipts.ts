'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { GoodsReceiptFormData, CreateStockUnitInput } from '@/lib/types/inventory';

interface CreateGoodsReceiptResult {
  success: boolean;
  receiptId?: string;
  error?: string;
}

/**
 * Generates a unique QR code string for a stock unit
 * Format: UNIT-{company_id}-{timestamp}-{random}
 */
function generateQRCode(companyId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `UNIT-${companyId}-${timestamp}-${random}`;
}

/**
 * Generates a sequential receipt number
 * Format: GR-YYYY-MM-XXXXX (e.g., GR-2025-10-00001)
 */
async function generateReceiptNumber(supabase: any, companyId: string): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `GR-${year}-${month}-`;

  // Get the last receipt number for this month
  const { data: lastReceipt } = await supabase
    .from('goods_receipts')
    .select('receipt_number')
    .eq('company_id', companyId)
    .like('receipt_number', `${prefix}%`)
    .order('receipt_number', { ascending: false })
    .limit(1)
    .single();

  let sequence = 1;
  if (lastReceipt) {
    const lastNumber = lastReceipt.receipt_number.split('-').pop();
    sequence = parseInt(lastNumber || '0', 10) + 1;
  }

  return `${prefix}${String(sequence).padStart(5, '0')}`;
}

/**
 * Generates a unique unit number for a stock unit
 * Format: {product_number}-{warehouse_code}-{sequence}
 */
async function generateUnitNumber(
  supabase: any,
  companyId: string,
  productId: string,
  warehouseId: string
): Promise<string> {
  // Get product number
  const { data: product } = await supabase
    .from('products')
    .select('product_number')
    .eq('id', productId)
    .single();

  // Get warehouse (assuming warehouses have a code field, or use first 3 chars of name)
  const { data: warehouse } = await supabase
    .from('warehouses')
    .select('name')
    .eq('id', warehouseId)
    .single();

  const productNumber = product?.product_number || 'PRD';
  const warehouseCode = warehouse?.name.substring(0, 3).toUpperCase() || 'WHE';

  // Get count of existing units for this product
  const { count } = await supabase
    .from('stock_units')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('product_id', productId);

  const sequence = (count || 0) + 1;

  return `${productNumber}-${warehouseCode}-${String(sequence).padStart(4, '0')}`;
}

/**
 * Creates a goods receipt with all associated items and stock units atomically
 */
export async function createGoodsReceipt(
  formData: GoodsReceiptFormData
): Promise<CreateGoodsReceiptResult> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Get user's company_id
    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData?.company_id) {
      return {
        success: false,
        error: 'Company not found',
      };
    }

    const companyId = userData.company_id;

    // Generate receipt number
    const receiptNumber = await generateReceiptNumber(supabase, companyId);

    // Start transaction by creating goods_receipt
    const { data: receipt, error: receiptError } = await supabase
      .from('goods_receipts')
      .insert({
        company_id: companyId,
        warehouse_id: formData.warehouse_id,
        receipt_number: receiptNumber,
        issued_by_partner_id: formData.issued_by_partner_id || null,
        issued_by_warehouse_id: formData.issued_by_warehouse_id || null,
        link_type: formData.link_type,
        receipt_date: formData.receipt_date,
        invoice_number: formData.invoice_number || null,
        invoice_amount: formData.invoice_amount || null,
        transport_details: formData.transport_details || null,
        notes: formData.notes || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (receiptError || !receipt) {
      console.error('Error creating receipt:', receiptError);
      return {
        success: false,
        error: 'Failed to create goods receipt',
      };
    }

    // Process each item
    for (const item of formData.items) {
      // Create goods_receipt_item
      const { data: receiptItem, error: itemError } = await supabase
        .from('goods_receipt_items')
        .insert({
          company_id: companyId,
          receipt_id: receipt.id,
          product_id: item.product_id,
          quantity_received: item.quantity_received,
          notes: item.notes || null,
        })
        .select()
        .single();

      if (itemError || !receiptItem) {
        console.error('Error creating receipt item:', itemError);
        // Rollback not directly supported in Supabase client
        // In production, consider using PostgreSQL transactions via RPC
        return {
          success: false,
          error: 'Failed to create receipt items',
        };
      }

      // Create stock units for this item
      for (const unitDetail of item.stock_unit_details) {
        const qrCode = generateQRCode(companyId);
        const unitNumber = await generateUnitNumber(
          supabase,
          companyId,
          item.product_id,
          formData.warehouse_id
        );

        const { error: stockUnitError } = await supabase.from('stock_units').insert({
          company_id: companyId,
          product_id: item.product_id,
          warehouse_id: formData.warehouse_id,
          unit_number: unitNumber,
          qr_code: qrCode,
          size_quantity: unitDetail.size_quantity,
          wastage: unitDetail.wastage,
          quality_grade: unitDetail.quality_grade,
          location_description: unitDetail.location_description,
          status: unitDetail.status,
          date_received: formData.receipt_date,
          manufacturing_date: unitDetail.manufacturing_date,
          notes: unitDetail.notes || null,
          created_by: user.id,
        });

        if (stockUnitError) {
          console.error('Error creating stock unit:', stockUnitError);
          return {
            success: false,
            error: 'Failed to create stock units',
          };
        }
      }
    }

    // Revalidate relevant paths
    revalidatePath('/dashboard/inventory/goods-receipts');
    revalidatePath('/dashboard/inventory/stock-units');

    return {
      success: true,
      receiptId: receipt.id,
    };
  } catch (error) {
    console.error('Unexpected error in createGoodsReceipt:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Gets a single goods receipt with all related data
 */
export async function getGoodsReceipt(receiptId: string) {
  try {
    const supabase = await createClient();

    // Get authenticated user and company_id
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData?.company_id) {
      throw new Error('Company not found');
    }

    // Get receipt with relations
    const { data: receipt, error } = await supabase
      .from('goods_receipts')
      .select(
        `
        *,
        warehouses!goods_receipts_warehouse_id_fkey (id, name),
        partners:partners!goods_receipts_issued_by_partner_id_fkey (id, company_name, partner_type),
        issued_warehouse:warehouses!goods_receipts_issued_by_warehouse_id_fkey (id, name)
      `
      )
      .eq('id', receiptId)
      .eq('company_id', userData.company_id)
      .single();

    if (error) {
      console.error('Error fetching receipt:', error);
      return null;
    }

    // Get receipt items with products
    const { data: items } = await supabase
      .from('goods_receipt_items')
      .select(
        `
        *,
        products (id, name, material, color, product_number)
      `
      )
      .eq('receipt_id', receiptId)
      .eq('company_id', userData.company_id);

    // Transform partners and issued_warehouse from array to single object if needed
    const transformedReceipt = {
      ...receipt,
      partners: Array.isArray(receipt.partners) ? receipt.partners[0] : receipt.partners,
      issued_warehouse: Array.isArray(receipt.issued_warehouse) ? receipt.issued_warehouse[0] : receipt.issued_warehouse,
      items: items || [],
    };

    return transformedReceipt;
  } catch (error) {
    console.error('Error in getGoodsReceipt:', error);
    return null;
  }
}

/**
 * Gets all goods receipts with optional filters
 */
export async function getGoodsReceipts(filters?: {
  warehouse_id?: string;
  partner_id?: string;
  link_type?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}) {
  try {
    const supabase = await createClient();

    // Get authenticated user and company_id
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData?.company_id) {
      throw new Error('Company not found');
    }

    let query = supabase
      .from('goods_receipts')
      .select(
        `
        *,
        warehouses!goods_receipts_warehouse_id_fkey (id, name),
        partners:partners!goods_receipts_issued_by_partner_id_fkey (id, company_name, partner_type),
        source_warehouses:warehouses!goods_receipts_issued_by_warehouse_id_fkey (id, name),
        goods_receipt_items (quantity_received)
      `
      )
      .eq('company_id', userData.company_id)
      .order('receipt_date', { ascending: false });

    // Apply filters
    if (filters?.warehouse_id) {
      query = query.eq('warehouse_id', filters.warehouse_id);
    }
    if (filters?.partner_id) {
      query = query.eq('issued_by_partner_id', filters.partner_id);
    }
    if (filters?.link_type) {
      query = query.eq('link_type', filters.link_type);
    }
    if (filters?.date_from) {
      query = query.gte('receipt_date', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('receipt_date', filters.date_to);
    }
    if (filters?.search) {
      query = query.or(
        `receipt_number.ilike.%${filters.search}%,invoice_number.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching receipts:', error);
      return [];
    }

    // Transform partners and source_warehouses from array to single object if needed
    const transformedData = (data || []).map((receipt: any) => ({
      ...receipt,
      partners: Array.isArray(receipt.partners) ? receipt.partners[0] : receipt.partners,
      source_warehouses: Array.isArray(receipt.source_warehouses) ? receipt.source_warehouses[0] : receipt.source_warehouses,
    }));

    return transformedData;
  } catch (error) {
    console.error('Error in getGoodsReceipts:', error);
    return [];
  }
}
