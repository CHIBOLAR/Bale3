import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SalesOrderForm from '../SalesOrderForm';

export default async function NewSalesOrderPage() {
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

  // Block demo users from creating sales orders
  if (userData.is_demo) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-lg border-2 border-yellow-400 bg-yellow-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-yellow-900">Demo Mode</h2>
          <p className="mb-4 text-sm text-yellow-800">
            Sales order creation is not available in demo mode.
          </p>
          <a
            href="/dashboard/request-upgrade"
            className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Request Full Access
          </a>
        </div>
      </div>
    );
  }

  // Fetch customers (partners with Customer type)
  const { data: customers } = await supabase
    .from('partners')
    .select('id, company_name, first_name, last_name, partner_type')
    .eq('company_id', userData.company_id)
    .or('partner_type.eq.Customer,partner_type.eq.Both')
    .is('deleted_at', null)
    .order('company_name');

  // Fetch agents
  const { data: agents } = await supabase
    .from('partners')
    .select('id, company_name, first_name, last_name, partner_type')
    .eq('company_id', userData.company_id)
    .eq('partner_type', 'Agent')
    .is('deleted_at', null)
    .order('company_name');

  // Fetch warehouses
  const { data: warehouses } = await supabase
    .from('warehouses')
    .select('id, name')
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .order('name');

  // Fetch products
  const { data: products } = await supabase
    .from('products')
    .select('id, name, product_number, material, color, measuring_unit, selling_price_per_unit')
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .order('name');

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Sales Order</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a new sales order for your customer
        </p>
      </div>

      <SalesOrderForm
        customers={customers || []}
        agents={agents || []}
        warehouses={warehouses || []}
        products={products || []}
        mode="create"
      />
    </div>
  );
}
