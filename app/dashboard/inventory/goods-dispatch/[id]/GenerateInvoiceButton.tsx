'use client';

/**
 * Generate Invoice Button with Preview Modal
 * Client component for goods dispatch detail page
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileTextIcon } from 'lucide-react';
import { InvoicePreviewModal } from '@/components/accounting/InvoicePreviewModal';
import { generateInvoicePreview } from '@/app/actions/accounting/invoice-preview';
import { approveInvoice } from '@/app/actions/accounting/approve-invoice';
import type { InvoicePDFData } from '@/lib/utils/invoice-pdf';

interface GenerateInvoiceButtonProps {
  dispatchId: string;
}

export function GenerateInvoiceButton({ dispatchId }: GenerateInvoiceButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [previewData, setPreviewData] = useState<(InvoicePDFData & {
    customer_id: string;
    dispatch_id: string;
  }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePreview = async () => {
    console.log('[GenerateInvoiceButton] Starting preview generation for dispatch:', dispatchId);
    setLoading(true);
    setError(null);

    try {
      console.log('[GenerateInvoiceButton] Calling generateInvoicePreview...');
      const result = await generateInvoicePreview(dispatchId);
      console.log('[GenerateInvoiceButton] Result:', result);

      if (!result.success || !result.data) {
        const errorMsg = result.error || 'Failed to generate preview';
        console.error('[GenerateInvoiceButton] Error:', errorMsg);
        setError(errorMsg);
        alert(errorMsg);
        return;
      }

      console.log('[GenerateInvoiceButton] Preview data received, opening modal');
      setPreviewData(result.data);
      setShowModal(true);
    } catch (err) {
      console.error('[GenerateInvoiceButton] Unexpected error:', err);
      setError('An unexpected error occurred');
      alert('An unexpected error occurred: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (data: {
    transport_details: {
      vehicle_number?: string;
      lr_rr_number?: string;
      lr_rr_date?: string;
      transport_mode?: string;
      transporter_name?: string;
      distance_km?: number;
    };
    e_way_bill?: {
      number?: string;
      date?: string;
    };
  }) => {
    try {
      const result = await approveInvoice({
        dispatch_id: dispatchId,
        transport_details: data.transport_details,
        e_way_bill: data.e_way_bill,
      });

      if (!result.success) {
        alert(result.error || 'Failed to approve invoice');
        return;
      }

      // Success! Close modal and redirect to invoice
      setShowModal(false);
      alert('Invoice created successfully!');
      router.push(`/dashboard/invoices/${result.invoice_id}`);
    } catch (err) {
      console.error('Error approving invoice:', err);
      alert('An unexpected error occurred while approving invoice');
    }
  };

  return (
    <>
      <button
        onClick={handleGeneratePreview}
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FileTextIcon className="h-4 w-4" />
        {loading ? 'Generating Preview...' : 'Generate Invoice'}
      </button>

      {showModal && previewData && (
        <InvoicePreviewModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          previewData={previewData}
          onApprove={handleApprove}
        />
      )}
    </>
  );
}
