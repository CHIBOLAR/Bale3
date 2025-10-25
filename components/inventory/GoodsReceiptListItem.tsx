/**
 * Standard Goods Receipt List Item (Table Row) Component
 * Displays a goods receipt as a table row - for list/table views
 */

'use client';

import { useRouter } from 'next/navigation';
import { Calendar, Building2, User, Package } from 'lucide-react';
import {
  StandardGoodsReceiptListItem,
  formatReceiptDate,
  formatCurrency,
} from '@/lib/types/goods-receipt';

interface GoodsReceiptListItemProps {
  receipt: StandardGoodsReceiptListItem;
  onClick?: (receiptId: string) => void;
}

export function GoodsReceiptListItem({ receipt, onClick }: GoodsReceiptListItemProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick(receipt.id);
    } else {
      router.push(`/dashboard/inventory/goods-receipts/${receipt.id}`);
    }
  };

  return (
    <tr
      onClick={handleClick}
      className="cursor-pointer transition-colors hover:bg-gray-50"
    >
      {/* Receipt Number */}
      <td className="whitespace-nowrap px-6 py-4">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-400" />
          <span className="font-mono text-sm font-medium text-gray-900">
            {receipt.receipt_number}
          </span>
        </div>
      </td>

      {/* Type */}
      <td className="whitespace-nowrap px-6 py-4">
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          {receipt.link_type_display}
        </span>
      </td>

      {/* Source */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <span className="text-sm text-gray-900">
            {receipt.source_name || '-'}
          </span>
        </div>
      </td>

      {/* Warehouse */}
      <td className="whitespace-nowrap px-6 py-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">{receipt.warehouse_name}</span>
        </div>
      </td>

      {/* Quantity */}
      <td className="whitespace-nowrap px-6 py-4">
        <div className="text-sm">
          <div className="font-medium text-gray-900">{receipt.total_quantity} units</div>
          <div className="text-xs text-gray-500">
            {receipt.total_items} {receipt.total_items === 1 ? 'item' : 'items'}
          </div>
        </div>
      </td>

      {/* Receipt Date */}
      <td className="whitespace-nowrap px-6 py-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            {formatReceiptDate(receipt.receipt_date, 'short')}
          </span>
        </div>
      </td>

      {/* Invoice */}
      <td className="whitespace-nowrap px-6 py-4">
        {receipt.invoice_number ? (
          <div className="text-sm">
            <div className="font-medium text-gray-900">{receipt.invoice_number}</div>
            {receipt.invoice_amount && (
              <div className="text-xs text-gray-500">
                {formatCurrency(receipt.invoice_amount)}
              </div>
            )}
          </div>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </td>
    </tr>
  );
}

/**
 * Table Header for Goods Receipt List
 */
export function GoodsReceiptListHeader() {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
          Receipt Number
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
          Type
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
          Source
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
          Warehouse
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
          Quantity
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
          Receipt Date
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
          Invoice
        </th>
      </tr>
    </thead>
  );
}
