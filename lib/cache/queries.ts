import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Database Caching Strategy (Without Redis)
 *
 * Using Next.js native `unstable_cache` for server-side data caching.
 * Each cached query has:
 * - Unique cache tags for targeted invalidation
 * - Appropriate revalidation time based on data volatility
 * - Company/warehouse scoping for multi-tenancy
 */

// Cache Revalidation Times (in seconds)
export const CACHE_TIMES = {
  WAREHOUSES: 3600,      // 1 hour - rarely changes
  PRODUCTS: 300,         // 5 minutes - moderate changes
  PARTNERS: 1800,        // 30 minutes - occasional changes
  COLORS: 3600,          // 1 hour - rarely changes
  SALES_ORDERS: 300,     // 5 minutes - balanced between freshness and performance
  JOB_WORKS: 300,        // 5 minutes - balanced between freshness and performance
  USER_DATA: 300,        // 5 minutes - occasional changes
} as const

// Cache Tags for Targeted Invalidation
export const CACHE_TAGS = {
  warehouses: (companyId: string) => `warehouses-${companyId}`,
  products: (companyId: string) => `products-${companyId}`,
  partners: (companyId: string, type?: string) => type ? `partners-${companyId}-${type}` : `partners-${companyId}`,
  colors: (companyId: string) => `colors-${companyId}`,
  salesOrders: (companyId: string) => `sales-orders-${companyId}`,
  jobWorks: (companyId: string) => `job-works-${companyId}`,
  userData: (userId: string) => `user-${userId}`,
}

/**
 * Get cached user data
 */
export const getCachedUserData = unstable_cache(
  async (userId: string) => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('users')
      .select('id, company_id, warehouse_id, auth_user_id, role, is_demo')
      .eq('auth_user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching user data:', error)
      return null
    }

    return data
  },
  ['user-data'],
  {
    revalidate: CACHE_TIMES.USER_DATA,
    tags: ['user-data'],
  }
)

/**
 * Get cached warehouses for a company
 */
export const getCachedWarehouses = unstable_cache(
  async (companyId: string, warehouseId?: string | null) => {
    const supabase = await createClient()

    if (warehouseId) {
      // Staff: fetch only their assigned warehouse
      const { data, error } = await supabase
        .from('warehouses')
        .select('id, name')
        .eq('id', warehouseId)
        .single()

      if (error || !data) {
        console.error('Error fetching warehouse:', error)
        return []
      }

      return [{ id: data.id, warehouse_name: data.name }]
    }

    // Admin: fetch all warehouses
    const { data, error } = await supabase
      .from('warehouses')
      .select('id, name')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('name')

    if (error) {
      console.error('Error fetching warehouses:', error)
      return []
    }

    return data ? data.map(w => ({ id: w.id, warehouse_name: w.name })) : []
  },
  ['warehouses'],
  {
    revalidate: CACHE_TIMES.WAREHOUSES,
    tags: ['warehouses'],
  }
)

/**
 * Get cached products for a company
 */
export const getCachedProducts = unstable_cache(
  async (companyId: string, includeDeleted = false) => {
    const supabase = await createClient()

    let query = supabase
      .from('products')
      .select('id, name, measuring_unit, color, color_hex, color_pantone, category')
      .eq('company_id', companyId)

    if (!includeDeleted) {
      query = query.is('deleted_at', null)
    }

    const { data, error } = await query.order('name')

    if (error) {
      console.error('Error fetching products:', error)
      return []
    }

    return data || []
  },
  ['products'],
  {
    revalidate: CACHE_TIMES.PRODUCTS,
    tags: ['products'],
  }
)

/**
 * Get cached partners for a company
 */
export const getCachedPartners = unstable_cache(
  async (companyId: string, partnerType?: string) => {
    const supabase = await createClient()

    let query = supabase
      .from('partners')
      .select('id, first_name, last_name, company_name, partner_type, email, phone')
      .eq('company_id', companyId)
      .is('deleted_at', null)

    if (partnerType) {
      query = query.eq('partner_type', partnerType)
    }

    const { data, error } = await query.order('company_name')

    if (error) {
      console.error('Error fetching partners:', error)
      return []
    }

    // Transform to include computed partner_name
    return data ? data.map(p => ({
      ...p,
      partner_name: p.company_name || `${p.first_name} ${p.last_name}`
    })) : []
  },
  ['partners'],
  {
    revalidate: CACHE_TIMES.PARTNERS,
    tags: ['partners'],
  }
)

/**
 * Get cached colors for a company (for autocomplete)
 */
export const getCachedColors = unstable_cache(
  async (companyId: string, searchTerm?: string, limit = 50) => {
    const supabase = await createClient()

    let query = supabase
      .from('colors')
      .select('id, name, hex_code, pantone_code, usage_count')
      .eq('company_id', companyId)

    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`)
    }

    const { data, error } = await query
      .order('usage_count', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching colors:', error)
      return []
    }

    return data || []
  },
  ['colors'],
  {
    revalidate: CACHE_TIMES.COLORS,
    tags: ['colors'],
  }
)

/**
 * Get cached sales orders for a company
 */
export const getCachedSalesOrders = unstable_cache(
  async (companyId: string, limit = 50) => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('sales_orders')
      .select('id, order_number, customer_name, status, order_date')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('order_number', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching sales orders:', error)
      return []
    }

    return data || []
  },
  ['sales-orders'],
  {
    revalidate: CACHE_TIMES.SALES_ORDERS,
    tags: ['sales-orders'],
  }
)

/**
 * Get cached job works for a company
 */
export const getCachedJobWorks = unstable_cache(
  async (companyId: string, warehouseId?: string | null, limit = 100) => {
    const supabase = await createClient()

    let query = supabase
      .from('job_works')
      .select(`
        *,
        partner:partners(id, first_name, last_name, company_name, partner_type),
        warehouse:warehouses(id, name),
        sales_order:sales_orders(id, order_number),
        raw_materials:job_work_raw_materials(id, product_id),
        finished_goods:job_work_finished_goods(id, expected_quantity, received_quantity)
      `)
      .eq('company_id', companyId)
      .is('deleted_at', null)

    if (warehouseId) {
      query = query.eq('warehouse_id', warehouseId)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching job works:', error)
      return []
    }

    // Transform data
    return data ? data.map(jw => ({
      ...jw,
      partner: jw.partner ? {
        ...jw.partner,
        partner_name: jw.partner.company_name || `${jw.partner.first_name} ${jw.partner.last_name}`
      } : null,
      warehouse: jw.warehouse ? {
        ...jw.warehouse,
        warehouse_name: jw.warehouse.name
      } : null
    })) : []
  },
  ['job-works'],
  {
    revalidate: CACHE_TIMES.JOB_WORKS,
    tags: ['job-works'],
  }
)

/**
 * Utility function to generate cache key with parameters
 * This helps create unique cache keys for different parameter combinations
 */
export function getCacheKey(baseKey: string, params: Record<string, any>): string {
  const sortedParams = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join('|')

  return `${baseKey}:${sortedParams}`
}

/**
 * Helper to get all cache tags for a company
 * Useful for invalidating all company data at once
 */
export function getCompanyCacheTags(companyId: string): string[] {
  return [
    CACHE_TAGS.warehouses(companyId),
    CACHE_TAGS.products(companyId),
    CACHE_TAGS.partners(companyId),
    CACHE_TAGS.colors(companyId),
    CACHE_TAGS.salesOrders(companyId),
    CACHE_TAGS.jobWorks(companyId),
  ]
}
