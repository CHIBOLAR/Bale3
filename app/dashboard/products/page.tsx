import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProductsClient from './ProductsClient'

export default async function ProductsPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Get user details to find company_id
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('company_id, role, is_demo')
    .eq('auth_user_id', user.id)
    .single()

  if (userError || !userData?.company_id) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800">Company not found. Please contact support.</p>
        </div>
      </div>
    )
  }

  // Fetch products without nested stock_units for performance
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100)

  if (productsError) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800">Failed to load products.</p>
        </div>
      </div>
    )
  }

  // Fetch stock counts separately
  const productIds = products?.map(p => p.id) || []
  const stockMap = new Map<string, number>()

  if (productIds.length > 0) {
    const { data: stockCounts } = await supabase
      .from('stock_units')
      .select('product_id')
      .in('product_id', productIds)
      .is('deleted_at', null)

    stockCounts?.forEach(s => {
      const count = stockMap.get(s.product_id) || 0
      stockMap.set(s.product_id, count + 1)
    })
  }

  const productsWithStock = products?.map(p => ({
    ...p,
    stock_units: Array(stockMap.get(p.id) || 0).fill({ id: '', status: '' })
  }))

  const isDemo = userData.is_demo
  const canCreateProduct = !isDemo

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-blue mb-2">
            Products
          </h1>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            Manage your fabric products and inventory catalog
          </p>
        </div>
        {canCreateProduct && (
          <Link
            href="/dashboard/products/add"
            className="inline-flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange/90 transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Link>
        )}
      </div>

      {/* Products List */}
      {productsWithStock && productsWithStock.length > 0 ? (
        <ProductsClient products={productsWithStock} canCreateProduct={canCreateProduct} />
      ) : (
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by adding your first product to the catalog
          </p>
          {canCreateProduct && (
            <Link
              href="/dashboard/products/add"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange/90 transition-all shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Product
            </Link>
          )}
        </div>
      )}

      {isDemo && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-amber-800 text-sm font-medium leading-relaxed">
                Demo Mode - Read Only
              </p>
              <p className="text-amber-700 text-sm leading-relaxed mt-1">
                You're viewing sample products. To create and manage your own products,
                <Link href="/dashboard/request-upgrade" className="underline font-medium ml-1">
                  request official access
                </Link>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
