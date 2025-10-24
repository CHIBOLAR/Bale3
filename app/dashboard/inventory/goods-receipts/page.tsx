import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import GoodsReceiptsClient from './GoodsReceiptsClient';

// Enable aggressive caching for fast page loads
export const revalidate = 0; // Revalidate on every request for now
export const dynamic = 'force-dynamic'; // Ensure we get fresh data

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

  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Get user details including role and warehouse
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('company_id, role, warehouse_id')
    .eq('auth_user_id', user.id)
    .single();

  if (userError || !userData?.company_id) {
    redirect('/dashboard');
  }

  // Fetch receipts with aggregated quantity using RPC or a more efficient query
  // Instead of fetching all items, we'll calculate totals in a separate efficient query
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data: receipts, error: receiptsError, count } = await supabase
    .from('goods_receipts')
    .select(`
      id,
      receipt_number,
      receipt_date,
      link_type,
      invoice_number,
      invoice_amount,
      warehouse_id,
      issued_by_partner_id,
      issued_by_warehouse_id,
      created_at,
      warehouses!warehouse_id (name),
      partners:issued_by_partner_id (company_name),
      source_warehouses:issued_by_warehouse_id (name)
    `, { count: 'exact' })
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .order('receipt_date', { ascending: false })
    .range(start, end);

  if (receiptsError) {
    console.error('Goods receipts error:', receiptsError);
  }

  // Fetch item counts separately - only receipt_id and quantity
  const receiptIds = receipts?.map(r => r.id) || [];
  let quantityMap = new Map<string, number>();

  if (receiptIds.length > 0) {
    const { data: itemCounts } = await supabase
      .from('goods_receipt_items')
      .select('receipt_id, quantity_received')
      .in('receipt_id', receiptIds);

    // Aggregate counts locally
    if (itemCounts) {
      itemCounts.forEach((item) => {
        const current = quantityMap.get(item.receipt_id) || 0;
        quantityMap.set(item.receipt_id, current + (item.quantity_received || 0));
      });
    }
  }

  // Attach quantities to receipts and fix type
  const receiptsWithQuantities = receipts?.map(receipt => ({
    id: receipt.id,
    receipt_number: receipt.receipt_number,
    receipt_date: receipt.receipt_date,
    link_type: receipt.link_type,
    invoice_number: receipt.invoice_number,
    invoice_amount: receipt.invoice_amount,
    created_at: receipt.created_at,
    warehouses: receipt.warehouses?.[0],
    partners: receipt.partners?.[0],
    source_warehouses: receipt.source_warehouses?.[0],
    total_quantity: quantityMap.get(receipt.id) || 0,
  }));

  // Fetch warehouses
  const { data: warehouses, error: warehousesError } = await supabase
    .from('warehouses')
    .select('id, name')
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .order('name');

  if (warehousesError) {
    console.error('Warehouses error:', warehousesError);
  }

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
          receipts={receiptsWithQuantities || []}
          warehouses={warehouses || []}
          currentPage={page}
          pageSize={pageSize}
          totalCount={count || 0}
        />
      </div>
    </div>
  );
}
