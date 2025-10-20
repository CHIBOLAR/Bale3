'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

const WAREHOUSE_COOKIE_NAME = 'active_warehouse_id'

/**
 * Set the active warehouse for an admin user
 * This warehouse context will be used for all queries across the application
 */
export async function setActiveWarehouse(warehouseId: string | null) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Unauthorized' }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('warehouse_id')
    .eq('auth_user_id', user.id)
    .single()

  // Only admins (users without assigned warehouse) can switch warehouses
  if (userData?.warehouse_id) {
    return { data: null, error: 'Only admins can switch warehouses' }
  }

  const cookieStore = await cookies()

  if (warehouseId) {
    cookieStore.set(WAREHOUSE_COOKIE_NAME, warehouseId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
  } else {
    cookieStore.delete(WAREHOUSE_COOKIE_NAME)
  }

  return { data: warehouseId, error: null }
}

/**
 * Get the active warehouse ID for the current user
 * - For staff users: returns their assigned warehouse_id (cannot be changed)
 * - For admin users: returns the selected warehouse from cookies, or null for "All Warehouses"
 */
export async function getActiveWarehouse(): Promise<string | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return null
  }

  const { data: userData } = await supabase
    .from('users')
    .select('warehouse_id')
    .eq('auth_user_id', user.id)
    .single()

  // Staff users are locked to their assigned warehouse
  if (userData?.warehouse_id) {
    return userData.warehouse_id
  }

  // Admin users can have a selected warehouse from cookies
  const cookieStore = await cookies()
  const activeWarehouseId = cookieStore.get(WAREHOUSE_COOKIE_NAME)?.value

  return activeWarehouseId || null
}

/**
 * Get warehouses available to the current user
 * - For staff: only their assigned warehouse
 * - For admins: all warehouses in their company
 */
export async function getAvailableWarehouses() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Unauthorized' }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id, warehouse_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!userData) {
    return { data: null, error: 'User not found' }
  }

  // If staff user, only return their assigned warehouse
  if (userData.warehouse_id) {
    const { data: warehouse } = await supabase
      .from('warehouses')
      .select('id, warehouse_name')
      .eq('id', userData.warehouse_id)
      .single()

    return {
      data: warehouse ? [warehouse] : [],
      error: null,
      isAdmin: false,
    }
  }

  // Admin user - return all warehouses
  const { data: warehouses, error } = await supabase
    .from('warehouses')
    .select('id, warehouse_name')
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .order('warehouse_name')

  return {
    data: warehouses || [],
    error: error ? 'Failed to fetch warehouses' : null,
    isAdmin: true,
  }
}

/**
 * Check if the current user is an admin (no assigned warehouse)
 */
export async function isAdminUser(): Promise<boolean> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return false
  }

  const { data: userData } = await supabase
    .from('users')
    .select('warehouse_id')
    .eq('auth_user_id', user.id)
    .single()

  return !userData?.warehouse_id
}
