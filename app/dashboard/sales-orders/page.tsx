import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SalesOrdersClient from './SalesOrdersClient';

export default async function SalesOrdersPage() {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's company_id and check if demo
  const { data: userData } = await supabase
    .from('users')
    .select('company_id, is_demo')
    .eq('auth_user_id', user.id)
    .single();

  if (!userData?.company_id) {
    redirect('/error');
  }

  // Fetch sales orders with relations
  const { data: orders, error: ordersError } = await supabase
    .from('sales_orders')
    .select(
      `
      *,
      customer:partners!sales_orders_customer_id_fkey (id, company_name, first_name, last_name, partner_type),
      fulfillment_warehouse:warehouses (id, name)
    `
    )
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .order('order_date', { ascending: false });

  if (ordersError) {
    console.error('Error fetching sales orders:', ordersError);
  }

  return (
    <div className="p-6">
      <SalesOrdersClient orders={orders || []} canEdit={!userData.is_demo} />
    </div>
  );
}
