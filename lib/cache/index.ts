/**
 * Database Caching Layer (Without Redis)
 *
 * This module provides a comprehensive caching strategy using Next.js native capabilities.
 * No external caching service (like Redis) is required.
 *
 * ## Features:
 * - Server-side caching with `unstable_cache`
 * - Automatic revalidation based on data volatility
 * - Targeted cache invalidation with tags
 * - Company and warehouse scoping for multi-tenancy
 *
 * ## Usage:
 *
 * ### In Server Components:
 * ```typescript
 * import { getCachedProducts } from '@/lib/cache'
 *
 * const products = await getCachedProducts(companyId)
 * ```
 *
 * ### In Server Actions:
 * ```typescript
 * import { invalidateProductCache } from '@/lib/cache'
 *
 * export async function createProduct(data) {
 *   // ... create product
 *   invalidateProductCache(companyId)
 *   return { data, error: null }
 * }
 * ```
 *
 * ## Cache Times:
 * - Warehouses: 1 hour (rarely change)
 * - Products: 5 minutes (moderate changes)
 * - Partners: 30 minutes (occasional changes)
 * - Colors: 1 hour (rarely change)
 * - Sales Orders: 1 minute (frequent changes)
 * - Job Works: 1 minute (frequent changes)
 *
 * ## Performance Benefits:
 * - Reduces database query load
 * - Improves page load times
 * - Scales with Next.js built-in caching
 * - No additional infrastructure needed
 */

// Export cached query functions
export {
  getCachedUserData,
  getCachedWarehouses,
  getCachedProducts,
  getCachedPartners,
  getCachedColors,
  getCachedSalesOrders,
  getCachedJobWorks,
  getCacheKey,
  getCompanyCacheTags,
  CACHE_TIMES,
  CACHE_TAGS,
} from './queries'

// Export cache invalidation functions
export {
  invalidateWarehouseCache,
  invalidateProductCache,
  invalidatePartnerCache,
  invalidateColorCache,
  invalidateSalesOrderCache,
  invalidateJobWorkCache,
  invalidateGoodsDispatchCache,
  invalidateGoodsReceiptCache,
  invalidateUserCache,
  invalidateAllCompanyCache,
  invalidateRelatedCaches,
} from './invalidation'
