import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';
import { PaymentForm } from '@/components/accounting/PaymentForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RecordPaymentPage({ params }: PageProps) {
  const { id: invoiceId } = await params;

  const supabase = await createClient();

  // Get invoice with customer
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

  // Check if invoice can receive payments
  if (invoice.payment_status === 'paid') {
    redirect(`/dashboard/invoices/${invoiceId}`);
  }

  if (invoice.status !== 'finalized') {
    redirect(`/dashboard/invoices/${invoiceId}`);
  }

  const customer = invoice.partners;
  const customerName = customer?.company_name ||
    `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim();

  const balanceDue = parseFloat(invoice.balance_due) || parseFloat(invoice.total_amount);

  // Get bank accounts
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('auth_user_id', user.id)
    .single();

  if (!userData) {
    redirect('/auth/login');
  }

  const { data: bankAccounts } = await supabase
    .from('cash_bank_accounts')
    .select('id, account_name, account_number, bank_name')
    .eq('company_id', userData.company_id)
    .eq('account_type', 'bank')
    .eq('is_active', true)
    .order('account_name');

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
            <h1 className="text-2xl font-bold text-gray-900">Record Payment</h1>
            <p className="mt-1 text-sm text-gray-600">
              {invoice.invoice_number} • {customerName}
            </p>
          </div>
        </div>

        {/* Balance Due Card */}
        <div className="mb-6 rounded-lg bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Balance Due</p>
              <p className="mt-1 text-2xl font-bold text-blue-900">
                ₹{balanceDue.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
            </div>
            {invoice.total_paid > 0 && (
              <div className="text-right">
                <p className="text-sm text-blue-700">Already Paid</p>
                <p className="text-sm font-medium text-blue-700">
                  ₹{parseFloat(invoice.total_paid).toLocaleString('en-IN', {
                    minimumFractionDigits: 2
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Form */}
        <PaymentForm
          invoiceId={invoiceId}
          balanceDue={balanceDue}
          bankAccounts={bankAccounts || []}
        />
      </div>
    </div>
  );
}
