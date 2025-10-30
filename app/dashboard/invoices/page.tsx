import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';

export default async function InvoicesPage() {
  const supabase = await createClient();

  // Get current user's company
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('auth_user_id', user.id)
    .single();

  if (!userData) {
    return <div>User data not found</div>;
  }

  // Fetch invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      id,
      invoice_number,
      invoice_date,
      total_amount,
      payment_status,
      status,
      is_credit_note,
      partners:customer_id (
        company_name,
        first_name,
        last_name
      )
    `)
    .eq('company_id', userData.company_id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage sales invoices and payments
            </p>
          </div>
        </div>

        {/* Invoices List */}
        {!invoices || invoices.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No invoices yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Create invoices from goods dispatch
            </p>
            <Link
              href="/dashboard/inventory/goods-dispatch"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Go to Goods Dispatch
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {invoices.map((invoice: any) => {
                  const customer = invoice.partners;
                  const customerName = customer?.company_name ||
                    `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim();

                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <Link
                          href={`/dashboard/invoices/${invoice.id}`}
                          className="font-medium text-blue-600 hover:text-blue-700"
                        >
                          {invoice.invoice_number}
                          {invoice.is_credit_note && (
                            <span className="ml-2 text-xs text-red-600">
                              (Credit Note)
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {new Date(invoice.invoice_date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {customerName}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                        ₹{parseFloat(invoice.total_amount).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                        {invoice.payment_status === 'paid' && (
                          <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                            Paid
                          </span>
                        )}
                        {invoice.payment_status === 'unpaid' && (
                          <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                            Unpaid
                          </span>
                        )}
                        {invoice.payment_status === 'partial' && (
                          <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                            Partial
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          invoice.status === 'finalized'
                            ? 'bg-blue-100 text-blue-800'
                            : invoice.status === 'credited'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
