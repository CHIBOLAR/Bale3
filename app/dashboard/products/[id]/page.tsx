import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  // Fetch product details
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .single()

  if (productError || !product) {
    notFound()
  }

  // Get stock units count for this product
  const { count: stockUnitsCount } = await supabase
    .from('stock_units')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', product.id)
    .is('deleted_at', null)

  const isDemo = userData.is_demo
  const canEdit = !isDemo

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/products"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-blue">
              {product.name}
            </h1>
            {product.product_number && (
              <p className="text-sm md:text-base text-gray-500 mt-1">
                Product #{product.product_number}
              </p>
            )}
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/dashboard/products/${product.id}/edit`}
            className="inline-flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange/90 transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Product
          </Link>
        )}
      </div>

      {/* Product Details */}
      <div className="grid gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Basic Information
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Product Name</p>
              <p className="text-base font-semibold text-gray-900">{product.name}</p>
            </div>
            {product.product_number && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Product Number</p>
                <p className="text-base font-semibold text-gray-900">#{product.product_number}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 mb-1">Show on Catalog</p>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                product.show_on_catalog
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {product.show_on_catalog ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Material & Color */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Material & Color
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.material && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Material</p>
                <p className="text-base font-semibold text-gray-900">{product.material}</p>
              </div>
            )}
            {product.color && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Color</p>
                <div className="flex items-center gap-2">
                  {product.color_hex && (
                    <div
                      className="w-6 h-6 rounded border-2 border-gray-300"
                      style={{ backgroundColor: product.color_hex }}
                    />
                  )}
                  <p className="text-base font-semibold text-gray-900">{product.color}</p>
                </div>
              </div>
            )}
            {product.pantone_code && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Pantone Code</p>
                <p className="text-base font-semibold text-gray-900">{product.pantone_code}</p>
              </div>
            )}
            {product.gsm && (
              <div>
                <p className="text-sm text-gray-500 mb-1">GSM (Weight)</p>
                <p className="text-base font-semibold text-gray-900">{product.gsm} GSM</p>
              </div>
            )}
          </div>
        </div>

        {/* Pricing & Measurements */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pricing & Measurements
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.measuring_unit && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Measuring Unit</p>
                <p className="text-base font-semibold text-gray-900">{product.measuring_unit}</p>
              </div>
            )}
            {product.selling_price_per_unit && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Selling Price per Unit</p>
                <p className="text-base font-semibold text-brand-blue">
                  �{product.selling_price_per_unit}
                  {product.measuring_unit && `/${product.measuring_unit}`}
                </p>
              </div>
            )}
            {product.min_stock_threshold && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Minimum Stock Alert Level</p>
                <p className="text-base font-semibold text-gray-900">
                  {product.min_stock_threshold} {product.measuring_unit}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Dimensions */}
        {(product.width || product.length) && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              Dimensions
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.width && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Width</p>
                  <p className="text-base font-semibold text-gray-900">{product.width}</p>
                </div>
              )}
              {product.length && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Length</p>
                  <p className="text-base font-semibold text-gray-900">{product.length}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stock Information */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Stock Information
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Stock Units Count</p>
              <p className="text-base font-semibold text-gray-900">{stockUnitsCount || 0} units</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Stock units module will be implemented in the next phase to track individual rolls, pieces, or batches of this product.
            </p>
          </div>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1.5 text-sm font-medium bg-brand-green/10 text-brand-green rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Description
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Record Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Created</p>
              <p className="text-base font-semibold text-gray-900">
                {new Date(product.created_at).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Last Updated</p>
              <p className="text-base font-semibold text-gray-900">
                {new Date(product.updated_at).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

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
                You're viewing sample product information. To edit and manage your own products,
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
