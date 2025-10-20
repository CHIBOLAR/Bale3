import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { getActiveWarehouse } from '@/lib/warehouse-context';

export default async function DashboardStats({ companyId }: { companyId: string }) {
  const supabase = await createClient();
  const activeWarehouseId = await getActiveWarehouse();

  // Get first and last day of current month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  // Build queries with warehouse filtering
  let salesOrdersQuery = supabase
    .from('sales_orders')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .in('status', ['pending', 'confirmed', 'in_progress'])
    .is('deleted_at', null);

  let jobWorksQuery = supabase
    .from('job_works')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .is('deleted_at', null);

  let dispatchedQuery = supabase
    .from('goods_dispatch_items')
    .select(`
      dispatched_quantity,
      stock_unit_id,
      stock_units!inner(
        size_quantity,
        product_id,
        warehouse_id,
        products!inner(measuring_unit)
      ),
      dispatch_id,
      goods_dispatches!inner(created_at)
    `)
    .eq('stock_units.company_id', companyId)
    .gte('goods_dispatches.created_at', firstDayOfMonth)
    .lte('goods_dispatches.created_at', lastDayOfMonth);

  let receivedQuery = supabase
    .from('goods_receipt_items')
    .select(`
      quantity_received,
      product_id,
      stock_unit_id,
      stock_units!inner(
        warehouse_id,
        products!inner(measuring_unit, company_id)
      ),
      receipt_id,
      goods_receipts!inner(created_at)
    `)
    .eq('stock_units.products.company_id', companyId)
    .gte('goods_receipts.created_at', firstDayOfMonth)
    .lte('goods_receipts.created_at', lastDayOfMonth);

  let productsQuery = supabase
    .from('products')
    .select(`
      id,
      name,
      product_number,
      min_stock_threshold,
      stock_units!inner(id, status, warehouse_id)
    `)
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .eq('stock_units.status', 'in_stock')
    .limit(10);

  // Apply warehouse filter if a specific warehouse is selected
  if (activeWarehouseId) {
    salesOrdersQuery = salesOrdersQuery.eq('fulfillment_warehouse_id', activeWarehouseId);
    jobWorksQuery = jobWorksQuery.eq('warehouse_id', activeWarehouseId);
    dispatchedQuery = dispatchedQuery.eq('stock_units.warehouse_id', activeWarehouseId);
    receivedQuery = receivedQuery.eq('stock_units.warehouse_id', activeWarehouseId);
    productsQuery = productsQuery.eq('stock_units.warehouse_id', activeWarehouseId);
  }

  // Fetch all stats in parallel
  const [
    { count: salesOrdersCount },
    { count: jobWorksCount },
    { data: dispatchedData },
    { data: receivedData },
    { data: lowStockProducts },
  ] = await Promise.all([
    salesOrdersQuery,
    jobWorksQuery,
    dispatchedQuery,
    receivedQuery,
    productsQuery,
  ]);

  // Calculate total dispatched this month (in m/kg)
  const totalDispatched = dispatchedData?.reduce((sum: number, item: any) => {
    const quantity = item.dispatched_quantity || item.stock_units?.size_quantity || 0;
    const unit = item.stock_units?.products?.measuring_unit;
    // Convert Yards to Meters (1 yard = 0.9144 meters)
    if (unit === 'Yards') {
      return sum + (quantity * 0.9144);
    }
    // Only count Meters and KG
    if (unit === 'Meters' || unit === 'KG') {
      return sum + quantity;
    }
    return sum;
  }, 0) || 0;

  // Calculate total received this month (in m/kg)
  const totalReceived = receivedData?.reduce((sum: number, item: any) => {
    const quantity = item.quantity_received || 0;
    const unit = item.stock_units?.products?.measuring_unit;
    // Convert Yards to Meters
    if (unit === 'Yards') {
      return sum + (quantity * 0.9144);
    }
    // Only count Meters and KG
    if (unit === 'Meters' || unit === 'KG') {
      return sum + quantity;
    }
    return sum;
  }, 0) || 0;

  // Calculate low stock alerts
  const lowStockAlerts = lowStockProducts
    ?.map((product) => ({
      ...product,
      currentStock: product.stock_units?.length || 0,
    }))
    .filter((product) => product.currentStock < (product.min_stock_threshold || 0))
    .slice(0, 5);

  return (
    <>
      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

        <Link href="/dashboard/job-works" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="rounded-md bg-purple-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Job Works</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{jobWorksCount || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="rounded-md bg-orange-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Dispatched (This Month)</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{Math.round(totalDispatched)}</dd>
                  <dd className="text-xs text-gray-500 mt-1">in m/kg</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="rounded-md bg-green-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Received (This Month)</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{Math.round(totalReceived)}</dd>
                  <dd className="text-xs text-gray-500 mt-1">in m/kg</dd>
                </dl>
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
                    <span className="text-sm text-gray-600">Min: {product.min_stock_threshold}</span>
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
