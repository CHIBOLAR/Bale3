import { revalidateTag, revalidatePath } from 'next/cache'
import { CACHE_TAGS } from './queries'

/**
 * Cache Invalidation Utilities
 *
 * These functions should be called from server actions after mutations
 * to ensure the cache stays fresh and users see updated data.
 */

/**
 * Invalidate warehouse cache after create/update/delete
 */
export function invalidateWarehouseCache(companyId: string) {
  revalidateTag(CACHE_TAGS.warehouses(companyId))
  revalidatePath('/dashboard/warehouses')
  revalidatePath('/dashboard')
}

/**
 * Invalidate product cache after create/update/delete
 */
export function invalidateProductCache(companyId: string) {
  revalidateTag(CACHE_TAGS.products(companyId))
  revalidatePath('/dashboard/products')
  revalidatePath('/dashboard')
}

/**
 * Invalidate partner cache after create/update/delete
 */
export function invalidatePartnerCache(companyId: string, partnerType?: string) {
  if (partnerType) {
    revalidateTag(CACHE_TAGS.partners(companyId, partnerType))
  }
  revalidateTag(CACHE_TAGS.partners(companyId))
  revalidatePath('/dashboard/partners')
  revalidatePath('/dashboard')
}

/**
 * Invalidate color cache after create/update/delete
 * Also invalidates products since they reference colors
 */
export function invalidateColorCache(companyId: string) {
  revalidateTag(CACHE_TAGS.colors(companyId))
  // Colors affect products too
  revalidateTag(CACHE_TAGS.products(companyId))
  revalidatePath('/dashboard/products')
}

/**
 * Invalidate sales order cache after create/update/delete
 */
export function invalidateSalesOrderCache(companyId: string) {
  revalidateTag(CACHE_TAGS.salesOrders(companyId))
  // Sales orders affect job works
  revalidateTag(CACHE_TAGS.jobWorks(companyId))
  revalidatePath('/dashboard/sales-orders')
  revalidatePath('/dashboard/job-works')
  revalidatePath('/dashboard')
}

/**
 * Invalidate job work cache after create/update/delete
 */
export function invalidateJobWorkCache(companyId: string) {
  revalidateTag(CACHE_TAGS.jobWorks(companyId))
  revalidatePath('/dashboard/job-works')
  revalidatePath('/dashboard')
}

/**
 * Invalidate goods dispatch cache
 * Also invalidates job works since dispatches are linked to them
 */
export function invalidateGoodsDispatchCache(companyId: string) {
  revalidateTag(CACHE_TAGS.jobWorks(companyId))
  revalidatePath('/dashboard/goods-dispatches')
  revalidatePath('/dashboard/job-works')
  revalidatePath('/dashboard')
}

/**
 * Invalidate goods receipt cache
 * Also invalidates job works since receipts are linked to them
 */
export function invalidateGoodsReceiptCache(companyId: string) {
  revalidateTag(CACHE_TAGS.jobWorks(companyId))
  revalidatePath('/dashboard/goods-receipts')
  revalidatePath('/dashboard/job-works')
  revalidatePath('/dashboard')
}

/**
 * Invalidate user cache after profile update
 */
export function invalidateUserCache(userId: string) {
  revalidateTag(CACHE_TAGS.userData(userId))
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
}

/**
 * Invalidate all caches for a company
 * Use sparingly - only when necessary (e.g., company settings change)
 */
export function invalidateAllCompanyCache(companyId: string) {
  revalidateTag(CACHE_TAGS.warehouses(companyId))
  revalidateTag(CACHE_TAGS.products(companyId))
  revalidateTag(CACHE_TAGS.partners(companyId))
  revalidateTag(CACHE_TAGS.colors(companyId))
  revalidateTag(CACHE_TAGS.salesOrders(companyId))
  revalidateTag(CACHE_TAGS.jobWorks(companyId))
  revalidatePath('/dashboard')
}

/**
 * Helper to invalidate multiple related caches at once
 * Example: When creating a product with a new color
 */
export function invalidateRelatedCaches(
  companyId: string,
  caches: ('warehouses' | 'products' | 'partners' | 'colors' | 'salesOrders' | 'jobWorks')[]
) {
  caches.forEach(cache => {
    switch (cache) {
      case 'warehouses':
        invalidateWarehouseCache(companyId)
        break
      case 'products':
        invalidateProductCache(companyId)
        break
      case 'partners':
        invalidatePartnerCache(companyId)
        break
      case 'colors':
        invalidateColorCache(companyId)
        break
      case 'salesOrders':
        invalidateSalesOrderCache(companyId)
        break
      case 'jobWorks':
        invalidateJobWorkCache(companyId)
        break
    }
  })
}
