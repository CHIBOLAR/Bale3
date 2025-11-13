import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductWithInventory } from '@/app/actions/products/data'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductStockMetrics } from '@/components/products/ProductStockMetrics'
import { ProductPrimaryDetails } from '@/components/products/ProductPrimaryDetails'
import { ProductStockLocations } from '@/components/products/ProductStockLocations'
import { StockUnitsTab } from './StockUnitsTab'
import { DetailsTab } from './DetailsTab'
import { HistoryTab } from './HistoryTab'
import { AlertTriangle, Download } from 'lucide-react'

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

  // Fetch comprehensive product data with inventory
  const productData = await getProductWithInventory(id, userData.company_id)

  if (!productData) {
    notFound()
  }

  const {
    product,
    stockUnits,
    totalAvailableQuantity,
    totalReservedQuantity,
    totalDispatchedQuantity,
    totalStockValue,
    warehouseBreakdown,
    isLowStock,
  } = productData

  const isDemo = userData.is_demo
  const canEdit = !isDemo
  const totalQuantity = totalAvailableQuantity + totalReservedQuantity + totalDispatchedQuantity

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <Link
            href="/dashboard/products"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {product.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Product ID: <span className="font-medium">{product.product_number}</span>
              {product.updated_at && (
                <>
                  {' • '}Updated at:{' '}
                  {new Date(product.updated_at).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
          {canEdit && (
            <Link
              href={`/dashboard/products/${product.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              EDIT
            </Link>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      {isLowStock && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 text-sm font-medium">Low Stock Alert</p>
              <p className="text-red-700 text-sm mt-1">
                Current stock ({totalAvailableQuantity} {product.measuring_unit}) is below the minimum threshold ({product.min_stock_threshold} {product.measuring_unit}).
                Consider reordering soon.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stock-units">
            Stock Units
            {stockUnits.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-brand-blue text-white rounded-full">
                {stockUnits.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stock Metrics */}
          <ProductStockMetrics
            totalQuantity={totalQuantity}
            minThreshold={product.min_stock_threshold}
            pricePerUnit={product.selling_price_per_unit}
            totalValue={totalStockValue}
            measuringUnit={product.measuring_unit}
            isLowStock={isLowStock}
          />

          {/* Primary Details */}
          <ProductPrimaryDetails product={product} />

          {/* Stock Locations */}
          <ProductStockLocations
            warehouseBreakdown={warehouseBreakdown}
            measuringUnit={product.measuring_unit}
          />
        </TabsContent>

        <TabsContent value="stock-units">
          <StockUnitsTab
            stockUnits={stockUnits}
            productId={product.id}
            measuringUnit={product.measuring_unit}
          />
        </TabsContent>

        <TabsContent value="details">
          <DetailsTab product={product} />
        </TabsContent>

        <TabsContent value="history">
          <HistoryTab productId={product.id} productName={product.name} />
        </TabsContent>
      </Tabs>

      {isDemo && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
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
