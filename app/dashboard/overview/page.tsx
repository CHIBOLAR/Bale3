import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function OverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user data
  const { data: userData } = await supabase
    .from('users')
    .select('*, company:companies(*)')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  // Check if user is demo (either has is_demo flag or no user record)
  const isDemo = userData?.is_demo === true || !userData;
  let companyId = userData?.company_id;

  // For demo users without proper user record, fallback to demo company
  if (isDemo && !userData) {
    const { data: demoCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('is_demo', true)
      .single();
    companyId = demoCompany?.id;
  }

  // Get comprehensive analytics
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .is('deleted_at', null);

  const { count: totalStockUnits } = await supabase
    .from('stock_units')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  const { count: inStockUnits } = await supabase
    .from('stock_units')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'in_stock');

  const { count: dispatchedUnits } = await supabase
    .from('stock_units')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'dispatched');

  const { count: soldUnits } = await supabase
    .from('stock_units')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'sold');

  // Sales Orders Stats
  const { count: totalOrders } = await supabase
    .from('sales_orders')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .is('deleted_at', null);

  const { count: pendingOrders } = await supabase
    .from('sales_orders')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'pending')
    .is('deleted_at', null);

  const { count: confirmedOrders } = await supabase
    .from('sales_orders')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'confirmed')
    .is('deleted_at', null);

  const { count: inProgressOrders } = await supabase
    .from('sales_orders')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'in_progress')
    .is('deleted_at', null);

  const { count: completedOrders } = await supabase
    .from('sales_orders')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'completed')
    .is('deleted_at', null);

  const { count: cancelledOrders } = await supabase
    .from('sales_orders')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'cancelled')
    .is('deleted_at', null);

  // Revenue calculation
  const { data: ordersWithRevenue } = await supabase
    .from('sales_orders')
    .select('total_amount, status')
    .eq('company_id', companyId)
    .is('deleted_at', null);

  const totalRevenue = ordersWithRevenue?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
  const completedRevenue = ordersWithRevenue
    ?.filter(order => order.status === 'completed')
    .reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
  const pendingRevenue = ordersWithRevenue
    ?.filter(order => ['pending', 'confirmed', 'in_progress'].includes(order.status))
    .reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

  // Partners Stats
  const { count: totalPartners } = await supabase
    .from('partners')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .is('deleted_at', null);

  const { count: customersCount } = await supabase
    .from('partners')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .in('partner_type', ['Customer', 'Both'])
    .is('deleted_at', null);

  const { count: suppliersCount } = await supabase
    .from('partners')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .in('partner_type', ['Supplier', 'Both'])
    .is('deleted_at', null);

  const { count: vendorsCount } = await supabase
    .from('partners')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('partner_type', 'Vendor')
    .is('deleted_at', null);

  // Goods Movement Stats
  const { count: totalReceipts } = await supabase
    .from('goods_receipts')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  const { count: totalDispatches } = await supabase
    .from('goods_dispatches')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  const { count: warehouses } = await supabase
    .from('warehouses')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .is('deleted_at', null);

  // QR Codes
  const { count: qrBatches } = await supabase
    .from('barcode_batches')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  // Calculate percentages
  const stockUtilization = totalStockUnits ? Math.round((inStockUnits || 0) / totalStockUnits * 100) : 0;
  const orderCompletionRate = totalOrders ? Math.round((completedOrders || 0) / totalOrders * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Overview</h1>
          <p className="mt-2 text-sm text-gray-600">
            Comprehensive analytics and insights for {userData?.company?.name || 'Demo Company'}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>

      {isDemo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            You're viewing demo data. Request official access to see your own company analytics.
          </p>
        </div>
      )}

      {/* Key Performance Indicators */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-blue-100 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold mt-1">₹{totalRevenue.toLocaleString('en-IN')}</p>
            <p className="text-blue-100 text-xs mt-1">Completed: ₹{completedRevenue.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Order Completion Rate</p>
            <p className="text-3xl font-bold mt-1">{orderCompletionRate}%</p>
            <p className="text-blue-100 text-xs mt-1">{completedOrders} of {totalOrders} orders completed</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Stock Utilization</p>
            <p className="text-3xl font-bold mt-1">{stockUtilization}%</p>
            <p className="text-blue-100 text-xs mt-1">{inStockUnits} available of {totalStockUnits} total units</p>
          </div>
        </div>
      </div>

      {/* Inventory Overview */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Inventory Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts || 0}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Stock</p>
                <p className="text-2xl font-bold text-green-600">{inStockUnits || 0}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Dispatched</p>
                <p className="text-2xl font-bold text-orange-600">{dispatchedUnits || 0}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Sold</p>
                <p className="text-2xl font-bold text-purple-600">{soldUnits || 0}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Orders Breakdown */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Sales Orders Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{totalOrders || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Total Orders</p>
          </div>
          <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-yellow-700">{pendingOrders || 0}</p>
            <p className="text-sm text-yellow-600 mt-1">Pending</p>
          </div>
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-blue-700">{confirmedOrders || 0}</p>
            <p className="text-sm text-blue-600 mt-1">Confirmed</p>
          </div>
          <div className="border border-purple-200 bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-purple-700">{inProgressOrders || 0}</p>
            <p className="text-sm text-purple-600 mt-1">In Progress</p>
          </div>
          <div className="border border-green-200 bg-green-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-700">{completedOrders || 0}</p>
            <p className="text-sm text-green-600 mt-1">Completed</p>
          </div>
          <div className="border border-red-200 bg-red-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-red-700">{cancelledOrders || 0}</p>
            <p className="text-sm text-red-600 mt-1">Cancelled</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500">Pending Revenue</p>
            <p className="text-2xl font-bold text-gray-900">₹{pendingRevenue.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-500 mt-1">From pending, confirmed & in-progress orders</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500">Completed Revenue</p>
            <p className="text-2xl font-bold text-green-600">₹{completedRevenue.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-500 mt-1">From completed orders</p>
          </div>
        </div>
      </div>

      {/* Partners Overview */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Partners Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{totalPartners || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Total Partners</p>
          </div>
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-blue-700">{customersCount || 0}</p>
            <p className="text-sm text-blue-600 mt-1">Customers</p>
          </div>
          <div className="border border-green-200 bg-green-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-700">{suppliersCount || 0}</p>
            <p className="text-sm text-green-600 mt-1">Suppliers</p>
          </div>
          <div className="border border-purple-200 bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-purple-700">{vendorsCount || 0}</p>
            <p className="text-sm text-purple-600 mt-1">Vendors</p>
          </div>
        </div>
      </div>

      {/* Operations Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Goods Movement</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <p className="text-sm text-gray-500">Goods Receipts</p>
                <p className="text-2xl font-bold text-gray-900">{totalReceipts || 0}</p>
              </div>
              <Link href="/dashboard/inventory/goods-receipts" className="text-blue-600 hover:text-blue-700 text-sm">
                View →
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Goods Dispatches</p>
                <p className="text-2xl font-bold text-gray-900">{totalDispatches || 0}</p>
              </div>
              <Link href="/dashboard/inventory/goods-dispatch" className="text-blue-600 hover:text-blue-700 text-sm">
                View →
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Resources</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <p className="text-sm text-gray-500">Warehouses</p>
                <p className="text-2xl font-bold text-gray-900">{warehouses || 0}</p>
              </div>
              <Link href="/dashboard/warehouses" className="text-blue-600 hover:text-blue-700 text-sm">
                View →
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">QR Code Batches</p>
                <p className="text-2xl font-bold text-gray-900">{qrBatches || 0}</p>
              </div>
              <Link href="/dashboard/inventory/qr-codes" className="text-blue-600 hover:text-blue-700 text-sm">
                View →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard/products"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="h-8 w-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-sm font-medium text-gray-900">Products</span>
          </Link>
          <Link
            href="/dashboard/sales-orders"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="h-8 w-8 text-yellow-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">Orders</span>
          </Link>
          <Link
            href="/dashboard/inventory"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="h-8 w-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-sm font-medium text-gray-900">Inventory</span>
          </Link>
          <Link
            href="/dashboard/partners"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="h-8 w-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">Partners</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
