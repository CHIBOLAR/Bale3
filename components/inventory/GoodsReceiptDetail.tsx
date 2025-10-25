/**
 * Standard Goods Receipt Detail Component
 * Displays complete goods receipt information in a standardized format
 */

'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Building2,
  User,
  FileText,
  Package,
  QrCode,
  MapPin,
  Award,
} from 'lucide-react';
import {
  StandardGoodsReceiptDetail,
  formatReceiptDate,
  formatCurrency,
  getStatusBadgeClass,
} from '@/lib/types/goods-receipt';

interface GoodsReceiptDetailProps {
  receipt: StandardGoodsReceiptDetail;
  showBackButton?: boolean;
}

export function GoodsReceiptDetail({ receipt, showBackButton = true }: GoodsReceiptDetailProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Back Button */}
        {showBackButton && (
          <div className="mb-6">
            <Link
              href="/dashboard/inventory/goods-receipts"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Goods Receipts
            </Link>
          </div>
        )}

        {/* Header Card */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{receipt.receipt_number}</h1>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                  {receipt.link_type_display}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Created on {formatReceiptDate(receipt.created_at, 'full')}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Warehouse */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-50 p-2">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Warehouse</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{receipt.warehouse.name}</p>
              </div>
            </div>

            {/* Source */}
            {receipt.source && (
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-purple-50 p-2">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    {receipt.source_type === 'partner' ? 'Partner' : 'Source Warehouse'}
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{receipt.source.name}</p>
                  {receipt.source.type && (
                    <p className="text-xs text-gray-500 capitalize">{receipt.source.type}</p>
                  )}
                </div>
              </div>
            )}

            {/* Receipt Date */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-green-50 p-2">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Receipt Date</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {formatReceiptDate(receipt.receipt_date, 'long')}
                </p>
              </div>
            </div>

            {/* Invoice */}
            {receipt.invoice_number && (
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-orange-50 p-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Invoice</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{receipt.invoice_number}</p>
                  {receipt.invoice_amount && (
                    <p className="text-xs text-gray-500">{formatCurrency(receipt.invoice_amount)}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Additional Details */}
          {(receipt.transport_details || receipt.notes) && (
            <div className="mt-6 space-y-3 border-t border-gray-200 pt-6">
              {receipt.transport_details && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Transport Details</p>
                  <p className="mt-1 text-sm text-gray-700">{receipt.transport_details}</p>
                </div>
              )}
              {receipt.notes && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Notes</p>
                  <p className="mt-1 text-sm text-gray-700">{receipt.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 pt-6 sm:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-gray-500">Total Quantity</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{receipt.totals.total_quantity}</p>
              <p className="text-xs text-gray-500">units</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Total Items</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{receipt.totals.total_items}</p>
              <p className="text-xs text-gray-500">products</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Stock Units</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{receipt.totals.total_stock_units}</p>
              <p className="text-xs text-gray-500">created</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Total Size</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{receipt.totals.total_size}</p>
              <p className="text-xs text-gray-500">mtr</p>
            </div>
          </div>
        </div>

        {/* Receipt Items */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Receipt Items</h2>
          <div className="space-y-3">
            {receipt.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <Package className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.product.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.product.material} • {item.product.color}
                    </p>
                    <p className="text-xs text-gray-500">{item.product.product_number}</p>
                    {item.notes && (
                      <p className="mt-1 text-xs italic text-gray-600">{item.notes}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{item.quantity_received}</p>
                  <p className="text-xs text-gray-500">units received</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Units Table */}
        <div className="rounded-lg bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Stock Units ({receipt.totals.total_stock_units})
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Individual stock units created from this goods receipt
            </p>
          </div>

          {receipt.stock_units.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No stock units found for this receipt
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Unit Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      QR Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Quality
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {receipt.stock_units.map((unit) => (
                    <tr key={unit.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4 text-gray-400" />
                          <Link
                            href={`/dashboard/inventory/stock-units/${unit.id}`}
                            className="font-mono text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            {unit.unit_number}
                          </Link>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="font-mono text-xs text-gray-600">{unit.qr_code}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{unit.product.name}</div>
                          <div className="text-gray-500">
                            {unit.product.material}, {unit.product.color}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-sm text-gray-900">{unit.size_quantity} mtr</span>
                        {unit.wastage > 0 && (
                          <span className="ml-1 text-xs text-red-600">(-{unit.wastage})</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{unit.quality_grade}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(unit.status)}`}
                        >
                          {unit.status_display}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{unit.location_description}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
