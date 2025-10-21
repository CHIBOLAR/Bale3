'use server'

import { createClient } from '@/lib/supabase/server';
import { getActiveWarehouse } from '@/lib/warehouse-context';

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
      .select('id, name, material, color, product_number, product_images, measuring_unit')
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
 * Staff users only see their assigned warehouse
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
      .select('company_id, role, warehouse_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData?.company_id) {
      return [];
    }

    let query = supabase
      .from('warehouses')
      .select('id, name')
      .eq('company_id', userData.company_id)
      .is('deleted_at', null);

    // Apply warehouse filtering for staff users
    if (userData.role === 'staff' && userData.warehouse_id) {
      query = query.eq('id', userData.warehouse_id);
    }

    const { data, error } = await query.order('name');

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
 * Automatically respects the active warehouse from the warehouse switcher
 * Staff users are automatically restricted to their assigned warehouse
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
      .select('company_id, role, warehouse_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData?.company_id) {
      return [];
    }

    // Get active warehouse from warehouse switcher
    const activeWarehouseId = await getActiveWarehouse();

    let query = supabase
      .from('stock_units')
      .select(
        `
        *,
        products (id, name, material, color, product_number, product_images),
        warehouses (id, name)
      `
      )
      .eq('company_id', userData.company_id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    // Apply warehouse filtering for staff users (overrides everything)
    if (userData.role === 'staff' && userData.warehouse_id) {
      query = query.eq('warehouse_id', userData.warehouse_id);
    }
    // For admins, use explicit filter if provided, otherwise use active warehouse
    else if (filters?.warehouse_id) {
      query = query.eq('warehouse_id', filters.warehouse_id);
    } else if (activeWarehouseId) {
      // Use active warehouse from switcher if no explicit filter
      query = query.eq('warehouse_id', activeWarehouseId);
    }

    // Apply other filters
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
 * Gets pending sales orders for dispatch linking
 * Returns orders with status 'pending' or 'partially_fulfilled'
 */
export async function getPendingSalesOrders() {
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
      .from('sales_orders')
      .select('id, order_number, customer:partners!sales_orders_customer_id_fkey(company_name)')
      .eq('company_id', userData.company_id)
      .in('status', ['pending', 'partially_fulfilled'])
      .is('deleted_at', null)
      .order('order_date', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching pending sales orders:', error);
      return [];
    }

    // Transform customer from array to single object if needed
    const transformedData = (data || []).map((order: any) => ({
      ...order,
      customer: Array.isArray(order.customer) ? order.customer[0] : order.customer
    }));

    return transformedData;
  } catch (error) {
    console.error('Error in getPendingSalesOrders:', error);
    return [];
  }
}

/**
 * Gets pending job works for the current company
 */
export async function getPendingJobWorks() {
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
      .from('job_works')
      .select('id, job_number, partner:partners!job_works_partner_id_fkey(company_name)')
      .eq('company_id', userData.company_id)
      .in('status', ['pending', 'in_progress'])
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching pending job works:', error);
      return [];
    }

    console.log('getPendingJobWorks - Raw data:', data);

    // Transform partner from array to single object if needed
    const transformedData = (data || []).map((jobWork: any) => ({
      id: jobWork.id,
      job_number: jobWork.job_number,
      partner: Array.isArray(jobWork.partner) ? jobWork.partner[0] : jobWork.partner
    }));

    console.log('getPendingJobWorks - Transformed data:', transformedData);

    return transformedData;
  } catch (error) {
    console.error('Error in getPendingJobWorks:', error);
    return [];
  }
}

/**
 * Gets a single stock unit by ID
 * Staff users can only access units in their assigned warehouse
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
      .select('company_id, role, warehouse_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData?.company_id) {
      return null;
    }

    let query = supabase
      .from('stock_units')
      .select(
        `
        *,
        products (id, name, material, color, product_number, product_images),
        warehouses (id, name)
      `
      )
      .eq('id', unitId)
      .eq('company_id', userData.company_id);

    // Apply warehouse filtering for staff users
    if (userData.role === 'staff' && userData.warehouse_id) {
      query = query.eq('warehouse_id', userData.warehouse_id);
    }

    const { data, error } = await query.single();

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
