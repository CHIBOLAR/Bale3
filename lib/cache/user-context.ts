'use server'

import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

/**
 * User context data structure
 */
export interface UserContext {
  user: {
    id: string;
    email: string | undefined;
  };
  userData: {
    id: string;
    company_id: string;
    warehouse_id: string | null;
    role: 'admin' | 'staff';
    is_demo: boolean;
    first_name: string | null;
    last_name: string | null;
  };
  company: {
    id: string;
    name: string;
  } | null;
}

/**
 * Get user context with React cache() for request-level memoization
 * This prevents duplicate auth and database queries within the same request
 *
 * Benefits:
 * - Single database query per request instead of multiple
 * - Eliminates redundant auth.getUser() calls
 * - Maintains auth context (unlike unstable_cache)
 * - Automatic deduplication within the same request
 */
export const getUserContext = cache(async (): Promise<UserContext | null> => {
  try {
    const supabase = await createClient();

    // Single auth call per request
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Single database query to get user + company data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        company_id,
        warehouse_id,
        role,
        is_demo,
        first_name,
        last_name,
        company:companies!inner(id, name)
      `)
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return null;
    }

    // Transform company from array to object (Supabase joins return arrays)
    const company = Array.isArray(userData.company)
      ? userData.company[0]
      : userData.company;

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      userData: {
        id: userData.id,
        company_id: userData.company_id,
        warehouse_id: userData.warehouse_id,
        role: userData.role,
        is_demo: userData.is_demo,
        first_name: userData.first_name,
        last_name: userData.last_name,
      },
      company,
    };
  } catch (error) {
    console.error('Error in getUserContext:', error);
    return null;
  }
});

/**
 * Helper to get just the company ID (for common use cases)
 */
export const getCompanyId = cache(async (): Promise<string | null> => {
  const context = await getUserContext();
  return context?.userData.company_id || null;
});

/**
 * Helper to check if user is staff
 */
export const isStaffUser = cache(async (): Promise<boolean> => {
  const context = await getUserContext();
  return context?.userData.role === 'staff';
});

/**
 * Helper to get warehouse ID for staff users
 */
export const getStaffWarehouseId = cache(async (): Promise<string | null> => {
  const context = await getUserContext();
  if (context?.userData.role === 'staff') {
    return context.userData.warehouse_id;
  }
  return null;
});
