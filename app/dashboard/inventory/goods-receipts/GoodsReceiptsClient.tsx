'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, Calendar, Package, Building2, User } from 'lucide-react';

interface GoodsReceipt {
  id: string;
  receipt_number: string;
  receipt_date: string;
  link_type: string;
  invoice_number?: string;
  invoice_amount?: number;
  created_at: string;
  warehouses?: { name: string };
  partners?: { company_name: string };
  source_warehouses?: { name: string };
  total_quantity?: number;
}

interface GoodsReceiptsClientProps {
  receipts: GoodsReceipt[];
  warehouses: { id: string; name: string }[];
}

export default function GoodsReceiptsClient({
  receipts: initialReceipts,
  warehouses,
}: GoodsReceiptsClientProps) {
  const router = useRouter();

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [linkTypeFilter, setLinkTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Filter receipts client-side
  const filteredReceipts = initialReceipts.filter((receipt) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        receipt.receipt_number?.toLowerCase().includes(searchLower) ||
        receipt.invoice_number?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Warehouse filter (check if receipt.warehouses exists and has id)
    if (warehouseFilter) {
      // Since we don't have warehouse_id in the receipt object directly,
      // we'll need to match by name
      if (!receipt.warehouses?.name.includes(warehouseFilter)) {
        return false;
      }
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

  const handleRowClick = (receiptId: string) => {
    router.push(`/dashboard/inventory/goods-receipts/${receiptId}`);
  };

  const formatLinkType = (linkType: string) => {
    const types: Record<string, string> = {
      purchase: 'Purchase',
      transfer: 'Transfer',
      job_work_return: 'Job Work Return',
      sales_return: 'Sales Return',
      production: 'Production',
    };
    return types[linkType] || linkType;
  };

  const getSourceName = (receipt: GoodsReceipt) => {
    if (receipt.partners) {
      return receipt.partners.company_name;
    }
    if (receipt.source_warehouses) {
      return receipt.source_warehouses.name;
    }
    return '-';
  };


  const clearFilters = () => {
    setSearchTerm('');
    setWarehouseFilter('');
    setLinkTypeFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = searchTerm || warehouseFilter || linkTypeFilter || dateFrom || dateTo;

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
              placeholder="Search by receipt number, invoice number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.name}>
                {warehouse.name}
              </option>
            ))}
          </select>

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
              {filteredReceipts.length} {filteredReceipts.length === 1 ? 'receipt' : 'receipts'} found
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
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredReceipts.map((receipt) => (
                  <tr
                    key={receipt.id}
                    onClick={() => handleRowClick(receipt.id)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {receipt.receipt_number}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        {formatLinkType(receipt.link_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <User className="h-4 w-4 text-gray-400" />
                        {getSourceName(receipt)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {receipt.warehouses?.name || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {receipt.total_quantity || 0} units
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {new Date(receipt.receipt_date).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {receipt.invoice_number || '-'}
                        {receipt.invoice_amount && (
                          <div className="text-xs text-gray-500">
                            ₹{receipt.invoice_amount.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
