import Link from 'next/link';
import { Search, Package } from 'lucide-react';
import { getStockUnits, getWarehouses, getProducts } from '@/app/actions/inventory/data';
import StockUnitsTable from './StockUnitsTable';
import StockUnitsFilters from './StockUnitsFilters';
import { PaginationClient } from '@/components/PaginationClient';

interface SearchParams {
  search?: string;
  warehouse?: string;
  status?: string;
  product?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: string;
  pageSize?: string;
}

export default async function StockUnitsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Await searchParams as per Next.js 15 requirements
  const params = await searchParams;

  // Parse pagination params
  const page = params.page ? parseInt(params.page) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize) : 25;

  // Fetch all data in parallel on the server
  const [stockUnitsResult, warehouses, products] = await Promise.all([
    getStockUnits({
      search: params.search || undefined,
      warehouse_id: params.warehouse || undefined,
      status: params.status || undefined,
      product_id: params.product || undefined,
      date_from: params.dateFrom || undefined,
      date_to: params.dateTo || undefined,
      page,
      pageSize,
    }),
    getWarehouses(),
    getProducts(),
  ]);

  const stockUnits = stockUnitsResult.data;
  const totalCount = stockUnitsResult.count;
  const totalPages = Math.ceil(totalCount / pageSize);

  const hasActiveFilters = !!(
    params.search || params.warehouse || params.status || params.product || params.dateFrom || params.dateTo
  );

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

        {/* Filters Component */}
        <StockUnitsFilters
          warehouses={warehouses}
          products={products}
          initialFilters={{
            search: params.search || '',
            warehouse: params.warehouse || '',
            status: params.status || '',
            product: params.product || '',
            dateFrom: params.dateFrom || '',
            dateTo: params.dateTo || '',
          }}
          hasActiveFilters={hasActiveFilters}
          totalCount={totalCount}
        />

        {/* Stock Units Table */}
        <div className="rounded-lg bg-white shadow-sm">
          {stockUnits.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No stock units found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {hasActiveFilters
                  ? 'Try adjusting your filters to find what you\'re looking for.'
                  : 'Get started by creating a new goods receipt.'}
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
            <>
              <StockUnitsTable stockUnits={stockUnits} />
              <PaginationClient
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalCount={totalCount}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
