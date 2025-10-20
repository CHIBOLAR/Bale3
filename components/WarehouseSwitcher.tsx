'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Warehouse as WarehouseIcon } from 'lucide-react'
import { setActiveWarehouse } from '@/lib/warehouse-context'

interface Warehouse {
  id: string
  warehouse_name: string
}

interface WarehouseSwitcherProps {
  warehouses: Warehouse[]
  activeWarehouseId: string | null
  isAdmin: boolean
}

export default function WarehouseSwitcher({
  warehouses,
  activeWarehouseId,
  isAdmin,
}: WarehouseSwitcherProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Staff users don't see the switcher
  if (!isAdmin) {
    return null
  }

  const handleWarehouseChange = async (warehouseId: string) => {
    setError(null)

    // Convert "all" to null for the cookie
    const warehouseIdToSet = warehouseId === 'all' ? null : warehouseId

    const result = await setActiveWarehouse(warehouseIdToSet)

    if (result.error) {
      setError(result.error)
      return
    }

    // Refresh the current page to apply the warehouse filter
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <WarehouseIcon className="h-5 w-5 text-gray-400" />
        <select
          value={activeWarehouseId || 'all'}
          onChange={(e) => handleWarehouseChange(e.target.value)}
          disabled={isPending}
          className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="all">All Warehouses</option>
          {warehouses.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.warehouse_name}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
      {isPending && (
        <p className="mt-1 text-xs text-gray-500">Switching...</p>
      )}
    </div>
  )
}
