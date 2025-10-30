'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InvoiceItemsTable } from './InvoiceItemsTable';
import { editInvoice } from '@/app/actions/accounting/invoices';
import type { InvoiceFormData, InvoiceItem } from '@/lib/accounting/types';

interface EditInvoiceFormProps {
  invoiceId: string;
  customerId: string;
  customerName: string;
  invoiceDate: string;
  dueDate?: string | null;
  initialItems: InvoiceItem[];
  initialDiscountAmount: number;
  initialAdjustmentAmount: number;
  initialNotes: string;
}

export function EditInvoiceForm({
  invoiceId,
  customerId,
  customerName,
  invoiceDate: initialInvoiceDate,
  dueDate: initialDueDate,
  initialItems,
  initialDiscountAmount,
  initialAdjustmentAmount,
  initialNotes,
}: EditInvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [invoiceDate, setInvoiceDate] = useState(initialInvoiceDate);
  const [dueDate, setDueDate] = useState(initialDueDate || '');
  const [items, setItems] = useState<InvoiceItem[]>(initialItems);
  const [discountAmount, setDiscountAmount] = useState(initialDiscountAmount);
  const [adjustmentAmount, setAdjustmentAmount] = useState(initialAdjustmentAmount);
  const [notes, setNotes] = useState(initialNotes);

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

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    const formData: InvoiceFormData = {
      customer_id: customerId,
      invoice_date: invoiceDate,
      due_date: dueDate || null,
      items,
      discount_amount: discountAmount,
      adjustment_amount: adjustmentAmount,
      notes,
    };

    const result = await editInvoice(invoiceId, formData);

    setLoading(false);

    if (result.success) {
      router.push(`/dashboard/invoices/${invoiceId}`);
      router.refresh();
    } else {
      setError(result.error || 'Failed to update invoice');
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
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={loading || items.length === 0}
        >
          {loading ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
