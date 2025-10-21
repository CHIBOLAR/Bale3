import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import FastGoodsReceiptForm from './FastGoodsReceiptForm';

export default async function NewGoodsReceiptPage() {
  const supabase = await createClient();

  // Get user data
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's company_id and user id
  const { data: userData } = await supabase
    .from('users')
    .select('id, company_id')
    .eq('auth_user_id', user.id)
    .single();

  if (!userData?.company_id) {
    redirect('/dashboard');
  }

  // Fetch all required data in parallel
  const [warehousesResult, productsResult, partnersResult, recentReceiptsResult] = await Promise.all([
    supabase
      .from('warehouses')
      .select('id, name')
      .eq('company_id', userData.company_id)
      .is('deleted_at', null)
      .order('name'),
    supabase
      .from('products')
      .select('id, name, product_number, measuring_unit, material, color, product_images')
      .eq('company_id', userData.company_id)
      .is('deleted_at', null)
      .order('name'),
    supabase
      .from('partners')
      .select('id, company_name, partner_code, partner_type')
      .eq('company_id', userData.company_id)
      .is('deleted_at', null)
      .order('company_name'),
    supabase
      .from('goods_receipts')
      .select(`
        id,
        receipt_number,
        receipt_date,
        link_type,
        warehouses!warehouse_id (name),
        partners:issued_by_partner_id (company_name),
        goods_receipt_items (quantity_received)
      `)
      .eq('company_id', userData.company_id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const recentReceipts = recentReceiptsResult.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">New Goods Receipt</h1>
        <p className="mt-1 text-sm text-gray-600">
          Fast entry for receiving materials
        </p>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6">
        <div className="mx-auto max-w-4xl">
          <FastGoodsReceiptForm
            warehouses={warehousesResult.data || []}
            products={productsResult.data || []}
            partners={partnersResult.data || []}
          />
        </div>
      </div>

      {/* Recent Receipts - Below on mobile, sidebar on desktop */}
      <div className="px-4 sm:px-6 pb-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">Recent Receipts</h2>
              <a
                href="/dashboard/inventory/goods-receipts"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all →
              </a>
            </div>

            <div className="space-y-2">
              {recentReceipts.length === 0 ? (
                <p className="text-sm text-gray-500">No recent receipts found</p>
              ) : (
                recentReceipts.map((receipt: any) => {
                  const totalQty = receipt.goods_receipt_items?.reduce(
                    (sum: number, item: any) => sum + (item.quantity_received || 0),
                    0
                  ) || 0;

                  return (
                    <a
                      key={receipt.id}
                      href={`/dashboard/inventory/goods-receipts/${receipt.id}`}
                      className="block rounded-lg border border-gray-200 p-2 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-medium text-gray-900">
                          {receipt.receipt_number}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(receipt.receipt_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">
                          {receipt.link_type === 'purchase' && 'Purchase'}
                          {receipt.link_type === 'transfer' && 'Transfer'}
                          {receipt.link_type === 'job_work_return' && 'Job Work Return'}
                          {receipt.link_type === 'sales_return' && 'Sales Return'}
                          {receipt.link_type === 'production' && 'Production'}
                        </span>
                        {receipt.partners?.company_name && (
                          <span className="text-gray-500"> from {receipt.partners.company_name}</span>
                        )}
                        <span className="ml-2 font-medium text-gray-900">{totalQty} rolls</span>
                      </div>
                    </a>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
