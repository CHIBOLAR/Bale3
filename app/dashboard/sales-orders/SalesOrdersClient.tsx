'use client'

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Plus, Calendar, DollarSign, Package, Eye } from 'lucide-react';

interface SalesOrder {
  id: string;
  order_number: string;
  order_date: string;
  expected_delivery_date: string;
  total_amount: number;
  advance_amount: number;
  status: string;
  customer: {
    id: string;
    company_name: string | null;
    first_name: string;
    last_name: string;
    partner_type: string;
  };
  fulfillment_warehouse: {
    id: string;
    name: string;
  } | null;
}

interface SalesOrdersClientProps {
  orders: SalesOrder[];
  canEdit: boolean;
}

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

export default function SalesOrdersClient({ orders, canEdit }: SalesOrdersClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        searchTerm === '' ||
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer.company_name &&
          order.customer.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        `${order.customer.first_name} ${order.customer.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === '' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const getCustomerName = (customer: SalesOrder['customer']) => {
    return customer.company_name || `${customer.first_name} ${customer.last_name}`;
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your sales orders and track fulfillment
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => router.push('/dashboard/sales-orders/new')}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Sales Order
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filters
            {statusFilter && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                1
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Status Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {statusFilter && (
              <div className="mt-4">
                <button
                  onClick={() => setStatusFilter('')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        Showing {filteredOrders.length} of {orders.length} orders
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-sm font-medium text-gray-900">No sales orders found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {searchTerm || statusFilter
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first sales order'}
          </p>
          {canEdit && !searchTerm && !statusFilter && (
            <button
              onClick={() => router.push('/dashboard/sales-orders/new')}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              New Sales Order
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/sales-orders/${order.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header Row */}
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {order.order_number}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]
                      }`}
                    >
                      {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}
                    </span>
                  </div>

                  {/* Customer */}
                  <p className="mt-2 text-sm text-gray-600">
                    Customer: <span className="font-medium text-gray-900">{getCustomerName(order.customer)}</span>
                  </p>

                  {/* Details Grid */}
                  <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {/* Order Date */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Order Date</p>
                        <p className="font-medium text-gray-900">{formatDate(order.order_date)}</p>
                      </div>
                    </div>

                    {/* Delivery Date */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Expected Delivery</p>
                        <p className="font-medium text-gray-900">{formatDate(order.expected_delivery_date)}</p>
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Total Amount</p>
                        <p className="font-semibold text-blue-600">{formatCurrency(order.total_amount)}</p>
                      </div>
                    </div>

                    {/* Advance */}
                    {order.advance_amount > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-500">Advance Paid</p>
                          <p className="font-medium text-green-600">{formatCurrency(order.advance_amount)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Warehouse */}
                  {order.fulfillment_warehouse && (
                    <p className="mt-3 text-sm text-gray-600">
                      Warehouse: <span className="font-medium text-gray-900">{order.fulfillment_warehouse.name}</span>
                    </p>
                  )}
                </div>

                {/* View Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/sales-orders/${order.id}`);
                  }}
                  className="ml-4 rounded-md border border-gray-300 p-2 text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
