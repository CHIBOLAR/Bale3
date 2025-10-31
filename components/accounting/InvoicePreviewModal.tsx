'use client';

/**
 * Invoice Preview Modal
 * Shows auto-generated invoice preview with editable transport/e-way bill fields
 * Accountant reviews → Adds missing details → Approves → Saves to DB
 */

import { useState, useEffect } from 'react';
import { X, FileText, Truck, AlertCircle } from 'lucide-react';
import { generateInvoicePDF } from '@/lib/utils/invoice-pdf';
import type { InvoicePDFData } from '@/lib/utils/invoice-pdf';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewData: InvoicePDFData & {
    customer_id: string;
    dispatch_id: string;
  };
  onApprove: (data: {
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
  }) => Promise<void>;
}

export function InvoicePreviewModal({
  isOpen,
  onClose,
  previewData,
  onApprove,
}: InvoicePreviewModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);

  // Editable fields
  const [vehicleNumber, setVehicleNumber] = useState(previewData.vehicle_number || '');
  const [lrRrNumber, setLrRrNumber] = useState(previewData.lr_rr_number || '');
  const [lrRrDate, setLrRrDate] = useState(previewData.lr_rr_date || '');
  const [transportMode, setTransportMode] = useState(previewData.transport_mode || '');
  const [transporterName, setTransporterName] = useState(previewData.transporter_name || '');
  const [distanceKm, setDistanceKm] = useState(previewData.distance_km?.toString() || '');
  const [eWayBillNumber, setEWayBillNumber] = useState('');
  const [eWayBillDate, setEWayBillDate] = useState('');

  // Check if E-Way Bill is required (total > 50,000)
  const eWayBillRequired = previewData.total_amount > 50000;

  // Generate PDF preview when modal opens
  useEffect(() => {
    if (isOpen) {
      generatePdfPreview();
    }
  }, [isOpen]);

  const generatePdfPreview = async () => {
    setLoading(true);
    try {
      // Update preview data with current editable values
      const updatedData = {
        ...previewData,
        vehicle_number: vehicleNumber,
        lr_rr_number: lrRrNumber,
        lr_rr_date: lrRrDate,
        transport_mode: transportMode,
        transporter_name: transporterName,
        distance_km: distanceKm ? parseFloat(distanceKm) : undefined,
        e_way_bill_number: eWayBillNumber || undefined,
        e_way_bill_date: eWayBillDate || undefined,
      };

      const pdfBuffer = await generateInvoicePDF(updatedData);
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF preview');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshPreview = () => {
    generatePdfPreview();
  };

  const handleApprove = async () => {
    // Validate E-Way Bill if required
    if (eWayBillRequired && !eWayBillNumber) {
      if (!confirm('E-Way Bill is recommended for invoices over ₹50,000. Continue without E-Way Bill?')) {
        return;
      }
    }

    setApproving(true);
    try {
      await onApprove({
        transport_details: {
          vehicle_number: vehicleNumber || undefined,
          lr_rr_number: lrRrNumber || undefined,
          lr_rr_date: lrRrDate || undefined,
          transport_mode: transportMode || undefined,
          transporter_name: transporterName || undefined,
          distance_km: distanceKm ? parseFloat(distanceKm) : undefined,
        },
        e_way_bill: {
          number: eWayBillNumber || undefined,
          date: eWayBillDate || undefined,
        },
      });
    } catch (error) {
      console.error('Error approving invoice:', error);
      alert('Failed to approve invoice');
    } finally {
      setApproving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-7xl max-h-[95vh] bg-white rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Invoice Preview & Approval</h2>
              <p className="text-sm text-gray-500">
                Review auto-generated invoice • Add missing details • Approve to finalize
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: PDF Preview */}
          <div className="flex-1 bg-gray-100 p-4 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Generating preview...</p>
                </div>
              </div>
            ) : pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="w-full h-full rounded border border-gray-300 bg-white"
                title="Invoice Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No preview available
              </div>
            )}
          </div>

          {/* Right: Editable Fields */}
          <div className="w-96 border-l border-gray-200 bg-white overflow-auto">
            <div className="p-6 space-y-6">
              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Auto-Populated Data</p>
                    <p className="text-xs">
                      HSN codes, GST breakdown, and customer details are auto-filled from masters.
                      Add missing transport/E-Way Bill details below.
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Invoice Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">{previewData.customer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{previewData.invoice_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-semibold text-lg">₹{previewData.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Transport Details */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                  <Truck className="h-4 w-4" />
                  Transport Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Vehicle Number
                    </label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                      placeholder="MH12AB1234"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Transport Mode
                    </label>
                    <select
                      value={transportMode}
                      onChange={(e) => setTransportMode(e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                    >
                      <option value="">Select mode</option>
                      <option value="Road">Road</option>
                      <option value="Rail">Rail</option>
                      <option value="Air">Air</option>
                      <option value="Ship">Ship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      LR/RR Number
                    </label>
                    <input
                      type="text"
                      value={lrRrNumber}
                      onChange={(e) => setLrRrNumber(e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                      placeholder="Lorry Receipt No."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      LR/RR Date
                    </label>
                    <input
                      type="date"
                      value={lrRrDate}
                      onChange={(e) => setLrRrDate(e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Transporter Name
                    </label>
                    <input
                      type="text"
                      value={transporterName}
                      onChange={(e) => setTransporterName(e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                      placeholder="Transport company"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Distance (KM)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                      placeholder="Distance in km"
                    />
                  </div>
                </div>
              </div>

              {/* E-Way Bill */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  E-Way Bill
                  {eWayBillRequired && (
                    <span className="ml-2 text-xs font-normal text-orange-600">
                      (Recommended for amount &gt; ₹50,000)
                    </span>
                  )}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      E-Way Bill Number
                    </label>
                    <input
                      type="text"
                      value={eWayBillNumber}
                      onChange={(e) => setEWayBillNumber(e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                      placeholder="12 digit E-Way Bill No."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      E-Way Bill Date
                    </label>
                    <input
                      type="date"
                      value={eWayBillDate}
                      onChange={(e) => setEWayBillDate(e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Refresh Preview Button */}
              <button
                onClick={handleRefreshPreview}
                disabled={loading}
                className="w-full rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh Preview'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="text-sm text-gray-600">
            Once approved, invoice will be saved and journal entries will be created.
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={approving}
              className="px-4 py-2 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={approving || loading}
              className="px-6 py-2 rounded bg-green-600 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {approving ? 'Approving...' : 'Approve & Finalize Invoice'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
