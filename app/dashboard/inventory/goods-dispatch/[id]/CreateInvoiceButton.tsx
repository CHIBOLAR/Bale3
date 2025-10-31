'use client';

/**
 * CreateInvoiceButton Component
 * Shows "Create Invoice" button or "Invoice Created" badge
 * Creates draft invoice from dispatch and navigates to edit page
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus, CheckCircle } from 'lucide-react';
import { createInvoiceFromDispatch } from '@/app/actions/accounting/create-invoice-from-dispatch';

interface CreateInvoiceButtonProps {
  dispatchId: string;
  linkedInvoice?: {
    id: string;
    invoice_number: string;
    status: string;
    total_amount: number;
  } | null;
}

export function CreateInvoiceButton({
  dispatchId,
  linkedInvoice,
}: CreateInvoiceButtonProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const handleCreateInvoice = async () => {
    if (creating) return;

    setCreating(true);
    try {
      const result = await createInvoiceFromDispatch({
        dispatch_id: dispatchId,
      });

      if (result.success && result.invoice_id) {
        // Navigate to invoice edit page
        router.push(`/dashboard/invoices/${result.invoice_id}/edit`);
      } else {
        alert(result.error || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice');
    } finally {
      setCreating(false);
    }
  };

  // If invoice already exists, show badge with link
  if (linkedInvoice) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">
              Invoice Created: {linkedInvoice.invoice_number}
            </p>
            <p className="text-xs text-green-700">
              Status: <span className="capitalize">{linkedInvoice.status}</span> •
              Amount: ₹{linkedInvoice.total_amount.toFixed(2)}
            </p>
          </div>
          <a
            href={`/dashboard/invoices/${linkedInvoice.id}/edit`}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
          >
            {linkedInvoice.status === 'draft' ? 'Edit Invoice' : 'View Invoice'}
          </a>
        </div>
      </div>
    );
  }

  // If no invoice exists, show create button
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Create Invoice from Dispatch
            </p>
            <p className="text-xs text-blue-700">
              Generate GST-compliant invoice for this dispatch
            </p>
          </div>
        </div>
        <button
          onClick={handleCreateInvoice}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {creating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Create Invoice
            </>
          )}
        </button>
      </div>
    </div>
  );
}
