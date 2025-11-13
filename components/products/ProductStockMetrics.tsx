import { Package, AlertTriangle, IndianRupee, TrendingUp } from 'lucide-react'

interface ProductStockMetricsProps {
  totalQuantity: number
  minThreshold: number | null
  pricePerUnit: number | null
  totalValue: number
  measuringUnit: string | null
  isLowStock: boolean
}

export function ProductStockMetrics({
  totalQuantity,
  minThreshold,
  pricePerUnit,
  totalValue,
  measuringUnit,
  isLowStock,
}: ProductStockMetricsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
    }).format(value)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Quantity Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-500">Quantity • {measuringUnit || 'units'}</p>
          <Package className="w-5 h-5 text-brand-blue" />
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-gray-900">{formatNumber(totalQuantity)}</p>
          {isLowStock && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              Low
            </span>
          )}
        </div>
        {measuringUnit && (
          <p className="text-xs text-gray-400 mt-1">{measuringUnit}</p>
        )}
      </div>

      {/* Min Level Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-500">Min Level • {measuringUnit || 'units'}</p>
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-gray-900">
            {minThreshold ? formatNumber(minThreshold) : '—'}
          </p>
        </div>
        {minThreshold && measuringUnit && (
          <p className="text-xs text-gray-400 mt-1">{measuringUnit}</p>
        )}
      </div>

      {/* Price Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-500">Price • per {measuringUnit || 'units'}</p>
          <IndianRupee className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex items-baseline gap-1">
          <p className="text-3xl font-bold text-gray-900">
            {pricePerUnit ? formatCurrency(pricePerUnit) : '—'}
          </p>
        </div>
        {pricePerUnit && (
          <p className="text-xs text-gray-400 mt-1">₹{pricePerUnit}</p>
        )}
      </div>

      {/* Total Value Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-500">Total value</p>
          <TrendingUp className="w-5 h-5 text-brand-blue" />
        </div>
        <div className="flex items-baseline gap-1">
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(totalValue)}
          </p>
        </div>
        <p className="text-xs text-gray-400 mt-1">₹{Math.round(totalValue)}</p>
      </div>
    </div>
  )
}
