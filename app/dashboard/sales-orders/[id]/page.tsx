import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ArrowLeft, Calendar, User, Building2, DollarSign, Package, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getSalesOrder } from '@/app/actions/sales/orders';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default async function SalesOrderDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's company_id and check if demo
  const { data: userData } = await supabase
    .from('users')
    .select('company_id, is_demo')
    .eq('auth_user_id', user.id)
    .single();

  if (!userData?.company_id) {
    redirect('/error');
  }

  // Fetch order data
  const order = await getSalesOrder(id);

  if (!order) {
    redirect('/dashboard/sales-orders');
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCustomerName = () => {
    return order.customer.company_name || `${order.customer.first_name} ${order.customer.last_name}`;
  };

  const getAgentName = () => {
    if (!order.agent) return null;
    return order.agent.company_name || `${order.agent.first_name} ${order.agent.last_name}`;
  };

  const canEdit = !userData.is_demo;

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/sales-orders"
            className="rounded-md border border-gray-300 p-2 text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{order.order_number}</h1>
            <p className="mt-1 text-sm text-gray-500">Sales Order Details</p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]
          }`}
        >
          {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}
        </span>
      </div>

      {/* Demo Banner */}
      {userData.is_demo && (
        <div className="mb-6 rounded-lg border-2 border-yellow-400 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            Demo mode - Read only.{' '}
            <Link href="/dashboard/request-upgrade" className="font-medium underline">
              Request full access
            </Link>
          </p>
        </div>
      )}

      {/* Order Information */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Information</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Customer */}
          <div className="flex items-start gap-3">
            <User className="mt-1 h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Customer</p>
              <p className="font-medium text-gray-900">{getCustomerName()}</p>
              <p className="text-xs text-gray-500">{order.customer.partner_type}</p>
            </div>
          </div>

          {/* Agent */}
          {order.agent && (
            <div className="flex items-start gap-3">
              <User className="mt-1 h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Agent</p>
                <p className="font-medium text-gray-900">{getAgentName()}</p>
              </div>
            </div>
          )}

          {/* Order Date */}
          <div className="flex items-start gap-3">
            <Calendar className="mt-1 h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium text-gray-900">{formatDate(order.order_date)}</p>
            </div>
          </div>

          {/* Expected Delivery */}
          <div className="flex items-start gap-3">
            <Calendar className="mt-1 h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Expected Delivery</p>
              <p className="font-medium text-gray-900">{formatDate(order.expected_delivery_date)}</p>
            </div>
          </div>

          {/* Warehouse */}
          {order.fulfillment_warehouse && (
            <div className="flex items-start gap-3">
              <Building2 className="mt-1 h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Fulfillment Warehouse</p>
                <p className="font-medium text-gray-900">{order.fulfillment_warehouse.name}</p>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-500">Notes</p>
            <p className="mt-1 text-sm text-gray-900">{order.notes}</p>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Items</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Product
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Quantity
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Unit Rate
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Line Total
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Dispatched
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Pending
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.items.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{item.products.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.products.product_number}
                          {item.products.material && ` • ${item.products.material}`}
                          {item.products.color && ` • ${item.products.color}`}
                        </p>
                      </div>
                    </div>
                    {item.notes && (
                      <p className="mt-1 text-xs text-gray-500">{item.notes}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-gray-900">
                    {item.required_quantity} {item.products.measuring_unit}
                  </td>
                  <td className="px-4 py-4 text-right text-gray-900">
                    {formatCurrency(item.unit_rate || 0)}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-blue-600">
                    {formatCurrency(item.line_total || 0)}
                  </td>
                  <td className="px-4 py-4 text-right text-gray-900">
                    {item.dispatched_quantity || 0} {item.products.measuring_unit}
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-orange-600">
                    {item.pending_quantity || 0} {item.products.measuring_unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Payment Summary</h2>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(order.total_amount + (order.discount_amount || 0))}
            </span>
          </div>

          {order.discount_amount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Discount</span>
              <span className="font-medium text-red-600">
                - {formatCurrency(order.discount_amount)}
              </span>
            </div>
          )}

          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-gray-900">Total Amount</span>
              <span className="text-lg font-bold text-blue-600">
                {formatCurrency(order.total_amount)}
              </span>
            </div>
          </div>

          {order.advance_amount > 0 && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">Advance Paid</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(order.advance_amount)}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3">
                <span className="font-semibold text-gray-900">Balance Due</span>
                <span className="font-bold text-orange-600">
                  {formatCurrency(order.total_amount - order.advance_amount)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
