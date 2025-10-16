import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import GoodsReceiptsClient from './GoodsReceiptsClient';
import { getGoodsReceipts } from '@/app/actions/inventory/goods-receipts';
import { getWarehouses } from '@/app/actions/inventory/data';

export default async function GoodsReceiptsPage() {
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

  // Fetch all receipts and warehouses
  const [receipts, warehouses] = await Promise.all([
    getGoodsReceipts(),
    getWarehouses(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Goods Receipts</h1>
              <p className="mt-1 text-sm text-gray-600">
                View and manage incoming inventory receipts
              </p>
            </div>
            <Link
              href="/dashboard/inventory/goods-receipts/new"
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              New Goods Receipt
            </Link>
          </div>
        </div>

        {/* Client Component with filters and table */}
        <GoodsReceiptsClient receipts={receipts} warehouses={warehouses} />
      </div>
    </div>
  );
}
