'use client'

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, Calendar, Package, TruckIcon } from 'lucide-react';
import { GoodsDispatchWithRelations, GoodsDispatchStatus } from '@/lib/types/inventory';

interface Warehouse {
  id: string;
  name: string;
}

interface Partner {
  id: string;
  name: string;
  partner_type: string;
}

interface GoodsDispatchClientProps {
  dispatches: GoodsDispatchWithRelations[];
  warehouses: Warehouse[];
  partners: Partner[];
}

export default function GoodsDispatchClient({
  dispatches: initialDispatches,
  warehouses,
  partners,
}: GoodsDispatchClientProps) {
  const router = useRouter();

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [linkTypeFilter, setLinkTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Filter dispatches client-side
  const filteredDispatches = initialDispatches.filter((dispatch) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        dispatch.dispatch_number?.toLowerCase().includes(searchLower) ||
        dispatch.invoice_number?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Warehouse filter
    if (warehouseFilter && dispatch.warehouse_id !== warehouseFilter) {
      return false;
    }

    // Status filter
    if (statusFilter && dispatch.status !== statusFilter) {
      return false;
    }

    // Link type filter
    if (linkTypeFilter && dispatch.link_type !== linkTypeFilter) {
      return false;
    }

    // Date filters
    if (dateFrom && dispatch.dispatch_date < dateFrom) {
      return false;
    }
    if (dateTo && dispatch.dispatch_date > dateTo) {
      return false;
    }

    return true;
  });

  const handleRowClick = (dispatchId: string) => {
    router.push(`/dashboard/inventory/goods-dispatch/${dispatchId}`);
  };

  const getStatusBadge = (status: GoodsDispatchStatus) => {
    const styles: Record<GoodsDispatchStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_transit: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
      >
        {status.replace('_', ' ')}
      </span>
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setWarehouseFilter('');
    setStatusFilter('');
    setLinkTypeFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters =
    searchTerm || warehouseFilter || statusFilter || linkTypeFilter || dateFrom || dateTo;

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
              placeholder="Search by dispatch number, invoice number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={linkTypeFilter}
            onChange={(e) => setLinkTypeFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="sales_order">Sales Order</option>
            <option value="job_work">Job Work</option>
            <option value="purchase_return">Purchase Return</option>
            <option value="other">Other</option>
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
              {filteredDispatches.length} {filteredDispatches.length === 1 ? 'dispatch' : 'dispatches'} found
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

      {/* Dispatches Table */}
      <div className="rounded-lg bg-white shadow-sm">
        {filteredDispatches.length === 0 ? (
          <div className="p-8 text-center">
            <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No dispatches found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : 'Get started by creating a new dispatch.'}
            </p>
            {!hasActiveFilters && (
              <div className="mt-6">
                <Link
                  href="/dashboard/inventory/goods-dispatch/new"
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Dispatch
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
                    Dispatch Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Dispatch To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Warehouse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Dispatch Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredDispatches.map((dispatch) => (
                  <tr
                    key={dispatch.id}
                    onClick={() => handleRowClick(dispatch.id)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {dispatch.dispatch_number}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {dispatch.link_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {dispatch.dispatch_to_partner?.company_name || dispatch.dispatch_to_warehouse?.name || '-'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {dispatch.warehouses.name}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {getStatusBadge(dispatch.status)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {new Date(dispatch.dispatch_date).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {dispatch.due_date
                          ? new Date(dispatch.due_date).toLocaleDateString()
                          : '-'}
                      </span>
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
