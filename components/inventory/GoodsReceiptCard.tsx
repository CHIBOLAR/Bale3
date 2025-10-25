/**
 * Standard Goods Receipt Card Component
 * Displays a goods receipt in card format - useful for dashboards or grid layouts
 */

'use client';

import Link from 'next/link';
import { Calendar, Building2, User, FileText, Package } from 'lucide-react';
import {
  StandardGoodsReceiptListItem,
  formatReceiptDate,
  formatCurrency,
} from '@/lib/types/goods-receipt';

interface GoodsReceiptCardProps {
  receipt: StandardGoodsReceiptListItem;
  showActions?: boolean;
}

export function GoodsReceiptCard({ receipt, showActions = true }: GoodsReceiptCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <Link
            href={`/dashboard/inventory/goods-receipts/${receipt.id}`}
            className="font-mono text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            {receipt.receipt_number}
          </Link>
          <p className="mt-1 text-xs text-gray-500">
            {formatReceiptDate(receipt.created_at, 'long')}
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          {receipt.link_type_display}
        </span>
      </div>

      {/* Details Grid */}
      <div className="space-y-2">
        {/* Warehouse */}
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">To:</span>
          <span className="font-medium text-gray-900">{receipt.warehouse_name}</span>
        </div>

        {/* Source */}
        {receipt.source_name && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">From:</span>
            <span className="font-medium text-gray-900">{receipt.source_name}</span>
          </div>
        )}

        {/* Receipt Date */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">Received:</span>
          <span className="font-medium text-gray-900">
            {formatReceiptDate(receipt.receipt_date, 'short')}
          </span>
        </div>

        {/* Invoice */}
        {receipt.invoice_number && (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Invoice:</span>
            <span className="font-medium text-gray-900">{receipt.invoice_number}</span>
            {receipt.invoice_amount && (
              <span className="text-xs text-gray-500">
                ({formatCurrency(receipt.invoice_amount)})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">
            {receipt.total_quantity} units
          </span>
          <span className="text-xs text-gray-500">
            ({receipt.total_items} {receipt.total_items === 1 ? 'item' : 'items'})
          </span>
        </div>

        {showActions && (
          <Link
            href={`/dashboard/inventory/goods-receipts/${receipt.id}`}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            View Details →
          </Link>
        )}
      </div>

      {/* Optional Notes Preview */}
      {receipt.notes && (
        <div className="mt-2 border-t border-gray-100 pt-2">
          <p className="line-clamp-2 text-xs text-gray-600">{receipt.notes}</p>
        </div>
      )}
    </div>
  );
}
