import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Building2,
  User,
  FileText,
  Package,
  QrCode,
  MapPin,
  Award
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GoodsReceiptDetailPage({ params }: PageProps) {
  const { id } = await params;
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

  // Fetch goods receipt with related data
  const { data: receipt, error: receiptError } = await supabase
    .from('goods_receipts')
    .select(`
      id,
      receipt_number,
      receipt_date,
      link_type,
      invoice_number,
      invoice_amount,
      transport_details,
      notes,
      created_at,
      warehouses!warehouse_id (
        id,
        name,
        code
      ),
      partners:issued_by_partner_id (
        id,
        name,
        partner_code
      ),
      source_warehouses:issued_by_warehouse_id (
        id,
        name,
        code
      )
    `)
    .eq('id', id)
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .single();

  if (receiptError || !receipt) {
    notFound();
  }

  // Fetch goods receipt items with product details
  const { data: receiptItems } = await supabase
    .from('goods_receipt_items')
    .select(`
      id,
      quantity_received,
      notes,
      products (
        id,
        name,
        product_number,
        material,
        color,
        measuring_unit
      )
    `)
    .eq('receipt_id', id)
    .eq('company_id', userData.company_id);

  // First get all receipt item IDs for this receipt
  const receiptItemIds = receiptItems?.map((item: any) => item.id) || [];

  // Fetch all stock units created from this receipt's items
  const { data: stockUnits } = await supabase
    .from('stock_units')
    .select(`
      id,
      unit_number,
      qr_code,
      size_quantity,
      wastage,
      quality_grade,
      location_description,
      status,
      date_received,
      manufacturing_date,
      products (
        id,
        name,
        product_number,
        material,
        color
      )
    `)
    .in('receipt_item_id', receiptItemIds.length > 0 ? receiptItemIds : ['00000000-0000-0000-0000-000000000000'])
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .order('unit_number');

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

  const getSourceName = () => {
    if (receipt.partners) {
      return `${receipt.partners.company_name} (${receipt.partners.partner_code})`;
    }
    if (receipt.source_warehouses) {
      return `${receipt.source_warehouses.name} (${receipt.source_warehouses.code})`;
    }
    return '-';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      received: 'bg-blue-100 text-blue-800',
      available: 'bg-green-100 text-green-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      dispatched: 'bg-purple-100 text-purple-800',
      removed: 'bg-red-100 text-red-800',
    };

    const labels: Record<string, string> = {
      received: 'Received',
      available: 'Available',
      reserved: 'Reserved',
      dispatched: 'Dispatched',
      removed: 'Removed',
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/dashboard/inventory/goods-receipts"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Goods Receipts
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{receipt.receipt_number}</h1>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                  {formatLinkType(receipt.link_type)}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Created on {new Date(receipt.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Receipt Details Grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Warehouse */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-50 p-2">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Warehouse</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {receipt.warehouses?.name}
                </p>
                <p className="text-xs text-gray-500">{receipt.warehouses?.code}</p>
              </div>
            </div>

            {/* Source */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-purple-50 p-2">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">
                  {receipt.link_type === 'purchase' ? 'Partner' : 'Source Warehouse'}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900">{getSourceName()}</p>
              </div>
            </div>

            {/* Receipt Date */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-green-50 p-2">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Receipt Date</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {new Date(receipt.receipt_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Invoice */}
            {receipt.invoice_number && (
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-orange-50 p-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Invoice</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {receipt.invoice_number}
                  </p>
                  {receipt.invoice_amount && (
                    <p className="text-xs text-gray-500">
                      ₹{receipt.invoice_amount.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Additional Details */}
          {(receipt.transport_details || receipt.notes) && (
            <div className="mt-6 space-y-3 border-t border-gray-200 pt-6">
              {receipt.transport_details && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Transport Details</p>
                  <p className="mt-1 text-sm text-gray-700">{receipt.transport_details}</p>
                </div>
              )}
              {receipt.notes && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Notes</p>
                  <p className="mt-1 text-sm text-gray-700">{receipt.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Receipt Items Summary */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Receipt Items</h2>
          <div className="space-y-3">
            {receiptItems?.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <Package className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.products.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.products.material} • {item.products.color}
                    </p>
                    <p className="text-xs text-gray-500">{item.products.product_number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{item.quantity_received}</p>
                  <p className="text-xs text-gray-500">units received</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Units Table */}
        <div className="rounded-lg bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Stock Units ({stockUnits?.length || 0})
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Individual stock units created from this goods receipt
            </p>
          </div>

          {!stockUnits || stockUnits.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No stock units found for this receipt
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {stockUnits.map((unit: any) => (
                    <tr
                      key={unit.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4 text-gray-400" />
                          <Link
                            href={`/dashboard/inventory/stock-units/${unit.id}`}
                            className="font-mono text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            {unit.unit_number}
                          </Link>
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
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {unit.location_description}
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
