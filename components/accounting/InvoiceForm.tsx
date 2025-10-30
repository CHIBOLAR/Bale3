'use client';

/**
 * Invoice Form Component
 * Form for creating invoices with instant finalization
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InvoiceItemsTable } from './InvoiceItemsTable';
import { createInvoice } from '@/app/actions/accounting/invoices';
import type { InvoiceFormData, InvoiceItem } from '@/lib/accounting/types';

interface InvoiceFormProps {
  customerId: string;
  customerName: string;
  dispatchId?: string;
  initialItems: InvoiceItem[];
  onSuccess?: (invoiceId: string) => void;
}

export function InvoiceForm({
  customerId,
  customerName,
  dispatchId,
  initialItems,
  onSuccess,
}: InvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>(initialItems);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [adjustmentAmount, setAdjustmentAmount] = useState(0);
  const [notes, setNotes] = useState('');

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_rate), 0);
  const totalItemDiscounts = items.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
  const totalDiscounts = totalItemDiscounts + discountAmount;
  const taxableAmount = subtotal - totalDiscounts;
  const gstAmount = items.reduce(
    (sum, item) => sum + (item.cgst_amount || 0) + (item.sgst_amount || 0) + (item.igst_amount || 0),
    0
  );
  const totalAmount = taxableAmount + gstAmount + adjustmentAmount;

  const handleCreateInvoice = async () => {
    setLoading(true);
    setError(null);

    const formData: InvoiceFormData = {
      customer_id: customerId,
      dispatch_id: dispatchId,
      invoice_date: invoiceDate,
      due_date: dueDate || null,
      items,
      discount_amount: discountAmount,
      adjustment_amount: adjustmentAmount,
      notes,
    };

    const result = await createInvoice(formData, dispatchId);

    setLoading(false);

    if (result.success && result.invoice_id) {
      if (onSuccess) {
        onSuccess(result.invoice_id);
      } else {
        router.push(`/dashboard/invoices/${result.invoice_id}`);
      }
    } else {
      setError(result.error || 'Failed to create invoice');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Customer Info */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer</label>
            <input
              type="text"
              value={customerName}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Invoice Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Items</h3>
        <InvoiceItemsTable items={items} onChange={setItems} editable={true} />
      </div>

      {/* Additional Charges */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Charges & Discounts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Invoice Discount (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Adjustment Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={adjustmentAmount}
              onChange={(e) => setAdjustmentAmount(parseFloat(e.target.value) || 0)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="mt-1 text-xs text-gray-500">
              Can be positive (additional charge) or negative (adjustment)
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Additional notes for this invoice..."
          />
        </div>
      </div>

      {/* Totals Summary */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Discounts:</span>
            <span className="font-medium text-red-600">- ₹{totalDiscounts.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Taxable Amount:</span>
            <span className="font-medium">₹{taxableAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">GST:</span>
            <span className="font-medium">₹{gstAmount.toFixed(2)}</span>
          </div>
          {adjustmentAmount !== 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Adjustment:</span>
              <span className={`font-medium ${adjustmentAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {adjustmentAmount > 0 ? '+' : ''}₹{adjustmentAmount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between text-lg font-bold">
            <span>Total Amount:</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Instant Finalization</h3>
            <p className="mt-1 text-sm text-blue-700">
              Invoice will be created in finalized status and journal entries will be created immediately.
              You can edit within 24 hours if unpaid.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleCreateInvoice}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={loading || items.length === 0}
        >
          {loading ? 'Creating Invoice...' : 'Create Invoice'}
        </button>
      </div>
    </div>
  );
}
