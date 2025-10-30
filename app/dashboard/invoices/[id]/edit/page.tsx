import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';
import { EditInvoiceForm } from '@/components/accounting/EditInvoiceForm';
import type { InvoiceItem } from '@/lib/accounting/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditInvoicePage({ params }: PageProps) {
  const { id: invoiceId } = await params;

  const supabase = await createClient();

  // Get invoice with items
  const { data: invoice } = await supabase
    .from('invoices')
    .select(`
      *,
      invoice_items (*,
        products (name, material, color)
      ),
      partners:customer_id (
        company_name,
        first_name,
        last_name,
        state
      )
    `)
    .eq('id', invoiceId)
    .single();

  if (!invoice) {
    redirect('/dashboard/invoices');
  }

  // Check if invoice can be edited
  const createdAt = new Date(invoice.created_at);
  const now = new Date();
  const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  if (hoursSinceCreation >= 24) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-2xl">
          <Link
            href={`/dashboard/invoices/${invoiceId}`}
            className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Invoice
          </Link>

          <div className="rounded-lg bg-red-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              Cannot Edit Invoice
            </h2>
            <p className="text-red-700 mb-4">
              This invoice was created more than 24 hours ago and can no longer be edited.
              Please create a credit note instead.
            </p>
            <Link
              href={`/dashboard/invoices/${invoiceId}/credit-note`}
              className="inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Create Credit Note
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (invoice.payment_status !== 'unpaid') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-2xl">
          <Link
            href={`/dashboard/invoices/${invoiceId}`}
            className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Invoice
          </Link>

          <div className="rounded-lg bg-red-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              Cannot Edit Invoice
            </h2>
            <p className="text-red-700">
              This invoice has payments recorded and cannot be edited.
              Please create a credit note instead.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (invoice.status !== 'finalized') {
    redirect(`/dashboard/invoices/${invoiceId}`);
  }

  const customer = invoice.partners;
  const customerName = customer?.company_name ||
    `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim();

  // Convert invoice items to InvoiceItem format
  const initialItems: InvoiceItem[] = invoice.invoice_items.map((item: any) => ({
    dispatch_item_id: item.dispatch_item_id,
    product_id: item.product_id,
    product_name: item.products?.name || '',
    description: item.description,
    quantity: parseFloat(item.quantity),
    unit_rate: parseFloat(item.unit_rate),
    discount_percent: parseFloat(item.discount_percent || 0),
    discount_amount: parseFloat(item.discount_amount || 0),
    taxable_amount: parseFloat(item.taxable_amount),
    cgst_rate: parseFloat(item.cgst_rate || 0),
    cgst_amount: parseFloat(item.cgst_amount || 0),
    sgst_rate: parseFloat(item.sgst_rate || 0),
    sgst_amount: parseFloat(item.sgst_amount || 0),
    igst_rate: parseFloat(item.igst_rate || 0),
    igst_amount: parseFloat(item.igst_amount || 0),
    line_total: parseFloat(item.line_total),
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/dashboard/invoices/${invoiceId}`}
            className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Invoice
          </Link>

          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Invoice {invoice.invoice_number}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Customer: {customerName}
            </p>
          </div>

          {/* 24h Warning */}
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-yellow-600 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  24-Hour Edit Window
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  You have {Math.floor(24 - hoursSinceCreation)} hours remaining to edit this invoice.
                  After that, you'll need to create a credit note.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <EditInvoiceForm
          invoiceId={invoiceId}
          customerId={invoice.customer_id}
          customerName={customerName}
          invoiceDate={invoice.invoice_date}
          dueDate={invoice.due_date}
          initialItems={initialItems}
          initialDiscountAmount={parseFloat(invoice.discount_amount || 0)}
          initialAdjustmentAmount={parseFloat(invoice.adjustment_amount || 0)}
          initialNotes={invoice.notes || ''}
        />
      </div>
    </div>
  );
}
