'use server'

import { createClient } from '@/lib/supabase/server'

export interface ProductWithInventory {
  product: any
  inventorySummary: InventorySummary[]
  stockUnits: any[]
  totalAvailableQuantity: number
  totalReservedQuantity: number
  totalDispatchedQuantity: number
  totalStockValue: number
  warehouseBreakdown: WarehouseStock[]
  isLowStock: boolean
}

export interface InventorySummary {
  warehouse_id: string
  warehouse_name: string
  total_units: number
  available_units: number
  reserved_units: number
  dispatched_units: number
  total_quantity: number
  available_quantity: number
}

export interface WarehouseStock {
  warehouse_id: string
  warehouse_name: string
  total_units: number
  available_quantity: number
  reserved_quantity: number
  dispatched_quantity: number
}

export async function getProductWithInventory(
  productId: string,
  companyId: string
): Promise<ProductWithInventory | null> {
  const supabase = await createClient()

  try {
    // Fetch all data in parallel
    const [productResult, inventorySummaryResult, stockUnitsResult] = await Promise.all([
      // 1. Product details
      supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .single(),

      // 2. Inventory summary from the view (aggregated by warehouse)
      supabase
        .from('inventory_summary')
        .select('*')
        .eq('product_id', productId)
        .eq('company_id', companyId),

      // 3. Recent stock units (limited to 50 most recent)
      supabase
        .from('stock_units')
        .select(`
          *,
          warehouses (
            id,
            name
          )
        `)
        .eq('product_id', productId)
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    if (productResult.error || !productResult.data) {
      console.error('Error fetching product:', productResult.error)
      return null
    }

    const product = productResult.data
    const inventorySummary = inventorySummaryResult.data || []
    const stockUnits = stockUnitsResult.data || []

    // Calculate totals from inventory summary
    const totalAvailableQuantity = inventorySummary.reduce(
      (sum, item) => sum + (Number(item.available_quantity) || 0),
      0
    )
    const totalReservedQuantity = inventorySummary.reduce(
      (sum, item) => sum + (Number(item.reserved_quantity) || 0),
      0
    )
    const totalDispatchedQuantity = inventorySummary.reduce(
      (sum, item) => sum + (Number(item.dispatched_quantity) || 0),
      0
    )

    // Calculate total stock value (available quantity × selling price)
    const totalStockValue =
      totalAvailableQuantity * (Number(product.selling_price_per_unit) || 0)

    // Create warehouse breakdown
    const warehouseBreakdown: WarehouseStock[] = inventorySummary.map((item) => ({
      warehouse_id: item.warehouse_id,
      warehouse_name: item.warehouse_name,
      total_units: Number(item.total_units) || 0,
      available_quantity: Number(item.available_quantity) || 0,
      reserved_quantity: Number(item.reserved_quantity) || 0,
      dispatched_quantity: Number(item.dispatched_quantity) || 0,
    }))

    // Check if low stock
    const isLowStock =
      product.min_stock_alert &&
      product.min_stock_threshold &&
      totalAvailableQuantity < product.min_stock_threshold

    return {
      product,
      inventorySummary,
      stockUnits,
      totalAvailableQuantity,
      totalReservedQuantity,
      totalDispatchedQuantity,
      totalStockValue,
      warehouseBreakdown,
      isLowStock,
    }
  } catch (error) {
    console.error('Error in getProductWithInventory:', error)
    return null
  }
}

/**
 * Get all stock units for a product with filtering options
 */
export async function getProductStockUnits(
  productId: string,
  companyId: string,
  options?: {
    warehouseId?: string
    status?: string
    limit?: number
    offset?: number
  }
) {
  const supabase = await createClient()

  let query = supabase
    .from('stock_units')
    .select(
      `
      *,
      warehouses (
        id,
        name
      )
    `,
      { count: 'exact' }
    )
    .eq('product_id', productId)
    .eq('company_id', companyId)
    .is('deleted_at', null)

  // Apply filters
  if (options?.warehouseId) {
    query = query.eq('warehouse_id', options.warehouseId)
  }
  if (options?.status) {
    query = query.eq('status', options.status)
  }

  // Apply pagination
  const limit = options?.limit || 20
  const offset = options?.offset || 0
  query = query.range(offset, offset + limit - 1)

  // Order by created date (newest first)
  query = query.order('created_at', { ascending: false })

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching product stock units:', error)
    return { stockUnits: [], total: 0 }
  }

  return {
    stockUnits: data || [],
    total: count || 0,
  }
}
