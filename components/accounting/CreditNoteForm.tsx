'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCreditNote } from '@/app/actions/accounting/invoices';

interface CreditNoteFormProps {
  invoiceId: string;
  invoiceNumber: string;
  totalAmount: number;
}

export function CreditNoteForm({
  invoiceId,
  invoiceNumber,
  totalAmount,
}: CreditNoteFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const handleCreate = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for the credit note');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await createCreditNote(invoiceId, reason);

    setLoading(false);

    if (result.success && result.credit_note_id) {
      router.push(`/dashboard/invoices/${result.credit_note_id}`);
      router.refresh();
    } else {
      setError(result.error || 'Failed to create credit note');
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Credit Note Details
      </h3>

      {/* Reason */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reason for Credit Note <span className="text-red-500">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          required
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="E.g., Goods returned by customer, Pricing error, Cancelled order..."
        />
        <p className="mt-1 text-xs text-gray-500">
          This reason will be recorded in the audit log and shown on the credit note.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-6 rounded-lg bg-gray-50 p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Credit Note Summary
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Original Invoice</span>
            <span className="font-medium text-gray-900">{invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Credit Amount</span>
            <span className="font-medium text-red-600">
              -₹{totalAmount.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
          <ul className="space-y-1 list-disc list-inside">
            <li>All line items will be reversed with negative quantities</li>
            <li>Journal entries will be created to reverse the original transaction</li>
            <li>Original invoice will be marked as "Credited"</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleCreate}
          disabled={loading || !reason.trim()}
          className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Creating Credit Note...' : 'Create Credit Note'}
        </button>
      </div>
    </div>
  );
}
