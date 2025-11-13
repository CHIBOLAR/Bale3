'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Package, QrCode, Calendar, MapPin } from 'lucide-react'

interface StockUnit {
  id: string
  unit_number: string
  qr_code: string | null
  size_quantity: number
  wastage: number
  quality_grade: string
  location_description: string
  status: string
  date_received: string
  created_at: string
  warehouses: {
    id: string
    name: string
  } | null
}

interface StockUnitsTabProps {
  stockUnits: StockUnit[]
  productId: string
  measuringUnit: string | null
}

export function StockUnitsTab({ stockUnits, productId, measuringUnit }: StockUnitsTabProps) {
  const [sortBy, setSortBy] = useState('date-desc')
  const [filterStatus, setFilterStatus] = useState('all')

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      available: 'bg-green-100 text-green-800',
      reserved: 'bg-blue-100 text-blue-800',
      dispatched: 'bg-gray-100 text-gray-800',
      removed: 'bg-red-100 text-red-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getQualityBadge = (grade: string) => {
    const styles: Record<string, string> = {
      'A+': 'bg-green-100 text-green-800',
      A: 'bg-blue-100 text-blue-800',
      B: 'bg-yellow-100 text-yellow-800',
      C: 'bg-orange-100 text-orange-800',
    }
    return styles[grade] || 'bg-gray-100 text-gray-800'
  }

  const filteredUnits = stockUnits.filter((unit) => {
    if (filterStatus === 'all') return true
    if (filterStatus === 'qr-pending') return !unit.qr_code
    if (filterStatus === 'qr-generated') return !!unit.qr_code
    return unit.status === filterStatus
  })

  const sortedUnits = [...filteredUnits].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'date-asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'quantity-desc':
        return b.size_quantity - a.size_quantity
      case 'quantity-asc':
        return a.size_quantity - b.size_quantity
      default:
        return 0
    }
  })

  if (stockUnits.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Stock Units</h3>
        <p className="text-gray-500 mb-6">
          This product doesn't have any stock units yet. Stock units will appear here once you
          receive inventory.
        </p>
        <Link
          href="/dashboard/inventory/goods-receipt/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange/90 transition-all"
        >
          <Package className="w-5 h-5" />
          Receive Goods
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm text-gray-600 mb-1 block">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            >
              <option value="date-desc">Date added - newest first</option>
              <option value="date-asc">Date added - oldest first</option>
              <option value="quantity-desc">Quantity - high to low</option>
              <option value="quantity-asc">Quantity - low to high</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="text-sm text-gray-600 mb-1 block">Filter by status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            >
              <option value="all">All status</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="dispatched">Dispatched</option>
              <option value="qr-pending">QR code pending</option>
              <option value="qr-generated">QR code generated</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <span>Showing {sortedUnits.length} of {stockUnits.length} stock units</span>
        </div>
      </div>

      {/* Stock Units List */}
      <div className="space-y-3">
        {sortedUnits.map((unit) => (
          <Link
            key={unit.id}
            href={`/dashboard/inventory/stock-units/${unit.id}`}
            className="block bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:border-brand-blue transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-bold text-gray-900">{unit.unit_number}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(unit.status)}`}>
                    {unit.status}
                  </span>
                  {unit.quality_grade && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getQualityBadge(unit.quality_grade)}`}>
                      Grade {unit.quality_grade}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-sm mb-1">
                  {unit.qr_code ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <QrCode className="w-4 h-4" />
                      QR code generated
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-600">
                      <QrCode className="w-4 h-4" />
                      QR code pending
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-gray-500">Quantity</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {unit.size_quantity} {measuringUnit}
                    </p>
                  </div>
                  {unit.wastage > 0 && (
                    <div>
                      <p className="text-xs text-gray-500">Wastage</p>
                      <p className="text-sm font-semibold text-red-600">
                        {unit.wastage} {measuringUnit}
                      </p>
                    </div>
                  )}
                  {unit.warehouses && (
                    <div>
                      <p className="text-xs text-gray-500">Warehouse</p>
                      <p className="text-sm font-semibold text-gray-900">{unit.warehouses.name}</p>
                    </div>
                  )}
                  {unit.date_received && (
                    <div>
                      <p className="text-xs text-gray-500">Received</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(unit.date_received).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {unit.location_description && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    {unit.location_description}
                  </div>
                )}
              </div>

              <svg
                className="w-5 h-5 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
