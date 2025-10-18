import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import QuickActions from './QuickActions';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { upgraded?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if user just upgraded
  const justUpgraded = searchParams.upgraded === 'true';

  // Check if user has a full account
  const { data: userData } = await supabase
    .from('users')
    .select('*, company:companies(*)')
    .eq('auth_user_id', user?.id)
    .single();

  // Check if user is demo (either has is_demo flag or no user record)
  const isDemo = userData?.is_demo === true || !userData;

  let companyId = userData?.company_id;
  let companyName = userData?.company?.name;
  let firstName = userData?.first_name;

  // For demo users without proper user record, fallback to demo company
  if (isDemo && !userData) {
    const { data: demoCompany } = await supabase
      .from('companies')
      .select('id, name')
      .eq('is_demo', true)
      .single();

    companyId = demoCompany?.id;
    companyName = demoCompany?.name;
    firstName = user?.email?.split('@')[0] || 'Demo User';
  }

  // Get comprehensive stats
  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .is('deleted_at', null);

  const { count: stockUnitsCount } = await supabase
    .from('stock_units')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'in_stock');

  const { count: totalStockCount } = await supabase
    .from('stock_units')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  const { count: salesOrdersCount } = await supabase
    .from('sales_orders')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .in('status', ['pending', 'confirmed', 'in_progress'])
    .is('deleted_at', null);

  const { count: partnersCount } = await supabase
    .from('partners')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .is('deleted_at', null);

  const { count: warehousesCount } = await supabase
    .from('warehouses')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .is('deleted_at', null);

  const { count: dispatchedCount } = await supabase
    .from('stock_units')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'dispatched');

  // Get recent activities
  const { data: recentOrders } = await supabase
    .from('sales_orders')
    .select('id, order_number, total_amount, status, created_at, customer:partners!sales_orders_customer_id_fkey(company_name, first_name, last_name)')
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: recentReceipts } = await supabase
    .from('goods_receipts')
    .select('id, receipt_number, created_at, partners:partners!goods_receipts_issued_by_partner_id_fkey(company_name)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get low stock products
  const { data: lowStockProducts } = await supabase
    .from('products')
    .select(`
      id,
      name,
      product_number,
      minimum_stock_threshold,
      stock_units!inner(id, status)
    `)
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .eq('stock_units.status', 'in_stock')
    .limit(10);

  // Calculate low stock alerts
  const lowStockAlerts = lowStockProducts
    ?.map((product) => ({
      ...product,
      currentStock: product.stock_units?.length || 0,
    }))
    .filter((product) => product.currentStock < (product.minimum_stock_threshold || 0))
    .slice(0, 5);

  return (
    <div>
      {/* Upgrade Success Banner */}
      {justUpgraded && !isDemo && (
        <div className="mb-6 bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <svg
                  className="h-6 w-6 text-green-200 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold">🎉 Account Upgraded Successfully!</h3>
              </div>
              <p className="mt-2 text-sm text-green-100">
                Welcome to your full access account! All demo restrictions have been removed. You now have your own private company workspace with unlimited access to all features.
              </p>
              <div className="mt-3 bg-green-800/30 rounded-md p-3">
                <p className="text-sm font-medium text-green-50">✓ Your own private company created</p>
                <p className="text-sm font-medium text-green-50">✓ Unlimited products, partners, and orders</p>
                <p className="text-sm font-medium text-green-50">✓ Team collaboration enabled</p>
                <p className="text-sm font-medium text-green-50">✓ Full data control and management</p>
              </div>
              <div className="mt-4">
                <Link
                  href="/dashboard/account-status"
                  className="inline-flex items-center px-4 py-2 bg-white text-green-600 rounded-md font-medium hover:bg-green-50 transition-colors"
                >
                  View Full Access Details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demo Banner */}
      {isDemo && (
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <svg
                  className="h-6 w-6 text-blue-200 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold">Demo Mode</h3>
              </div>
              <p className="mt-2 text-sm text-blue-100">
                You're exploring with read-only access to sample data. To create your own company
                with full access, team collaboration, and your own data, request official access.
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  href="/dashboard/request-upgrade"
                  className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-blue-50 transition-colors"
                >
                  Request Official Access
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 text-white border border-white/30 rounded-md font-medium hover:bg-white/10 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {firstName}!
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {companyName}
          {isDemo && <span className="ml-2 text-blue-600 font-medium">(Demo Mode)</span>}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/products" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="rounded-md bg-blue-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{productsCount || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/inventory/stock-units" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="rounded-md bg-green-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">In Stock</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{stockUnitsCount || 0}</dd>
                  <dd className="text-xs text-gray-500 mt-1">of {totalStockCount || 0} total units</dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/sales-orders" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="rounded-md bg-yellow-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Orders</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{salesOrdersCount || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/partners" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="rounded-md bg-purple-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Partners</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{partnersCount || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Secondary Stats */}
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <dt className="text-sm font-medium text-gray-500">Warehouses</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">{warehousesCount || 0}</dd>
              </div>
              <div className="rounded-md bg-indigo-100 p-3">
                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <dt className="text-sm font-medium text-gray-500">Dispatched</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">{dispatchedCount || 0}</dd>
              </div>
              <div className="rounded-md bg-orange-100 p-3">
                <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <dt className="text-sm font-medium text-gray-500">Low Stock Alerts</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">{lowStockAlerts?.length || 0}</dd>
              </div>
              <div className="rounded-md bg-red-100 p-3">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities and Low Stock Grid */}
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

      {/* Low Stock Alerts */}
      {lowStockAlerts && lowStockAlerts.length > 0 && (
        <div className="mt-5 bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Low Stock Alerts
              </h2>
              <Link href="/dashboard/products" className="text-sm text-blue-600 hover:text-blue-700">
                View all products →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockAlerts.map((product: any) => (
                <Link key={product.id} href={`/dashboard/products/${product.id}`} className="block p-4 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.product_number}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-red-700">Current: {product.currentStock}</span>
                    <span className="text-sm text-gray-600">Min: {product.minimum_stock_threshold}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <QuickActions isDemo={isDemo} />
    </div>
  );
}
