'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface SalesOrderLineItem {
  product_id: string;
  required_quantity: number;
  unit_rate?: number;
  notes?: string;
}

export interface SalesOrderFormData {
  customer_id: string;
  agent_id?: string;
  order_date: string;
  expected_delivery_date: string;
  fulfillment_warehouse_id?: string;
  advance_amount?: string;
  discount_amount?: string;
  notes?: string;
  line_items: SalesOrderLineItem[];
}

interface CreateSalesOrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

/**
 * Generates a sequential order number
 * Format: SO-YYYY-MM-XXXXX (e.g., SO-2025-10-00001)
 */
async function generateOrderNumber(supabase: any, companyId: string): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `SO-${year}-${month}-`;

  // Get the last order number for this month
  const { data: lastOrder } = await supabase
    .from('sales_orders')
    .select('order_number')
    .eq('company_id', companyId)
    .like('order_number', `${prefix}%`)
    .order('order_number', { ascending: false })
    .limit(1)
    .single();

  let sequence = 1;
  if (lastOrder) {
    const lastNumber = lastOrder.order_number.split('-').pop();
    sequence = parseInt(lastNumber || '0', 10) + 1;
  }

  return `${prefix}${String(sequence).padStart(5, '0')}`;
}

/**
 * Creates a sales order with line items
 */
export async function createSalesOrder(
  formData: SalesOrderFormData
): Promise<CreateSalesOrderResult> {
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

    // Validate customer exists and belongs to company
    const { data: customer } = await supabase
      .from('partners')
      .select('id, partner_type')
      .eq('id', formData.customer_id)
      .eq('company_id', companyId)
      .single();

    if (!customer) {
      return {
        success: false,
        error: 'Customer not found',
      };
    }

    // Validate line items
    if (!formData.line_items || formData.line_items.length === 0) {
      return {
        success: false,
        error: 'At least one line item is required',
      };
    }

    // Calculate total amount from line items
    const totalAmount = formData.line_items.reduce((sum, item) => {
      const itemTotal = item.required_quantity * (item.unit_rate || 0);
      return sum + itemTotal;
    }, 0);

    const advanceAmount = formData.advance_amount ? parseFloat(formData.advance_amount) : 0;
    const discountAmount = formData.discount_amount ? parseFloat(formData.discount_amount) : 0;
    const finalTotal = totalAmount - discountAmount;

    // Generate order number
    const orderNumber = await generateOrderNumber(supabase, companyId);

    // Create sales_order
    const { data: order, error: orderError } = await supabase
      .from('sales_orders')
      .insert({
        company_id: companyId,
        order_number: orderNumber,
        customer_id: formData.customer_id,
        agent_id: formData.agent_id || null,
        order_date: formData.order_date,
        expected_delivery_date: formData.expected_delivery_date,
        fulfillment_warehouse_id: formData.fulfillment_warehouse_id || null,
        advance_amount: advanceAmount,
        discount_amount: discountAmount,
        total_amount: finalTotal,
        status: 'pending',
        notes: formData.notes || null,
        created_by: userId,
        modified_by: userId,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Error creating sales order:', orderError);
      return {
        success: false,
        error: 'Failed to create sales order',
      };
    }

    // Create order line items
    const lineItems = formData.line_items.map((item) => ({
      company_id: companyId,
      sales_order_id: order.id,
      product_id: item.product_id,
      required_quantity: item.required_quantity,
      unit_rate: item.unit_rate || null,
      notes: item.notes || null,
    }));

    const { error: itemsError } = await supabase
      .from('sales_order_items')
      .insert(lineItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      return {
        success: false,
        error: 'Failed to create order items',
      };
    }

    // Revalidate relevant paths
    revalidatePath('/dashboard/sales-orders');

    return {
      success: true,
      orderId: order.id,
    };
  } catch (error) {
    console.error('Unexpected error in createSalesOrder:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Gets a single sales order with all related data
 */
export async function getSalesOrder(orderId: string) {
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

    // Get order with relations
    const { data: order, error } = await supabase
      .from('sales_orders')
      .select(
        `
        *,
        customer:partners!sales_orders_customer_id_fkey (id, company_name, first_name, last_name, partner_type),
        agent:partners!sales_orders_agent_id_fkey (id, company_name, first_name, last_name),
        fulfillment_warehouse:warehouses (id, name)
      `
      )
      .eq('id', orderId)
      .eq('company_id', userData.company_id)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return null;
    }

    // Get order items with products
    const { data: items } = await supabase
      .from('sales_order_items')
      .select(
        `
        *,
        products (
          id,
          name,
          product_number,
          material,
          color,
          measuring_unit,
          selling_price_per_unit,
          product_images
        )
      `
      )
      .eq('sales_order_id', orderId)
      .eq('company_id', userData.company_id);

    return {
      ...order,
      items: items || [],
    };
  } catch (error) {
    console.error('Error in getSalesOrder:', error);
    return null;
  }
}

/**
 * Gets all sales orders with optional filters
 */
export async function getSalesOrders(filters?: {
  customer_id?: string;
  warehouse_id?: string;
  status?: string;
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
      .from('sales_orders')
      .select(
        `
        *,
        customer:partners!sales_orders_customer_id_fkey (id, company_name, first_name, last_name, partner_type),
        fulfillment_warehouse:warehouses (id, name)
      `
      )
      .eq('company_id', userData.company_id)
      .order('order_date', { ascending: false });

    // Apply filters
    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }
    if (filters?.warehouse_id) {
      query = query.eq('fulfillment_warehouse_id', filters.warehouse_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.date_from) {
      query = query.gte('order_date', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('order_date', filters.date_to);
    }
    if (filters?.search) {
      query = query.or(
        `order_number.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getSalesOrders:', error);
    return [];
  }
}

/**
 * Updates a sales order
 */
export async function updateSalesOrder(
  orderId: string,
  formData: Partial<SalesOrderFormData>
) {
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

    // Build update object
    const updateData: any = {
      modified_by: userData.id,
      updated_at: new Date().toISOString(),
    };

    if (formData.customer_id) updateData.customer_id = formData.customer_id;
    if (formData.agent_id !== undefined) updateData.agent_id = formData.agent_id || null;
    if (formData.order_date) updateData.order_date = formData.order_date;
    if (formData.expected_delivery_date) updateData.expected_delivery_date = formData.expected_delivery_date;
    if (formData.fulfillment_warehouse_id !== undefined) {
      updateData.fulfillment_warehouse_id = formData.fulfillment_warehouse_id || null;
    }
    if (formData.advance_amount !== undefined) {
      updateData.advance_amount = formData.advance_amount ? parseFloat(formData.advance_amount) : 0;
    }
    if (formData.discount_amount !== undefined) {
      updateData.discount_amount = formData.discount_amount ? parseFloat(formData.discount_amount) : 0;
    }
    if (formData.notes !== undefined) updateData.notes = formData.notes || null;

    const { error } = await supabase
      .from('sales_orders')
      .update(updateData)
      .eq('id', orderId)
      .eq('company_id', userData.company_id);

    if (error) {
      console.error('Error updating order:', error);
      return { success: false, error: 'Failed to update order' };
    }

    revalidatePath('/dashboard/sales-orders');
    revalidatePath(`/dashboard/sales-orders/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error('Error in updateSalesOrder:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Updates the status of a sales order
 */
export async function updateOrderStatus(orderId: string, status: string) {
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
      .from('sales_orders')
      .update({
        status,
        modified_by: userData.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('company_id', userData.company_id);

    if (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: 'Failed to update status' };
    }

    revalidatePath('/dashboard/sales-orders');
    revalidatePath(`/dashboard/sales-orders/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Soft deletes a sales order
 */
export async function deleteSalesOrder(orderId: string) {
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
      .from('sales_orders')
      .update({
        deleted_at: new Date().toISOString(),
        modified_by: userData.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('company_id', userData.company_id);

    if (error) {
      console.error('Error deleting order:', error);
      return { success: false, error: 'Failed to delete order' };
    }

    revalidatePath('/dashboard/sales-orders');
    return { success: true };
  } catch (error) {
    console.error('Error in deleteSalesOrder:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
