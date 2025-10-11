import { createClient } from '@/lib/supabase/server';

export type UserRole = 'super_admin' | 'field_agent' | 'admin' | 'customer';

export interface UserWithRole {
  id: string;
  auth_user_id: string;
  email: string;
  role: UserRole;
  company_id: string;
}

/**
 * Get the current user's role from the database
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('auth_user_id', user.id)
      .single();

    return userData?.role as UserRole || 'customer';
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Get the current user's full profile including role
 */
export async function getCurrentUserWithRole(): Promise<UserWithRole | null> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: userData } = await supabase
      .from('users')
      .select('id, auth_user_id, email, role, company_id')
      .eq('auth_user_id', user.id)
      .single();

    return userData as UserWithRole;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Check if the current user has a specific role
 */
export async function hasRole(role: UserRole | UserRole[]): Promise<boolean> {
  const currentRole = await getCurrentUserRole();
  if (!currentRole) return false;

  if (Array.isArray(role)) {
    return role.includes(currentRole);
  }

  return currentRole === role;
}

/**
 * Check if the current user is a super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  return hasRole('super_admin');
}

/**
 * Check if the current user is a field agent or super admin
 */
export async function canGenerateInvites(): Promise<boolean> {
  return hasRole(['super_admin', 'field_agent']);
}

/**
 * Check if the current user can approve invite requests
 */
export async function canApproveRequests(): Promise<boolean> {
  return hasRole('super_admin');
}

/**
 * Require a specific role or throw an error
 */
export async function requireRole(role: UserRole | UserRole[], errorMessage?: string): Promise<void> {
  const hasRequiredRole = await hasRole(role);

  if (!hasRequiredRole) {
    throw new Error(errorMessage || 'Insufficient permissions');
  }
}

/**
 * Get user role hierarchy level (higher number = more permissions)
 */
export function getRoleLevel(role: UserRole): number {
  const levels: Record<UserRole, number> = {
    'super_admin': 4,
    'field_agent': 3,
    'admin': 2,
    'customer': 1,
  };
  return levels[role] || 0;
}

/**
 * Check if roleA has higher or equal permissions than roleB
 */
export function hasHigherOrEqualRole(roleA: UserRole, roleB: UserRole): boolean {
  return getRoleLevel(roleA) >= getRoleLevel(roleB);
}
