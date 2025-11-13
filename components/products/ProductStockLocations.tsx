import { Warehouse, Package, AlertCircle } from 'lucide-react'

interface WarehouseStock {
  warehouse_id: string
  warehouse_name: string
  total_units: number
  available_quantity: number
  reserved_quantity: number
  dispatched_quantity: number
}

interface ProductStockLocationsProps {
  warehouseBreakdown: WarehouseStock[]
  measuringUnit: string | null
}

export function ProductStockLocations({
  warehouseBreakdown,
  measuringUnit,
}: ProductStockLocationsProps) {
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
    }).format(value)
  }

  if (warehouseBreakdown.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Warehouse className="w-6 h-6 text-brand-blue" />
          Stock Locations
        </h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500">No stock available in any warehouse</p>
          <p className="text-sm text-gray-400 mt-1">
            Stock will appear here once you receive inventory
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Warehouse className="w-6 h-6 text-brand-blue" />
        Stock Locations
      </h2>

      <div className="space-y-4">
        {warehouseBreakdown.map((warehouse) => (
          <div
            key={warehouse.warehouse_id}
            className="border border-gray-200 rounded-lg p-4 hover:border-brand-blue transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-brand-blue" />
                <h3 className="font-semibold text-gray-900">{warehouse.warehouse_name}</h3>
              </div>
              <span className="text-sm text-gray-500">{warehouse.total_units} units</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Available</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-lg font-bold text-green-600">
                    {formatNumber(warehouse.available_quantity)}
                  </p>
                  <p className="text-xs text-gray-400">{measuringUnit}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Reserved</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-lg font-bold text-blue-600">
                    {formatNumber(warehouse.reserved_quantity)}
                  </p>
                  <p className="text-xs text-gray-400">{measuringUnit}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Dispatched</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-lg font-bold text-gray-600">
                    {formatNumber(warehouse.dispatched_quantity)}
                  </p>
                  <p className="text-xs text-gray-400">{measuringUnit}</p>
                </div>
              </div>
            </div>

            {/* Progress bar showing stock distribution */}
            <div className="mt-3">
              <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
                {warehouse.available_quantity > 0 && (
                  <div
                    className="bg-green-500"
                    style={{
                      width: `${
                        (warehouse.available_quantity /
                          (warehouse.available_quantity +
                            warehouse.reserved_quantity +
                            warehouse.dispatched_quantity)) *
                        100
                      }%`,
                    }}
                  />
                )}
                {warehouse.reserved_quantity > 0 && (
                  <div
                    className="bg-blue-500"
                    style={{
                      width: `${
                        (warehouse.reserved_quantity /
                          (warehouse.available_quantity +
                            warehouse.reserved_quantity +
                            warehouse.dispatched_quantity)) *
                        100
                      }%`,
                    }}
                  />
                )}
                {warehouse.dispatched_quantity > 0 && (
                  <div
                    className="bg-gray-400"
                    style={{
                      width: `${
                        (warehouse.dispatched_quantity /
                          (warehouse.available_quantity +
                            warehouse.reserved_quantity +
                            warehouse.dispatched_quantity)) *
                        100
                      }%`,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
