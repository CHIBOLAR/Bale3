import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft, FileText, Download } from 'lucide-react';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id: invoiceId } = await params;

  const supabase = await createClient();

  // Get invoice with items and customer
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
      ),
      goods_dispatches:dispatch_id (
        dispatch_number
      )
    `)
    .eq('id', invoiceId)
    .single();

  if (!invoice) {
    redirect('/dashboard/invoices');
  }

  // Get journal entries for this invoice
  const { data: journalEntries } = await supabase
    .from('journal_entries')
    .select(`
      *,
      journal_entry_lines (
        *,
        ledger_accounts (name, account_type)
      )
    `)
    .eq('transaction_id', invoiceId)
    .eq('transaction_type', 'invoice');

  const customer = invoice.partners;
  const customerName = customer?.company_name ||
    `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim();

  // Calculate if editable (within 24h and unpaid)
  const createdAt = new Date(invoice.created_at);
  const now = new Date();
  const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  const isEditable = hoursSinceCreation < 24 && invoice.payment_status === 'unpaid' && invoice.status === 'finalized';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/invoices"
            className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Invoices
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {invoice.invoice_number}
                {invoice.is_credit_note && (
                  <span className="ml-3 text-lg text-red-600">(Credit Note)</span>
                )}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {new Date(invoice.invoice_date).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="flex gap-2">
              <a
                href={`/api/invoices/${invoiceId}/pdf`}
                download
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </a>
              {isEditable && (
                <Link
                  href={`/dashboard/invoices/${invoiceId}/edit`}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Edit Invoice
                </Link>
              )}
              {invoice.payment_status !== 'paid' && !invoice.is_credit_note && (
                <Link
                  href={`/dashboard/invoices/${invoiceId}/record-payment`}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Record Payment
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer & Status */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Customer</p>
                  <p className="mt-1 text-base text-gray-900">{customerName}</p>
                  <p className="text-sm text-gray-600">{customer?.state}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Goods Dispatch</p>
                  <p className="mt-1">
                    {invoice.goods_dispatches ? (
                      <Link
                        href={`/dashboard/inventory/goods-dispatch/${invoice.dispatch_id}`}
                        className="text-base text-blue-600 hover:text-blue-700"
                      >
                        {invoice.goods_dispatches.dispatch_number}
                      </Link>
                    ) : (
                      <span className="text-base text-gray-400">—</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Status</p>
                  <p className="mt-1">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      invoice.payment_status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : invoice.payment_status === 'unpaid'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.payment_status?.toUpperCase()}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="mt-1">
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                      {invoice.status?.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Items</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      <th className="pb-3">Product</th>
                      <th className="pb-3 text-right">Qty</th>
                      <th className="pb-3 text-right">Rate</th>
                      <th className="pb-3 text-right">GST</th>
                      <th className="pb-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoice.invoice_items.map((item: any) => (
                      <tr key={item.id} className="text-sm">
                        <td className="py-3">
                          <div>
                            <p className="font-medium text-gray-900">{item.products?.name}</p>
                            {item.description && (
                              <p className="text-xs text-gray-500">{item.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-right text-gray-900">
                          {parseFloat(item.quantity).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 text-right text-gray-900">
                          ₹{parseFloat(item.unit_rate).toLocaleString('en-IN', {
                            minimumFractionDigits: 2
                          })}
                        </td>
                        <td className="py-3 text-right text-gray-600">
                          {item.cgst_amount > 0 && (
                            <div className="text-xs">
                              CGST: ₹{parseFloat(item.cgst_amount).toFixed(2)}<br/>
                              SGST: ₹{parseFloat(item.sgst_amount).toFixed(2)}
                            </div>
                          )}
                          {item.igst_amount > 0 && (
                            <div className="text-xs">
                              IGST: ₹{parseFloat(item.igst_amount).toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="py-3 text-right font-medium text-gray-900">
                          ₹{parseFloat(item.line_total).toLocaleString('en-IN', {
                            minimumFractionDigits: 2
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Journal Entries */}
            {journalEntries && journalEntries.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Journal Entries</h2>
                {journalEntries.map((je: any) => (
                  <div key={je.id} className="mb-4">
                    <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                      <span>{je.entry_number}</span>
                      <span>{je.narration}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="border-b border-gray-200">
                          <tr className="text-xs font-medium uppercase text-gray-500">
                            <th className="pb-2 text-left">Ledger</th>
                            <th className="pb-2 text-right">Debit</th>
                            <th className="pb-2 text-right">Credit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {je.journal_entry_lines.map((line: any) => (
                            <tr key={line.id}>
                              <td className="py-2 text-gray-900">
                                {line.ledger_accounts.name}
                              </td>
                              <td className="py-2 text-right text-gray-900">
                                {line.debit_amount > 0 ? `₹${parseFloat(line.debit_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                              </td>
                              <td className="py-2 text-right text-gray-900">
                                {line.credit_amount > 0 ? `₹${parseFloat(line.credit_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="border-t-2 border-gray-300">
                          <tr className="font-semibold">
                            <td className="py-2">Total</td>
                            <td className="py-2 text-right">
                              ₹{je.journal_entry_lines.reduce((sum: number, line: any) => sum + parseFloat(line.debit_amount), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-2 text-right">
                              ₹{je.journal_entry_lines.reduce((sum: number, line: any) => sum + parseFloat(line.credit_amount), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Totals */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    ₹{parseFloat(invoice.subtotal).toLocaleString('en-IN', {
                      minimumFractionDigits: 2
                    })}
                  </span>
                </div>

                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount</span>
                    <span>
                      -₹{parseFloat(invoice.discount_amount).toLocaleString('en-IN', {
                        minimumFractionDigits: 2
                      })}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">GST</span>
                  <span className="font-medium text-gray-900">
                    ₹{parseFloat(invoice.gst_amount).toLocaleString('en-IN', {
                      minimumFractionDigits: 2
                    })}
                  </span>
                </div>

                {invoice.adjustment_amount !== 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Adjustment</span>
                    <span className={invoice.adjustment_amount > 0 ? 'text-green-600' : 'text-red-600'}>
                      {invoice.adjustment_amount > 0 ? '+' : ''}₹{parseFloat(invoice.adjustment_amount).toLocaleString('en-IN', {
                        minimumFractionDigits: 2
                      })}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-gray-900">Total Amount</span>
                    <span className="text-gray-900">
                      ₹{parseFloat(invoice.total_amount).toLocaleString('en-IN', {
                        minimumFractionDigits: 2
                      })}
                    </span>
                  </div>
                </div>

                {invoice.total_paid > 0 && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Amount Paid</span>
                      <span>
                        ₹{parseFloat(invoice.total_paid).toLocaleString('en-IN', {
                          minimumFractionDigits: 2
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-semibold">
                      <span className="text-gray-900">Balance Due</span>
                      <span className="text-red-600">
                        ₹{parseFloat(invoice.balance_due).toLocaleString('en-IN', {
                          minimumFractionDigits: 2
                        })}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {invoice.notes && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <p className="text-xs font-medium text-gray-500">Notes</p>
                  <p className="mt-1 text-sm text-gray-700">{invoice.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
