'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { GoodsDispatchFormData } from '@/lib/types/inventory';

interface CreateGoodsDispatchResult {
  success: boolean;
  dispatchId?: string;
  error?: string;
}

/**
 * Generates a sequential dispatch number
 * Format: GD-YYYY-MM-XXXXX (e.g., GD-2025-10-00001)
 */
async function generateDispatchNumber(supabase: any, companyId: string): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `GD-${year}-${month}-`;

  // Get the last dispatch number for this month
  const { data: lastDispatch } = await supabase
    .from('goods_dispatches')
    .select('dispatch_number')
    .eq('company_id', companyId)
    .like('dispatch_number', `${prefix}%`)
    .order('dispatch_number', { ascending: false })
    .limit(1)
    .single();

  let sequence = 1;
  if (lastDispatch) {
    const lastNumber = lastDispatch.dispatch_number.split('-').pop();
    sequence = parseInt(lastNumber || '0', 10) + 1;
  }

  return `${prefix}${String(sequence).padStart(5, '0')}`;
}

/**
 * Creates a goods dispatch with all associated items and updates stock unit statuses
 */
export async function createGoodsDispatch(
  formData: GoodsDispatchFormData
): Promise<CreateGoodsDispatchResult> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Get user's company_id and internal user id
    const { data: userData } = await supabase
      .from('users')
      .select('id, company_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData?.company_id) {
      return {
        success: false,
        error: 'Company not found',
      };
    }

    const companyId = userData.company_id;
    const userId = userData.id;

    // Validate stock units belong to company and are in_stock
    const { data: stockUnits, error: unitsError } = await supabase
      .from('stock_units')
      .select('id, status')
      .eq('company_id', companyId)
      .in('id', formData.stock_unit_ids);

    if (unitsError || !stockUnits) {
      return {
        success: false,
        error: 'Failed to validate stock units',
      };
    }

    // Check if all units are available for dispatch
    const unavailableUnits = stockUnits.filter((unit) => unit.status !== 'available');
    if (unavailableUnits.length > 0) {
      return {
        success: false,
        error: `${unavailableUnits.length} unit(s) are not available for dispatch`,
      };
    }

    // Generate dispatch number
    const dispatchNumber = await generateDispatchNumber(supabase, companyId);

    // Create goods_dispatch
    const { data: dispatch, error: dispatchError } = await supabase
      .from('goods_dispatches')
      .insert({
        company_id: companyId,
        warehouse_id: formData.warehouse_id,
        dispatch_number: dispatchNumber,
        dispatch_to_partner_id: formData.dispatch_to_partner_id || null,
        dispatch_to_warehouse_id: formData.dispatch_to_warehouse_id || null,
        agent_id: formData.agent_id || null,
        link_type: formData.link_type,
        sales_order_id: formData.sales_order_id || null,
        job_work_id: formData.job_work_id || null,
        dispatch_date: formData.dispatch_date,
        due_date: formData.due_date || null,
        invoice_number: formData.invoice_number || null,
        invoice_amount: formData.invoice_amount ? formData.invoice_amount : null,
        transport_details: formData.transport_details || null,
        status: formData.status || 'pending',
        notes: formData.notes || null,
        created_by: userId,
      })
      .select()
      .single();

    if (dispatchError || !dispatch) {
      console.error('Error creating dispatch:', dispatchError);
      return {
        success: false,
        error: 'Failed to create goods dispatch',
      };
    }

    // Get stock units with product information to match with sales order items
    const { data: stockUnitsWithProducts } = await supabase
      .from('stock_units')
      .select('id, product_id')
      .in('id', formData.stock_unit_ids);

    // If linked to a sales order, get the sales order items for matching
    let salesOrderItems: any[] = [];
    if (formData.sales_order_id) {
      const { data: items } = await supabase
        .from('sales_order_items')
        .select('id, product_id, required_quantity, dispatched_quantity')
        .eq('sales_order_id', formData.sales_order_id)
        .eq('company_id', companyId);

      salesOrderItems = items || [];
    }

    // Create dispatch items for each stock unit with dispatched quantities
    const dispatchItems = formData.stock_unit_ids.map((unitId) => {
      // Find the dispatched quantity for this unit
      const quantityInfo = (formData as any).dispatched_quantities?.find(
        (q: any) => q.stock_unit_id === unitId
      );

      // Find the product_id for this stock unit
      const stockUnit = stockUnitsWithProducts?.find((su) => su.id === unitId);

      // If linked to sales order, find matching sales_order_item by product_id
      let salesOrderItemId = null;
      if (formData.sales_order_id && stockUnit) {
        const matchingOrderItem = salesOrderItems.find(
          (item) => item.product_id === stockUnit.product_id
        );
        salesOrderItemId = matchingOrderItem?.id || null;
      }

      return {
        company_id: companyId,
        dispatch_id: dispatch.id,
        stock_unit_id: unitId,
        dispatched_quantity: quantityInfo?.dispatched_quantity || null,
        sales_order_item_id: salesOrderItemId,
      };
    });

    const { error: itemsError } = await supabase
      .from('goods_dispatch_items')
      .insert(dispatchItems);

    if (itemsError) {
      console.error('Error creating dispatch items:', itemsError);
      return {
        success: false,
        error: 'Failed to create dispatch items',
      };
    }

    // Update sales_order_items.dispatched_quantity if linked to sales order
    if (formData.sales_order_id) {
      // Group dispatched quantities by sales_order_item_id
      const dispatchedByOrderItem = new Map<string, number>();

      dispatchItems.forEach((item) => {
        if (item.sales_order_item_id && item.dispatched_quantity) {
          const current = dispatchedByOrderItem.get(item.sales_order_item_id) || 0;
          dispatchedByOrderItem.set(item.sales_order_item_id, current + item.dispatched_quantity);
        }
      });

      // Update each sales_order_item
      for (const [orderItemId, additionalQty] of dispatchedByOrderItem.entries()) {
        // Get current dispatched_quantity
        const orderItem = salesOrderItems.find((item) => item.id === orderItemId);
        if (orderItem) {
          const newDispatchedQty = (orderItem.dispatched_quantity || 0) + additionalQty;

          await supabase
            .from('sales_order_items')
            .update({
              dispatched_quantity: newDispatchedQty,
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderItemId)
            .eq('company_id', companyId);
        }
      }

      // Revalidate sales order path
      revalidatePath(`/dashboard/sales-orders/${formData.sales_order_id}`);
    }

    // Update stock unit statuses to 'dispatched'
    const { error: updateError } = await supabase
      .from('stock_units')
      .update({
        status: 'dispatched',
        modified_by: userId,
        updated_at: new Date().toISOString(),
      })
      .in('id', formData.stock_unit_ids)
      .eq('company_id', companyId);

    if (updateError) {
      console.error('Error updating stock units:', updateError);
      return {
        success: false,
        error: 'Failed to update stock unit statuses',
      };
    }

    // Revalidate relevant paths
    revalidatePath('/dashboard/inventory/goods-dispatch');
    revalidatePath('/dashboard/inventory/stock-units');

    return {
      success: true,
      dispatchId: dispatch.id,
    };
  } catch (error) {
    console.error('Unexpected error in createGoodsDispatch:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Gets a single goods dispatch with all related data
 */
export async function getGoodsDispatch(dispatchId: string) {
  try {
    const supabase = await createClient();

    // Get authenticated user and company_id
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData?.company_id) {
      throw new Error('Company not found');
    }

    // Get dispatch with relations
    const { data: dispatch, error } = await supabase
      .from('goods_dispatches')
      .select(
        `
        *,
        warehouses!goods_dispatches_warehouse_id_fkey (id, name),
        dispatch_to_partner:partners!goods_dispatches_dispatch_to_partner_id_fkey (id, company_name, partner_type),
        dispatch_to_warehouse:warehouses!goods_dispatches_dispatch_to_warehouse_id_fkey (id, name)
      `
      )
      .eq('id', dispatchId)
      .eq('company_id', userData.company_id)
      .single();

    if (error) {
      console.error('Error fetching dispatch:', error);
      return null;
    }

    // Get dispatch items with stock units (including dispatched_quantity)
    const { data: items } = await supabase
      .from('goods_dispatch_items')
      .select(
        `
        id,
        stock_unit_id,
        dispatched_quantity,
        created_at,
        stock_units (
          *,
          products (id, name, material, color, product_number, product_images),
          warehouses (id, name)
        )
      `
      )
      .eq('dispatch_id', dispatchId)
      .eq('company_id', userData.company_id);

    return {
      ...dispatch,
      items: items || [],
    };
  } catch (error) {
    console.error('Error in getGoodsDispatch:', error);
    return null;
  }
}

/**
 * Gets all goods dispatches with optional filters
 */
export async function getGoodsDispatches(filters?: {
  warehouse_id?: string;
  partner_id?: string;
  status?: string;
  link_type?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}) {
  try {
    const supabase = await createClient();

    // Get authenticated user and company_id
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData?.company_id) {
      throw new Error('Company not found');
    }

    let query = supabase
      .from('goods_dispatches')
      .select(
        `
        *,
        warehouses!goods_dispatches_warehouse_id_fkey (id, name),
        dispatch_to_partner:partners!goods_dispatches_dispatch_to_partner_id_fkey (id, company_name, partner_type),
        dispatch_to_warehouse:warehouses!goods_dispatches_dispatch_to_warehouse_id_fkey (id, name),
        items:goods_dispatch_items (dispatched_quantity)
      `
      )
      .eq('company_id', userData.company_id)
      .order('dispatch_date', { ascending: false });

    // Apply filters
    if (filters?.warehouse_id) {
      query = query.eq('warehouse_id', filters.warehouse_id);
    }
    if (filters?.partner_id) {
      query = query.eq('dispatch_to_partner_id', filters.partner_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.link_type) {
      query = query.eq('link_type', filters.link_type);
    }
    if (filters?.date_from) {
      query = query.gte('dispatch_date', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('dispatch_date', filters.date_to);
    }
    if (filters?.search) {
      query = query.or(
        `dispatch_number.ilike.%${filters.search}%,invoice_number.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching dispatches:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getGoodsDispatches:', error);
    return [];
  }
}

/**
 * Updates the status of a goods dispatch
 */
export async function updateDispatchStatus(dispatchId: string, status: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { data: userData } = await supabase
      .from('users')
      .select('id, company_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData?.company_id) {
      throw new Error('Company not found');
    }

    const { error } = await supabase
      .from('goods_dispatches')
      .update({
        status,
        modified_by: userData.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dispatchId)
      .eq('company_id', userData.company_id);

    if (error) {
      console.error('Error updating dispatch status:', error);
      return { success: false, error: 'Failed to update status' };
    }

    revalidatePath('/dashboard/inventory/goods-dispatch');
    return { success: true };
  } catch (error) {
    console.error('Error in updateDispatchStatus:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
