import { Clock, Package, TrendingUp, TrendingDown } from 'lucide-react'

interface HistoryTabProps {
  productId: string
  productName: string
}

export function HistoryTab({ productId, productName }: HistoryTabProps) {
  // Placeholder for future implementation
  // This will show purchase history, sales history, stock adjustments, etc.

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12">
      <div className="text-center">
        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Transaction History</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          The transaction history feature will show all purchases, sales, stock movements, and
          adjustments for {productName}.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
          <div className="p-4 border border-gray-200 rounded-lg">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Purchases</p>
            <p className="text-xs text-gray-500 mt-1">Goods receipts and purchases</p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <TrendingDown className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Sales</p>
            <p className="text-xs text-gray-500 mt-1">Sales orders and dispatches</p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <Package className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Adjustments</p>
            <p className="text-xs text-gray-500 mt-1">Stock corrections and movements</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-8">Coming in the next update</p>
      </div>
    </div>
  )
}
