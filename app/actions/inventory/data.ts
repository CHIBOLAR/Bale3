'use server'

import { createClient } from '@/lib/supabase/server';
import { getActiveWarehouse } from '@/lib/warehouse-context';
import { getUserContext } from '@/lib/cache/user-context';

/**
 * Gets all products for the current company
 */
export async function getProducts() {
  try {
    const context = await getUserContext();
    if (!context) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('id, name, material, color, product_number, product_images, measuring_unit')
      .eq('company_id', context.userData.company_id)
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
    const context = await getUserContext();
    if (!context) return [];

    const supabase = await createClient();
    let query = supabase
      .from('warehouses')
      .select('id, name')
      .eq('company_id', context.userData.company_id)
      .is('deleted_at', null);

    // Apply warehouse filtering for staff users
    if (context.userData.role === 'staff' && context.userData.warehouse_id) {
      query = query.eq('id', context.userData.warehouse_id);
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
    const context = await getUserContext();
    if (!context) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('partners')
      .select('id, company_name, partner_type')
      .eq('company_id', context.userData.company_id)
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
 * Gets all stock units with optional filters and pagination
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
  page?: number;
  pageSize?: number;
}) {
  try {
    const context = await getUserContext();
    if (!context) return { data: [], count: 0 };

    const supabase = await createClient();

    // Get active warehouse from warehouse switcher
    const activeWarehouseId = await getActiveWarehouse();

    // Build base query for both count and data
    const buildQuery = (includeSelect = true) => {
      let query = includeSelect
        ? supabase
            .from('stock_units')
            .select(
              `
              *,
              products (id, name, material, color, product_number, product_images),
              warehouses (id, name)
            `,
              { count: 'exact' }
            )
        : supabase.from('stock_units').select('*', { count: 'exact', head: true });

      query = query
        .eq('company_id', context.userData.company_id)
        .is('deleted_at', null);

      // Apply warehouse filtering for staff users (overrides everything)
      if (context.userData.role === 'staff' && context.userData.warehouse_id) {
        query = query.eq('warehouse_id', context.userData.warehouse_id);
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

      return query;
    };

    let query = buildQuery(true).order('created_at', { ascending: false });

    // Apply pagination if provided
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 25;
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    query = query.range(start, end);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching stock units:', error);
      return { data: [], count: 0 };
    }

    return { data: data || [], count: count || 0 };
  } catch (error) {
    console.error('Error in getStockUnits:', error);
    return { data: [], count: 0 };
  }
}

/**
 * Gets pending sales orders for dispatch linking
 * Returns orders with status 'pending' or 'partially_fulfilled'
 */
export async function getPendingSalesOrders() {
  try {
    const context = await getUserContext();
    if (!context) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('sales_orders')
      .select('id, order_number, customer:partners!sales_orders_customer_id_fkey(company_name)')
      .eq('company_id', context.userData.company_id)
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
    const context = await getUserContext();
    if (!context) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('job_works')
      .select('id, job_number, partner:partners!job_works_partner_id_fkey(company_name)')
      .eq('company_id', context.userData.company_id)
      .in('status', ['pending', 'in_progress'])
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching pending job works:', error);
      return [];
    }

    // Transform partner from array to single object if needed
    const transformedData = (data || []).map((jobWork: any) => ({
      id: jobWork.id,
      job_number: jobWork.job_number,
      partner: Array.isArray(jobWork.partner) ? jobWork.partner[0] : jobWork.partner
    }));

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
    const context = await getUserContext();
    if (!context) return null;

    const supabase = await createClient();
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
      .eq('company_id', context.userData.company_id);

    // Apply warehouse filtering for staff users
    if (context.userData.role === 'staff' && context.userData.warehouse_id) {
      query = query.eq('warehouse_id', context.userData.warehouse_id);
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
