import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import GoodsDispatchClient from './GoodsDispatchClient';

export default async function GoodsDispatchesPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Get user details including role and warehouse
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('company_id, role, warehouse_id')
    .eq('auth_user_id', user.id)
    .single();

  if (userError || !userData?.company_id) {
    redirect('/dashboard');
  }

  // Fetch all dispatches
  let dispatchQuery = supabase
    .from('goods_dispatches')
    .select(
      `
      *,
      warehouses (id, name),
      dispatch_to_partner:dispatch_to_partner_id (id, company_name, partner_type),
      dispatch_to_warehouse:dispatch_to_warehouse_id (id, name)
    `
    )
    .eq('company_id', userData.company_id)
    .is('deleted_at', null);

  // Apply warehouse filtering for staff users
  if (userData.role === 'staff' && userData.warehouse_id) {
    dispatchQuery = dispatchQuery.eq('warehouse_id', userData.warehouse_id);
  }

  const { data: dispatches } = await dispatchQuery.order('dispatch_date', { ascending: false });

  // Fetch warehouses
  let warehouseQuery = supabase
    .from('warehouses')
    .select('id, name')
    .eq('company_id', userData.company_id)
    .is('deleted_at', null);

  // Apply warehouse filtering for staff users
  if (userData.role === 'staff' && userData.warehouse_id) {
    warehouseQuery = warehouseQuery.eq('id', userData.warehouse_id);
  }

  const { data: warehouses } = await warehouseQuery.order('name');

  // Fetch partners
  const { data: partners } = await supabase
    .from('partners')
    .select('id, name, partner_type')
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .order('name');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Goods Dispatches</h1>
              <p className="mt-1 text-sm text-gray-600">
                View and manage outgoing inventory dispatches
              </p>
            </div>
            <Link
              href="/dashboard/inventory/goods-dispatch/new"
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              New Dispatch
            </Link>
          </div>
        </div>

        {/* Client Component with filters and table */}
        <GoodsDispatchClient
          dispatches={dispatches || []}
          warehouses={warehouses || []}
          partners={partners || []}
        />
      </div>
    </div>
  );
}
