import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';
import { CreditNoteForm } from '@/components/accounting/CreditNoteForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CreateCreditNotePage({ params }: PageProps) {
  const { id: invoiceId } = await params;

  const supabase = await createClient();

  // Get invoice
  const { data: invoice } = await supabase
    .from('invoices')
    .select(`
      *,
      partners:customer_id (
        company_name,
        first_name,
        last_name
      )
    `)
    .eq('id', invoiceId)
    .single();

  if (!invoice) {
    redirect('/dashboard/invoices');
  }

  // Check if already has a credit note
  if (invoice.status === 'credited') {
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

          <div className="rounded-lg bg-yellow-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-yellow-900 mb-2">
              Credit Note Already Created
            </h2>
            <p className="text-yellow-700">
              A credit note has already been created for this invoice.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const customer = invoice.partners;
  const customerName = customer?.company_name ||
    `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/dashboard/invoices/${invoiceId}`}
            className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Invoice
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create Credit Note
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              For Invoice {invoice.invoice_number} • {customerName}
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Original Invoice Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Invoice Number</p>
              <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
            </div>
            <div>
              <p className="text-gray-500">Invoice Date</p>
              <p className="font-medium text-gray-900">
                {new Date(invoice.invoice_date).toLocaleDateString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Customer</p>
              <p className="font-medium text-gray-900">{customerName}</p>
            </div>
            <div>
              <p className="text-gray-500">Amount</p>
              <p className="font-medium text-gray-900">
                ₹{parseFloat(invoice.total_amount).toLocaleString('en-IN', {
                  minimumFractionDigits: 2
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-red-600 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Permanent Action
              </h3>
              <p className="mt-1 text-sm text-red-700">
                Creating a credit note will reverse all journal entries for this invoice.
                This action cannot be undone. The original invoice will be marked as "Credited".
              </p>
            </div>
          </div>
        </div>

        {/* Credit Note Form */}
        <CreditNoteForm
          invoiceId={invoiceId}
          invoiceNumber={invoice.invoice_number}
          totalAmount={parseFloat(invoice.total_amount)}
        />
      </div>
    </div>
  );
}
