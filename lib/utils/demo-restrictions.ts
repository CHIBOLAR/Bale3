/**
 * Demo Account Restrictions
 *
 * Helper functions to enforce limits on demo users without RLS policies
 */

export const DEMO_LIMITS = {
  // Maximum number of creates allowed for demo users
  // High limits since this is a SHARED demo account for all users
  MAX_PRODUCTS: 500,        // 100x - plenty of room for users to test
  MAX_PARTNERS: 300,        // 100x - can add customers/suppliers freely
  MAX_SALES_ORDERS: 300,    // 100x - create multiple orders
  MAX_GOODS_RECEIPTS: 200,  // 100x - test inventory receipts
  MAX_GOODS_DISPATCHES: 200,// 100x - test dispatches
  MAX_STAFF: 0,             // Demo users cannot create staff (security)
  MAX_WAREHOUSES: 0,        // Demo users cannot create warehouses (impacts all users)
  MAX_QR_BATCHES: 100,      // Can generate many QR batches for testing
} as const;

export const DEMO_ERROR_MESSAGES = {
  LIMIT_REACHED: (type: string, limit: number) =>
    `Demo accounts are limited to ${limit} ${type}. Upgrade to full access for unlimited creation. Contact us via WhatsApp to upgrade!`,

  READ_ONLY: (feature: string) =>
    `${feature} management is not available in demo mode. Request full access to unlock this feature!`,

  DELETE_DISABLED: () =>
    `Deleting items is disabled in demo mode to preserve demo data for other users. Request full access for complete control!`,
};

/**
 * Check if user is a demo user
 */
export function isDemoUser(user: { is_demo?: boolean } | null): boolean {
  return user?.is_demo === true;
}

/**
 * Check if demo user has reached the creation limit for a specific resource
 */
export async function checkDemoLimit(
  supabase: any,
  companyId: string,
  resourceTable: string,
  limitKey: keyof typeof DEMO_LIMITS
): Promise<{ allowed: boolean; message?: string; currentCount?: number }> {
  const limit = DEMO_LIMITS[limitKey];

  // Skip check if limit is very high (shared demo account)
  // This saves unnecessary DB queries for high limits
  if (limit >= 100) {
    return { allowed: true, currentCount: 0 };
  }

  // Get current count only for restrictive limits
  const { count, error } = await supabase
    .from(resourceTable)
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  if (error) {
    console.error(`Error checking demo limit for ${resourceTable}:`, error);
    return { allowed: true }; // Allow on error to not block functionality
  }

  const currentCount = count || 0;

  if (currentCount >= limit) {
    const resourceName = resourceTable.replace('_', ' ');
    return {
      allowed: false,
      message: DEMO_ERROR_MESSAGES.LIMIT_REACHED(resourceName, limit),
      currentCount,
    };
  }

  return { allowed: true, currentCount };
}

/**
 * Generate upgrade CTA message
 */
export function getUpgradeMessage(feature: string): string {
  return `Unlock ${feature} by upgrading to full access. Contact us: https://wa.me/918928466864`;
}

/**
 * Check if action is allowed for demo user
 */
export function isDemoActionAllowed(
  actionType: 'create' | 'update' | 'delete',
  resourceType: string,
  isDemoUser: boolean
): { allowed: boolean; message?: string } {
  if (!isDemoUser) {
    return { allowed: true };
  }

  // Demo users can update most things
  if (actionType === 'update') {
    return { allowed: true };
  }

  // Demo users cannot delete anything
  if (actionType === 'delete') {
    return {
      allowed: false,
      message: DEMO_ERROR_MESSAGES.DELETE_DISABLED(),
    };
  }

  // Create permissions are checked via checkDemoLimit
  return { allowed: true };
}

/**
 * Get demo banner props for UI
 */
export function getDemoBannerProps(currentCount: number, limit: number, resourceName: string) {
  const remaining = limit - currentCount;

  return {
    show: true,
    message: remaining > 0
      ? `Demo Mode: You can create ${remaining} more ${resourceName}. ${getUpgradeMessage('unlimited ' + resourceName)}`
      : `Demo Mode: You've reached the limit of ${limit} ${resourceName}. ${getUpgradeMessage('unlimited ' + resourceName)}`,
    variant: remaining > 0 ? 'info' : 'warning',
    remaining,
  };
}
