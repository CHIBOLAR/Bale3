import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, PackageCheck, Calendar, Building2, User } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function GoodsReceiptPage() {
  const supabase = await createClient();

  // Get user data
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's company_id
  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('auth_user_id', user.id)
    .single();

  if (!userData?.company_id) {
    redirect('/dashboard');
  }

  // Fetch goods receipts with related data
  const { data: receipts } = await supabase
    .from('goods_receipts')
    .select(`
      id,
      receipt_number,
      receipt_date,
      link_type,
      invoice_number,
      invoice_amount,
      created_at,
      warehouses!warehouse_id (
        name,
        code
      ),
      partners:issued_by_partner_id (
        company_name,
        partner_code
      ),
      source_warehouses:issued_by_warehouse_id (
        name,
        code
      ),
      goods_receipt_items (
        quantity_received
      )
    `)
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const getTotalQuantity = (items: any[]) => {
    return items?.reduce((sum, item) => sum + (item.quantity_received || 0), 0) || 0;
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

  const getSourceName = (receipt: any) => {
    if (receipt.partners) {
      return `${receipt.partners.company_name} (${receipt.partners.partner_code})`;
    }
    if (receipt.source_warehouses) {
      return `${receipt.source_warehouses.name} (${receipt.source_warehouses.code})`;
    }
    return '-';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Goods Receipt</h1>
              <p className="mt-1 text-sm text-gray-600">
                Record incoming inventory and create stock units
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

        {/* Receipts List */}
        {!receipts || receipts.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <PackageCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No goods receipts yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first goods receipt
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/inventory/goods-receipts/new"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Goods Receipt
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {receipts.map((receipt) => (
              <div
                key={receipt.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-gray-900">
                        {receipt.receipt_number}
                      </h3>
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        {formatLinkType(receipt.link_type)}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                      {/* Warehouse */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building2 className="h-4 w-4" />
                        <span>
                          {receipt.warehouses?.name} ({receipt.warehouses?.code})
                        </span>
                      </div>

                      {/* Source */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{getSourceName(receipt)}</span>
                      </div>

                      {/* Receipt Date */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(receipt.receipt_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <PackageCheck className="h-4 w-4" />
                        <span>{getTotalQuantity(receipt.goods_receipt_items)} units</span>
                      </div>
                    </div>

                    {/* Invoice Info */}
                    {receipt.invoice_number && (
                      <div className="mt-2 text-sm text-gray-500">
                        Invoice: {receipt.invoice_number}
                        {receipt.invoice_amount && (
                          <span className="ml-2">
                            (₹{receipt.invoice_amount.toLocaleString()})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* View Details Link */}
                  <Link
                    href={`/dashboard/inventory/goods-receipts/${receipt.id}`}
                    className="rounded-md px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
