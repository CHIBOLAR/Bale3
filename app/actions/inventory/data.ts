'use server'

import { createClient } from '@/lib/supabase/server';

/**
 * Gets all products for the current company
 */
export async function getProducts() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData?.company_id) {
      return [];
    }

    const { data, error } = await supabase
      .from('products')
      .select('id, name, fabric_type, color, product_number, image_url')
      .eq('company_id', userData.company_id)
      .is('deleted_at', null)
      .order('name');

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getProducts:', error);
    return [];
  }
}

/**
 * Gets all warehouses for the current company
 */
export async function getWarehouses() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData?.company_id) {
      return [];
    }

    const { data, error } = await supabase
      .from('warehouses')
      .select('id, name')
      .eq('company_id', userData.company_id)
      .is('deleted_at', null)
      .order('name');

    if (error) {
      console.error('Error fetching warehouses:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getWarehouses:', error);
    return [];
  }
}

/**
 * Gets all partners for the current company
 */
export async function getPartners() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData?.company_id) {
      return [];
    }

    const { data, error } = await supabase
      .from('partners')
      .select('id, company_name, partner_type')
      .eq('company_id', userData.company_id)
      .is('deleted_at', null)
      .order('company_name');

    if (error) {
      console.error('Error fetching partners:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPartners:', error);
    return [];
  }
}

/**
 * Gets all stock units with optional filters
 */
export async function getStockUnits(filters?: {
  warehouse_id?: string;
  status?: string;
  product_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData?.company_id) {
      return [];
    }

    let query = supabase
      .from('stock_units')
      .select(
        `
        *,
        products (id, name, material, color, product_number),
        warehouses (id, name)
      `
      )
      .eq('company_id', userData.company_id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.warehouse_id) {
      query = query.eq('warehouse_id', filters.warehouse_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.product_id) {
      query = query.eq('product_id', filters.product_id);
    }
    if (filters?.date_from) {
      query = query.gte('date_received', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('date_received', filters.date_to);
    }
    if (filters?.search) {
      query = query.or(
        `qr_code.ilike.%${filters.search}%,unit_number.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching stock units:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getStockUnits:', error);
    return [];
  }
}

/**
 * Gets a single stock unit by ID
 */
export async function getStockUnit(unitId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData?.company_id) {
      return null;
    }

    const { data, error } = await supabase
      .from('stock_units')
      .select(
        `
        *,
        products (id, name, material, color, product_number, image_url),
        warehouses (id, name)
      `
      )
      .eq('id', unitId)
      .eq('company_id', userData.company_id)
      .single();

    if (error) {
      console.error('Error fetching stock unit:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getStockUnit:', error);
    return null;
  }
}
