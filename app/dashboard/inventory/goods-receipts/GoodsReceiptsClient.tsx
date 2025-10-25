'use client';

import { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import Link from 'next/link';
import { Search, Plus, Package } from 'lucide-react';
import { PaginationClient } from '@/components/PaginationClient';
import {
  GoodsReceiptListItem,
  GoodsReceiptListHeader,
} from '@/components/inventory/GoodsReceiptListItem';
import { StandardGoodsReceiptListItem } from '@/lib/types/goods-receipt';

interface GoodsReceiptsClientProps {
  receipts: StandardGoodsReceiptListItem[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
}

export default function GoodsReceiptsClient({
  receipts: initialReceipts,
  currentPage,
  pageSize,
  totalCount,
}: GoodsReceiptsClientProps) {
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [linkTypeFilter, setLinkTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Debounce search term to reduce filtering operations
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  // Filter receipts client-side with useMemo for performance
  const filteredReceipts = useMemo(() => {
    return initialReceipts.filter((receipt) => {
      // Search filter
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        const matchesSearch =
          receipt.receipt_number?.toLowerCase().includes(searchLower) ||
          receipt.invoice_number?.toLowerCase().includes(searchLower) ||
          receipt.source_name?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Link type filter
      if (linkTypeFilter && receipt.link_type !== linkTypeFilter) {
        return false;
      }

      // Date filters
      if (dateFrom && receipt.receipt_date < dateFrom) {
        return false;
      }
      if (dateTo && receipt.receipt_date > dateTo) {
        return false;
      }

      return true;
    });
  }, [initialReceipts, debouncedSearchTerm, linkTypeFilter, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearchTerm('');
    setLinkTypeFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = debouncedSearchTerm || linkTypeFilter || dateFrom || dateTo;

  return (
    <>
      {/* Filters Card */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by receipt number, invoice number, or source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <select
            value={linkTypeFilter}
            onChange={(e) => setLinkTypeFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="purchase">Purchase</option>
            <option value="transfer">Transfer</option>
            <option value="job_work_return">Job Work Return</option>
            <option value="sales_return">Sales Return</option>
            <option value="production">Production</option>
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="From Date"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="To Date"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
            <p className="text-sm text-gray-600">
              {filteredReceipts.length} {filteredReceipts.length === 1 ? 'receipt' : 'receipts'}{' '}
              found
            </p>
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Receipts Table */}
      <div className="rounded-lg bg-white shadow-sm">
        {filteredReceipts.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No receipts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : 'Get started by creating a new goods receipt.'}
            </p>
            {!hasActiveFilters && (
              <div className="mt-6">
                <Link
                  href="/dashboard/inventory/goods-receipts/new"
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Goods Receipt
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <GoodsReceiptListHeader />
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredReceipts.map((receipt) => (
                  <GoodsReceiptListItem key={receipt.id} receipt={receipt} />
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filteredReceipts.length > 0 && (
          <PaginationClient
            currentPage={currentPage}
            totalPages={Math.ceil(totalCount / pageSize)}
            pageSize={pageSize}
            totalCount={totalCount}
          />
        )}
      </div>
    </>
  );
}
