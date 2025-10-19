'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState, useTransition } from 'react';

interface Warehouse {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  product_number: string;
}

interface StockUnitsFiltersProps {
  warehouses: Warehouse[];
  products: Product[];
  initialFilters: {
    search: string;
    warehouse: string;
    status: string;
    product: string;
    dateFrom: string;
    dateTo: string;
  };
  hasActiveFilters: boolean;
  totalCount: number;
}

export default function StockUnitsFilters({
  warehouses,
  products,
  initialFilters,
  hasActiveFilters,
  totalCount,
}: StockUnitsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(initialFilters.search);
  const [warehouseFilter, setWarehouseFilter] = useState(initialFilters.warehouse);
  const [statusFilter, setStatusFilter] = useState(initialFilters.status);
  const [productFilter, setProductFilter] = useState(initialFilters.product);
  const [dateFrom, setDateFrom] = useState(initialFilters.dateFrom);
  const [dateTo, setDateTo] = useState(initialFilters.dateTo);

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      router.push(`/dashboard/inventory/stock-units?${params.toString()}`);
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    updateFilters({ search: value });
  };

  const handleWarehouseChange = (value: string) => {
    setWarehouseFilter(value);
    updateFilters({ warehouse: value });
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    updateFilters({ status: value });
  };

  const handleProductChange = (value: string) => {
    setProductFilter(value);
    updateFilters({ product: value });
  };

  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    updateFilters({ dateFrom: value });
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    updateFilters({ dateTo: value });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setWarehouseFilter('');
    setStatusFilter('');
    setProductFilter('');
    setDateFrom('');
    setDateTo('');

    startTransition(() => {
      router.push('/dashboard/inventory/stock-units');
    });
  };

  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by QR code, unit number..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isPending}
          />
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
        <select
          value={warehouseFilter}
          onChange={(e) => handleWarehouseChange(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isPending}
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
          onChange={(e) => handleStatusChange(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isPending}
        >
          <option value="">All Status</option>
          <option value="received">Received</option>
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="dispatched">Dispatched</option>
          <option value="removed">Removed</option>
        </select>

        <select
          value={productFilter}
          onChange={(e) => handleProductChange(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isPending}
        >
          <option value="">All Products</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} ({product.product_number})
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => handleDateFromChange(e.target.value)}
          placeholder="From Date"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isPending}
        />

        <input
          type="date"
          value={dateTo}
          onChange={(e) => handleDateToChange(e.target.value)}
          placeholder="To Date"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isPending}
        />
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
          <p className="text-sm text-gray-600">
            {totalCount} {totalCount === 1 ? 'unit' : 'units'} found
            {isPending && <span className="ml-2 text-gray-400">(updating...)</span>}
          </p>
          <button
            onClick={clearFilters}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
            disabled={isPending}
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
