'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, User, Building2, DollarSign, Plus, Trash2, Package } from 'lucide-react';
import { createSalesOrder, type SalesOrderFormData } from '@/app/actions/sales/orders';

interface Partner {
  id: string;
  company_name: string | null;
  first_name: string;
  last_name: string;
  partner_type: string;
}

interface Warehouse {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  product_number: string;
  material: string | null;
  color: string | null;
  measuring_unit: string;
  selling_price_per_unit: number | null;
}

interface LineItem {
  product_id: string;
  required_quantity: number;
  unit_rate: number;
  notes: string;
}

interface SalesOrderFormProps {
  customers: Partner[];
  agents: Partner[];
  warehouses: Warehouse[];
  products: Product[];
  mode?: 'create' | 'edit';
  initialData?: any;
}

export default function SalesOrderForm({
  customers,
  agents,
  warehouses,
  products,
  mode = 'create',
  initialData,
}: SalesOrderFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    customer_id: initialData?.customer_id || '',
    agent_id: initialData?.agent_id || '',
    order_date: initialData?.order_date || new Date().toISOString().split('T')[0],
    expected_delivery_date: initialData?.expected_delivery_date || '',
    fulfillment_warehouse_id: initialData?.fulfillment_warehouse_id || '',
    advance_amount: initialData?.advance_amount?.toString() || '0',
    discount_amount: initialData?.discount_amount?.toString() || '0',
    notes: initialData?.notes || '',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialData?.items?.map((item: any) => ({
      product_id: item.product_id,
      required_quantity: item.required_quantity,
      unit_rate: item.unit_rate || 0,
      notes: item.notes || '',
    })) || [
      {
        product_id: '',
        required_quantity: 1,
        unit_rate: 0,
        notes: '',
      },
    ]
  );

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        product_id: '',
        required_quantity: 1,
        unit_rate: 0,
        notes: '',
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Auto-populate unit rate when product is selected
  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      handleLineItemChange(index, 'product_id', productId);
      handleLineItemChange(index, 'unit_rate', product.selling_price_per_unit || 0);
    }
  };

  // Calculate subtotal for all line items
  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => {
      return sum + item.required_quantity * item.unit_rate;
    }, 0);
  };

  // Calculate final total
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = parseFloat(formData.discount_amount) || 0;
    return subtotal - discount;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_id) {
      newErrors.customer_id = 'Customer is required';
    }
    if (!formData.order_date) {
      newErrors.order_date = 'Order date is required';
    }
    if (!formData.expected_delivery_date) {
      newErrors.expected_delivery_date = 'Expected delivery date is required';
    }

    // Validate line items
    const invalidItems = lineItems.filter((item) => !item.product_id || item.required_quantity <= 0);
    if (invalidItems.length > 0) {
      newErrors.line_items = 'All line items must have a product and quantity > 0';
    }
    if (lineItems.length === 0) {
      newErrors.line_items = 'At least one line item is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const orderData: SalesOrderFormData = {
      ...formData,
      line_items: lineItems.map((item) => ({
        product_id: item.product_id,
        required_quantity: item.required_quantity,
        unit_rate: item.unit_rate,
        notes: item.notes || undefined,
      })),
    };

    const result = await createSalesOrder(orderData);

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push('/dashboard/sales-orders');
      router.refresh();
    }
  };

  const subtotal = calculateSubtotal();
  const total = calculateTotal();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Information</h2>

        <div className="space-y-4">
          {/* Customer */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <User className="h-4 w-4 text-gray-400" />
              Customer <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.customer_id}
              onChange={(e) => handleChange('customer_id', e.target.value)}
              className={`w-full rounded-md border ${
                errors.customer_id ? 'border-red-500' : 'border-gray-300'
              } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
              required
            >
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.company_name || `${customer.first_name} ${customer.last_name}`} ({customer.partner_type})
                </option>
              ))}
            </select>
            {errors.customer_id && (
              <p className="mt-1 text-xs text-red-600">{errors.customer_id}</p>
            )}
          </div>

          {/* Agent (Optional) */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <User className="h-4 w-4 text-gray-400" />
              Agent
            </label>
            <select
              value={formData.agent_id}
              onChange={(e) => handleChange('agent_id', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select agent (optional)</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.company_name || `${agent.first_name} ${agent.last_name}`}
                </option>
              ))}
            </select>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Order Date */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4 text-gray-400" />
                Order date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.order_date}
                onChange={(e) => handleChange('order_date', e.target.value)}
                className={`w-full rounded-md border ${
                  errors.order_date ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                required
              />
              {errors.order_date && (
                <p className="mt-1 text-xs text-red-600">{errors.order_date}</p>
              )}
            </div>

            {/* Expected Delivery Date */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4 text-gray-400" />
                Expected delivery <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.expected_delivery_date}
                onChange={(e) => handleChange('expected_delivery_date', e.target.value)}
                className={`w-full rounded-md border ${
                  errors.expected_delivery_date ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                required
              />
              {errors.expected_delivery_date && (
                <p className="mt-1 text-xs text-red-600">{errors.expected_delivery_date}</p>
              )}
            </div>
          </div>

          {/* Fulfillment Warehouse */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Building2 className="h-4 w-4 text-gray-400" />
              Fulfillment warehouse
            </label>
            <select
              value={formData.fulfillment_warehouse_id}
              onChange={(e) => handleChange('fulfillment_warehouse_id', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select warehouse (optional)</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
          <button
            type="button"
            onClick={addLineItem}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>

        {errors.line_items && (
          <p className="mb-4 text-sm text-red-600">{errors.line_items}</p>
        )}

        <div className="space-y-4">
          {lineItems.map((item, index) => (
            <div key={index} className="rounded-md border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                {lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-12 gap-3">
                {/* Product Selection */}
                <div className="col-span-12 md:col-span-5">
                  <label className="mb-1 flex items-center gap-2 text-xs font-medium text-gray-700">
                    <Package className="h-3 w-3 text-gray-400" />
                    Product
                  </label>
                  <select
                    value={item.product_id}
                    onChange={(e) => handleProductSelect(index, e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {product.product_number}
                        {product.material && ` (${product.material})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div className="col-span-6 md:col-span-2">
                  <label className="mb-1 text-xs font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={item.required_quantity}
                    onChange={(e) =>
                      handleLineItemChange(index, 'required_quantity', parseFloat(e.target.value) || 1)
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Unit Rate */}
                <div className="col-span-6 md:col-span-2">
                  <label className="mb-1 text-xs font-medium text-gray-700">
                    Unit Rate
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_rate}
                    onChange={(e) =>
                      handleLineItemChange(index, 'unit_rate', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Line Total */}
                <div className="col-span-12 md:col-span-3">
                  <label className="mb-1 text-xs font-medium text-gray-700">
                    Line Total
                  </label>
                  <div className="flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-900">
                    ₹{(item.required_quantity * item.unit_rate).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Notes */}
                <div className="col-span-12">
                  <label className="mb-1 text-xs font-medium text-gray-700">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={item.notes}
                    onChange={(e) => handleLineItemChange(index, 'notes', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Optional notes for this item"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Amounts */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Payment Details</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Advance Amount */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <DollarSign className="h-4 w-4 text-gray-400" />
                Advance amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.advance_amount}
                onChange={(e) => handleChange('advance_amount', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            {/* Discount Amount */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <DollarSign className="h-4 w-4 text-gray-400" />
                Discount amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.discount_amount}
                onChange={(e) => handleChange('discount_amount', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Totals Summary */}
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">
                  ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-red-600">
                  - ₹{parseFloat(formData.discount_amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="border-t border-gray-300 pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total Amount:</span>
                  <span className="text-lg font-bold text-blue-600">
                    ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-2 text-sm font-medium text-gray-700">
              Order notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={3}
              placeholder="Any special instructions or notes..."
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSubmitting ? 'Creating Order...' : 'Create Sales Order'}
        </button>
      </div>
    </form>
  );
}
