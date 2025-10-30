import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getGoodsDispatch } from '@/app/actions/inventory/goods-dispatch';
import { InvoiceForm } from '@/components/accounting/InvoiceForm';
import { calculateItemGST } from '@/lib/accounting/invoice';
import { createClient } from '@/lib/supabase/server';
import type { InvoiceItem } from '@/lib/accounting/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CreateInvoicePage({ params }: PageProps) {
  const { id: dispatchId } = await params;

  // Fetch dispatch with full details
  const dispatch = await getGoodsDispatch(dispatchId);

  if (!dispatch) {
    redirect('/dashboard/inventory/goods-dispatch');
  }

  // Check if invoice already exists for this dispatch
  const supabase = await createClient();
  const { data: existingInvoice } = await supabase
    .from('invoices')
    .select('id, invoice_number')
    .eq('dispatch_id', dispatchId)
    .maybeSingle();

  if (existingInvoice) {
    redirect(`/dashboard/invoices/${existingInvoice.id}`);
  }

  // Ensure dispatch has a customer
  if (!dispatch.dispatch_to_partner_id) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <Link
            href={`/dashboard/inventory/goods-dispatch/${dispatchId}`}
            className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dispatch
          </Link>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Cannot Create Invoice</h2>
            <p className="text-gray-600">
              This dispatch does not have a customer assigned. Please edit the dispatch to add a customer before creating an invoice.
            </p>
            <div className="mt-4">
              <Link
                href={`/dashboard/inventory/goods-dispatch/${dispatchId}`}
                className="text-blue-600 hover:text-blue-700"
              >
                ← Back to Dispatch
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get customer details
  const customerId = dispatch.dispatch_to_partner_id;
  const { data: customer } = await supabase
    .from('partners')
    .select('id, first_name, last_name, company_name, state')
    .eq('id', customerId)
    .single();

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-red-600">Customer not found</p>
        </div>
      </div>
    );
  }

  const customerName = customer.company_name || `${customer.first_name} ${customer.last_name}`;
  const customerState = customer.state || '';

  // Get company state for GST calculation
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id, companies!inner(state)')
    .eq('auth_user_id', user.id)
    .single();

  if (!userData) {
    redirect('/auth/login');
  }

  const companyId = userData.company_id;
  const companyState = (userData?.companies as any)?.state || '';

  // Convert dispatch items to invoice items
  const invoiceItems: InvoiceItem[] = [];

  if (dispatch.items && dispatch.items.length > 0) {
    for (const dispatchItem of dispatch.items) {
      const quantity = dispatchItem.dispatched_quantity ||
        (dispatchItem.stock_units.size_quantity - dispatchItem.stock_units.wastage);

      const product = dispatchItem.stock_units.products;
      const unitRate = product.selling_price_per_unit || product.cost_price_per_unit || 0;

      // Calculate GST for this item
      const itemWithGST = await calculateItemGST(
        {
          dispatch_item_id: dispatchItem.id,
          product_id: product.id,
          product_name: product.name,
          description: `${product.name} - ${product.material || ''} ${product.color || ''}`.trim(),
          quantity,
          unit_rate: unitRate,
          discount_percent: 0,
          discount_amount: 0,
          taxable_amount: quantity * unitRate,
          line_total: quantity * unitRate,
        },
        customerState,
        companyState,
        companyId
      );

      invoiceItems.push(itemWithGST);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/dashboard/inventory/goods-dispatch/${dispatchId}`}
            className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dispatch
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
            <p className="mt-1 text-sm text-gray-600">
              Create invoice for dispatch {dispatch.dispatch_number}
            </p>
          </div>
        </div>

        {/* Invoice Form */}
        <InvoiceForm
          customerId={customerId}
          customerName={customerName}
          dispatchId={dispatchId}
          initialItems={invoiceItems}
        />
      </div>
    </div>
  );
}
