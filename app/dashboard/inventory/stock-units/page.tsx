'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Filter, Package, MapPin, Calendar, Award, QrCode } from 'lucide-react';
import { StockUnitWithRelations, StockUnitStatus } from '@/lib/types/inventory';
import { getStockUnits, getWarehouses, getProducts } from '@/app/actions/inventory/data';

interface Warehouse {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  product_number: string;
}

export default function StockUnitsPage() {
  const router = useRouter();

  const [stockUnits, setStockUnits] = useState<StockUnitWithRelations[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchData();
  }, [searchTerm, warehouseFilter, statusFilter, productFilter, dateFrom, dateTo]);

  async function fetchData() {
    setLoading(true);
    try {
      const [unitsData, warehousesData, productsData] = await Promise.all([
        getStockUnits({
          search: searchTerm || undefined,
          warehouse_id: warehouseFilter || undefined,
          status: statusFilter || undefined,
          product_id: productFilter || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        }),
        getWarehouses(),
        getProducts(),
      ]);

      setStockUnits(unitsData);
      setWarehouses(warehousesData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching stock units:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleRowClick = (unitId: string) => {
    router.push(`/dashboard/inventory/stock-units/${unitId}`);
  };

  const getStatusBadge = (status: StockUnitStatus) => {
    const styles: Record<StockUnitStatus, string> = {
      received: 'bg-blue-100 text-blue-800',
      available: 'bg-green-100 text-green-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      dispatched: 'bg-purple-100 text-purple-800',
      removed: 'bg-red-100 text-red-800',
    };

    const labels: Record<StockUnitStatus, string> = {
      received: 'Received',
      available: 'Available',
      reserved: 'Reserved',
      dispatched: 'Dispatched',
      removed: 'Removed',
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setWarehouseFilter('');
    setStatusFilter('');
    setProductFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters =
    searchTerm || warehouseFilter || statusFilter || productFilter || dateFrom || dateTo;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Stock Units</h1>
              <p className="mt-1 text-sm text-gray-600">
                View and manage individual stock units with QR codes
              </p>
            </div>
            <Link
              href="/dashboard/inventory/goods-receipts/new"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              New Goods Receipt
            </Link>
          </div>
        </div>

        {/* Filters Card */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by QR code, unit number..."
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
              <option value="received">Received</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="dispatched">Dispatched</option>
              <option value="removed">Removed</option>
            </select>

            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                {stockUnits.length} {stockUnits.length === 1 ? 'unit' : 'units'} found
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

        {/* Stock Units Table */}
        <div className="rounded-lg bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading stock units...</div>
          ) : stockUnits.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No stock units found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new goods receipt.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/inventory/goods-receipts/new"
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  New Goods Receipt
                </Link>
              </div>
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
                      Warehouse
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
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Received
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {stockUnits.map((unit) => (
                    <tr
                      key={unit.id}
                      onClick={() => handleRowClick(unit.id)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4 text-gray-400" />
                          <span className="font-mono text-sm font-medium text-gray-900">
                            {unit.unit_number}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="font-mono text-xs text-gray-600">
                          {unit.qr_code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {unit.products.name}
                          </div>
                          <div className="text-gray-500">
                            {unit.products.material}, {unit.products.color}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {unit.warehouses.name}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {unit.size_quantity} mtr
                        </span>
                        {unit.wastage > 0 && (
                          <span className="ml-1 text-xs text-red-600">
                            (-{unit.wastage})
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {unit.quality_grade}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {getStatusBadge(unit.status)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {unit.location_description}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {new Date(unit.date_received).toLocaleDateString()}
                          </span>
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
