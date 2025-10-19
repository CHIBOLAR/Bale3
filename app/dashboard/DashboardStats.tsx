import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function DashboardStats({ companyId }: { companyId: string }) {
  const supabase = await createClient();

  // Fetch all stats in parallel
  const [
    { count: productsCount },
    { count: stockUnitsCount },
    { count: totalStockCount },
    { count: salesOrdersCount },
    { count: partnersCount },
    { count: warehousesCount },
    { count: dispatchedCount },
    { data: lowStockProducts },
  ] = await Promise.all([
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .is('deleted_at', null),
    supabase
      .from('stock_units')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'in_stock'),
    supabase
      .from('stock_units')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId),
    supabase
      .from('sales_orders')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .in('status', ['pending', 'confirmed', 'in_progress'])
      .is('deleted_at', null),
    supabase
      .from('partners')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .is('deleted_at', null),
    supabase
      .from('warehouses')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .is('deleted_at', null),
    supabase
      .from('stock_units')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'dispatched'),
    supabase
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
      .limit(10),
  ]);

  // Calculate low stock alerts
  const lowStockAlerts = lowStockProducts
    ?.map((product) => ({
      ...product,
      currentStock: product.stock_units?.length || 0,
    }))
    .filter((product) => product.currentStock < (product.minimum_stock_threshold || 0))
    .slice(0, 5);

  return (
    <>
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
    </>
  );
}
