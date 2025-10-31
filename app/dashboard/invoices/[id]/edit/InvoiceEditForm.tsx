'use client';

/**
 * InvoiceEditForm Component
 * Edit draft invoice, add transport/e-way bill details, finalize
 * Mobile-responsive layout
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Truck,
  FileCheck,
  ArrowLeft,
  Download,
  CheckCircle,
} from 'lucide-react';
import { finalizeInvoice } from '@/app/actions/accounting/finalize-invoice';
import { generateInvoicePDF } from '@/lib/utils/invoice-pdf';
import type { InvoicePDFData } from '@/lib/utils/invoice-pdf';

interface InvoiceEditFormProps {
  invoice: any;
  customer: any;
  company: any;
  items: any[];
}

export function InvoiceEditForm({
  invoice,
  customer,
  company,
  items,
}: InvoiceEditFormProps) {
  const router = useRouter();
  const [finalizing, setFinalizing] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Editable fields
  const [vehicleNumber, setVehicleNumber] = useState(invoice.vehicle_number || '');
  const [lrRrNumber, setLrRrNumber] = useState(invoice.lr_rr_number || '');
  const [lrRrDate, setLrRrDate] = useState(invoice.lr_rr_date || '');
  const [transportMode, setTransportMode] = useState(invoice.transport_mode || '');
  const [transporterName, setTransporterName] = useState(invoice.transporter_name || '');
  const [distanceKm, setDistanceKm] = useState(invoice.distance_km?.toString() || '');
  const [eWayBillNumber, setEWayBillNumber] = useState(invoice.e_way_bill_number || '');
  const [eWayBillDate, setEWayBillDate] = useState(invoice.e_way_bill_date || '');
  const [termsAndConditions, setTermsAndConditions] = useState(
    invoice.terms_and_conditions || ''
  );

  // Check if E-Way Bill is required (total > 50,000)
  const eWayBillRequired = invoice.total_amount > 50000;

  // Check if already finalized
  const isFinalized = invoice.status === 'finalized';

  const handleGeneratePDF = async () => {
    setGeneratingPdf(true);
    try {
      // Build customer name
      const customerName = customer.company_name ||
        `${customer.first_name || ''} ${customer.last_name || ''}`.trim();

      // Build customer address
      const customerAddress = [
        customer.address,
        customer.city,
        customer.state,
        customer.pincode,
      ]
        .filter(Boolean)
        .join(', ');

      // Build company address
      const companyAddress = [
        company.address,
        company.city,
        company.state,
        company.pincode,
      ]
        .filter(Boolean)
        .join(', ');

      // Prepare PDF data
      const pdfData: InvoicePDFData = {
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        company: {
          name: company.name || '',
          address: companyAddress,
          gstin: company.gstin || '',
          phone: company.phone || '',
          email: company.email || '',
          state: company.state || '',
        },
        customer: {
          name: customerName,
          address: customerAddress,
          gstin: customer.gstin || '',
          state: customer.state || '',
        },
        items: items.map((item) => {
          const product = item.products;
          const productDescription = product
            ? `${product.name}${product.material ? ' - ' + product.material : ''}${product.color ? ' (' + product.color + ')' : ''}`
            : item.description;

          return {
            description: productDescription || item.description,
            hsn_code: item.hsn_code,
            sac_code: item.sac_code,
            unit_of_measurement: item.unit_of_measurement || 'PCS',
            quantity: item.quantity,
            unit_rate: item.unit_rate,
            discount_amount: item.discount_amount || 0,
            taxable_amount: item.taxable_amount,
            cgst_rate: item.cgst_rate || 0,
            cgst_amount: item.cgst_amount || 0,
            sgst_rate: item.sgst_rate || 0,
            sgst_amount: item.sgst_amount || 0,
            igst_rate: item.igst_rate || 0,
            igst_amount: item.igst_amount || 0,
            line_total: item.line_total,
          };
        }),
        subtotal: invoice.subtotal,
        total_discount: invoice.discount_amount || 0,
        taxable_amount: invoice.subtotal - (invoice.discount_amount || 0),
        cgst_total: invoice.cgst_amount || 0,
        sgst_total: invoice.sgst_amount || 0,
        igst_total: invoice.igst_amount || 0,
        adjustment_amount: invoice.adjustment_amount,
        total_amount: invoice.total_amount,
        place_of_supply: invoice.place_of_supply,
        invoice_type: invoice.invoice_type,
        reverse_charge: invoice.reverse_charge || false,
        vehicle_number: vehicleNumber || undefined,
        lr_rr_number: lrRrNumber || undefined,
        lr_rr_date: lrRrDate || undefined,
        transport_mode: transportMode || undefined,
        transporter_name: transporterName || undefined,
        distance_km: distanceKm ? parseFloat(distanceKm) : undefined,
        e_way_bill_number: eWayBillNumber || undefined,
        e_way_bill_date: eWayBillDate || undefined,
        notes: termsAndConditions || invoice.notes,
      };

      const pdfBuffer = await generateInvoicePDF(pdfData);
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      // Open in new tab
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF preview');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleFinalize = async () => {
    // Validate E-Way Bill if required
    if (eWayBillRequired && !eWayBillNumber && !isFinalized) {
      if (
        !confirm(
          'E-Way Bill is recommended for invoices over �50,000. Continue without E-Way Bill?'
        )
      ) {
        return;
      }
    }

    setFinalizing(true);
    try {
      const result = await finalizeInvoice({
        invoice_id: invoice.id,
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
        terms_and_conditions: termsAndConditions || undefined,
      });

      if (result.success) {
        alert('Invoice finalized successfully! Journal entries created.');
        router.push('/dashboard/invoices');
      } else {
        alert(result.error || 'Failed to finalize invoice');
      }
    } catch (error) {
      console.error('Error finalizing invoice:', error);
      alert('Failed to finalize invoice');
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {isFinalized ? 'Invoice Details' : 'Edit Invoice'}
              </h1>
              <p className="text-sm text-gray-500">
                {invoice.invoice_number} " {invoice.invoice_date}
              </p>
            </div>
          </div>
          {isFinalized && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              Finalized
            </div>
          )}
        </div>
      </div>

      {/* Customer & Items Summary (Read-Only) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Customer & Items
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Bill To:</h3>
            <p className="text-base font-medium text-gray-900">
              {customer.company_name ||
                `${customer.first_name || ''} ${customer.last_name || ''}`.trim()}
            </p>
            {customer.gstin && (
              <p className="text-sm text-gray-600">GSTIN: {customer.gstin}</p>
            )}
            <p className="text-sm text-gray-600">{customer.state}</p>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Invoice Type:</span>
              <span className="font-medium">{invoice.invoice_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Place of Supply:</span>
              <span className="font-medium">{invoice.place_of_supply}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Items:</span>
              <span className="font-medium">{items.length}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-2 font-medium text-gray-700">#</th>
                <th className="text-left p-2 font-medium text-gray-700">Description</th>
                <th className="text-right p-2 font-medium text-gray-700">Qty</th>
                <th className="text-right p-2 font-medium text-gray-700">Rate</th>
                <th className="text-right p-2 font-medium text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const product = item.products;
                const productDescription = product
                  ? `${product.name}${product.material ? ' - ' + product.material : ''}${product.color ? ' (' + product.color + ')' : ''}`
                  : item.description;

                return (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="p-2 text-gray-600">{index + 1}</td>
                    <td className="p-2">
                      <p className="font-medium text-gray-900">{productDescription}</p>
                      {item.hsn_code && (
                        <p className="text-xs text-gray-500">HSN: {item.hsn_code}</p>
                      )}
                    </td>
                    <td className="p-2 text-right text-gray-600">
                      {item.quantity} {item.unit_of_measurement || 'PCS'}
                    </td>
                    <td className="p-2 text-right text-gray-600">
                      �{item.unit_rate.toFixed(2)}
                    </td>
                    <td className="p-2 text-right font-medium text-gray-900">
                      �{item.line_total.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300">
                <td colSpan={4} className="p-2 text-right font-semibold text-gray-900">
                  Total Amount:
                </td>
                <td className="p-2 text-right font-bold text-lg text-gray-900">
                  �{invoice.total_amount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Transport Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
          <Truck className="h-5 w-5" />
          Transport Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Number
            </label>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              disabled={isFinalized}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="MH12AB1234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transport Mode
            </label>
            <select
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value)}
              disabled={isFinalized}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">Select mode</option>
              <option value="Road">Road</option>
              <option value="Rail">Rail</option>
              <option value="Air">Air</option>
              <option value="Ship">Ship</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LR/RR Number
            </label>
            <input
              type="text"
              value={lrRrNumber}
              onChange={(e) => setLrRrNumber(e.target.value)}
              disabled={isFinalized}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Lorry Receipt No."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LR/RR Date
            </label>
            <input
              type="date"
              value={lrRrDate}
              onChange={(e) => setLrRrDate(e.target.value)}
              disabled={isFinalized}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transporter Name
            </label>
            <input
              type="text"
              value={transporterName}
              onChange={(e) => setTransporterName(e.target.value)}
              disabled={isFinalized}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Transport company"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distance (KM)
            </label>
            <input
              type="number"
              min="0"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              disabled={isFinalized}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Distance in km"
            />
          </div>
        </div>
      </div>

      {/* E-Way Bill */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">E-Way Bill</h2>
        {eWayBillRequired && (
          <p className="text-sm text-orange-600 mb-4">
            Recommended for invoices over �50,000
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-Way Bill Number
            </label>
            <input
              type="text"
              value={eWayBillNumber}
              onChange={(e) => setEWayBillNumber(e.target.value)}
              disabled={isFinalized}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="12 digit E-Way Bill No."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-Way Bill Date
            </label>
            <input
              type="date"
              value={eWayBillDate}
              onChange={(e) => setEWayBillDate(e.target.value)}
              disabled={isFinalized}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Terms & Conditions
        </h2>
        <textarea
          value={termsAndConditions}
          onChange={(e) => setTermsAndConditions(e.target.value)}
          disabled={isFinalized}
          rows={4}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
          placeholder="Add payment terms, delivery conditions, etc."
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleGeneratePDF}
          disabled={generatingPdf}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {generatingPdf ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Generating...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Generate PDF Preview
            </>
          )}
        </button>

        {!isFinalized && (
          <button
            onClick={handleFinalize}
            disabled={finalizing}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {finalizing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Finalizing...
              </>
            ) : (
              <>
                <FileCheck className="h-5 w-5" />
                Finalise Invoice
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
