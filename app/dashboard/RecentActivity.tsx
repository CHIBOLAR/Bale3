import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function RecentActivity({ companyId }: { companyId: string }) {
  const supabase = await createClient();

  // Fetch recent activities in parallel
  const [{ data: recentOrders }, { data: recentReceipts }] = await Promise.all([
    supabase
      .from('sales_orders')
      .select('id, order_number, total_amount, status, created_at, customer:partners!sales_orders_customer_id_fkey(company_name, first_name, last_name)')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('goods_receipts')
      .select('id, receipt_number, created_at, partners:partners!goods_receipts_issued_by_partner_id_fkey(company_name)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
      {/* Recent Sales Orders */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Sales Orders</h2>
            <Link href="/dashboard/sales-orders" className="text-sm text-blue-600 hover:text-blue-700">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.map((order: any) => (
                <Link key={order.id} href={`/dashboard/sales-orders/${order.id}`} className="block p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{order.order_number}</p>
                      <p className="text-sm text-gray-500">
                        {order.customer?.company_name || `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{order.total_amount?.toLocaleString('en-IN')}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No recent orders</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Goods Receipts */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Goods Receipts</h2>
            <Link href="/dashboard/inventory/goods-receipts" className="text-sm text-blue-600 hover:text-blue-700">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentReceipts && recentReceipts.length > 0 ? (
              recentReceipts.map((receipt: any) => (
                <Link key={receipt.id} href={`/dashboard/inventory/goods-receipts/${receipt.id}`} className="block p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{receipt.receipt_number}</p>
                      <p className="text-sm text-gray-500">{receipt.partners?.company_name || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(receipt.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No recent receipts</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
