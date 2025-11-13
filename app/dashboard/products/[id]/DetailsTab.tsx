import { FileText, DollarSign, Package2 } from 'lucide-react'

interface DetailsTabProps {
  product: {
    measuring_unit: string
    cost_price_per_unit?: number
    selling_price_per_unit?: number
    min_stock_alert: boolean
    min_stock_threshold?: number
    hsn_code?: string
    sac_code?: string
    notes?: string
    description?: string
  }
}

export function DetailsTab({ product }: DetailsTabProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Pricing Information */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-brand-blue" />
          Pricing Information
        </h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Measuring Unit</p>
            <p className="text-base font-semibold text-gray-900">{product.measuring_unit}</p>
          </div>

          {product.cost_price_per_unit !== undefined && product.cost_price_per_unit !== null && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Cost Price per Unit</p>
              <p className="text-base font-semibold text-gray-900">
                {formatCurrency(product.cost_price_per_unit)}
              </p>
            </div>
          )}

          {product.selling_price_per_unit !== undefined && product.selling_price_per_unit !== null && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Selling Price per Unit</p>
              <p className="text-base font-semibold text-brand-blue">
                {formatCurrency(product.selling_price_per_unit)}
              </p>
            </div>
          )}

          {product.selling_price_per_unit &&
            product.cost_price_per_unit &&
            product.selling_price_per_unit > product.cost_price_per_unit && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  Margin: {formatCurrency(product.selling_price_per_unit - product.cost_price_per_unit)} (
                  {(
                    ((product.selling_price_per_unit - product.cost_price_per_unit) /
                      product.cost_price_per_unit) *
                    100
                  ).toFixed(1)}
                  %)
                </p>
              </div>
            )}
        </div>
      </div>

      {/* Stock Management */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Package2 className="w-6 h-6 text-brand-blue" />
          Stock Management
        </h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Minimum Stock Alert</p>
            <span
              className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                product.min_stock_alert
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {product.min_stock_alert ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          {product.min_stock_alert && product.min_stock_threshold !== undefined && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Minimum Stock Threshold</p>
              <p className="text-base font-semibold text-gray-900">
                {product.min_stock_threshold} {product.measuring_unit}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                You'll be notified when stock falls below this level
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tax Information */}
      {(product.hsn_code || product.sac_code) && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-blue" />
            Tax Information
          </h2>

          <div className="space-y-4">
            {product.hsn_code && (
              <div>
                <p className="text-sm text-gray-500 mb-1">HSN Code</p>
                <p className="text-base font-semibold text-gray-900">{product.hsn_code}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Harmonized System of Nomenclature
                </p>
              </div>
            )}

            {product.sac_code && (
              <div>
                <p className="text-sm text-gray-500 mb-1">SAC Code</p>
                <p className="text-base font-semibold text-gray-900">{product.sac_code}</p>
                <p className="text-xs text-gray-400 mt-1">Service Accounting Code</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Description & Notes */}
      {(product.description || product.notes) && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-blue" />
            Additional Information
          </h2>

          <div className="space-y-4">
            {product.description && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {product.notes && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
