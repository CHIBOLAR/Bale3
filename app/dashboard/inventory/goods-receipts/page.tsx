import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getStandardGoodsReceiptsList } from '@/lib/queries/goods-receipts';
import GoodsReceiptsClient from './GoodsReceiptsClient';

// Enable dynamic rendering for fresh data
export const revalidate = 0;
export const dynamic = 'force-dynamic';

interface SearchParams {
  page?: string;
  pageSize?: string;
}

export default async function GoodsReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize) : 25;

  // Fetch goods receipts using standardized query
  const { receipts, totalCount } = await getStandardGoodsReceiptsList({
    page,
    pageSize,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Goods Receipts</h1>
              <p className="mt-1 text-sm text-gray-600">
                View and manage incoming inventory receipts
              </p>
            </div>
            <Link
              href="/dashboard/inventory/goods-receipts/new"
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              New Goods Receipt
            </Link>
          </div>
        </div>

        {/* Client Component with filters and table */}
        <GoodsReceiptsClient
          receipts={receipts}
          currentPage={page}
          pageSize={pageSize}
          totalCount={totalCount}
        />
      </div>
    </div>
  );
}
