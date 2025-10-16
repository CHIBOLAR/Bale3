'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { PRODUCT_LABEL_FIELDS, STOCK_UNIT_LABEL_FIELDS, QRLabelFieldOption } from '@/lib/types/inventory';
import { createBarcodeBatch } from '@/app/actions/inventory/barcode';

export default function ConfigureLabelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('product');
  const unitIds = searchParams.get('units')?.split(',') || [];

  const [batchName, setBatchName] = useState('');
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    new Set(['product_name', 'product_number', 'hsn_code', 'unit_number', 'made_on', 'size', 'wastage'])
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Auto-generate batch name
    const date = new Date().toLocaleDateString();
    setBatchName(`Batch ${date}`);
  }, []);

  const toggleField = (fieldId: string) => {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(fieldId)) {
        next.delete(fieldId);
      } else {
        next.add(fieldId);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!productId || unitIds.length === 0) return;

    setIsSubmitting(true);
    try {
      const result = await createBarcodeBatch({
        batch_name: batchName,
        warehouse_id: '', // Will be set from stock units
        fields_selected: Array.from(selectedFields),
        stock_unit_ids: unitIds,
        layout_config: {
          paperSize: 'A4',
          labelWidth: 65,    // Optimized: 2-3 labels per row
          labelHeight: 40,   // Optimized: 6 labels per column
          marginTop: 10,
          marginLeft: 10,
          spacing: 3,
          qrSize: 30,        // Smaller QR to fit more info
          fontSize: 7,
        },
      });

      if (result.success) {
        console.log('✅ Successfully generated QR codes!');
        // Refresh router cache to ensure all pages show updated data
        router.refresh();
        // Navigate to the batch detail page
        router.push(`/dashboard/inventory/qr-codes/${result.batchId}`);
      } else {
        alert(`Error: ${result.error || 'Failed to generate QR codes'}`);
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock data for preview
  const previewData = {
    qr_code: 'UNIT-12345-1234567890-ABC123',
    product_name: 'Garden Gala',
    product_number: '#5812397458',
    hsn_code: '12345678',
    material: 'Cotton',
    color: 'Sky Blue',
    gsm: '120',
    sale_price: '₹450',
    unit_number: 'GRN-120-001',
    made_on: '2025-10-15',
    size: '10 m',
    wastage: '0.5 m',
    quality_grade: 'A',
    location: 'A1-B2',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create QR codes</h1>
          <p className="mt-1 text-sm text-gray-600">Step 3 of 3</p>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-full bg-blue-600" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            {/* Batch Name */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Batch Name
              </label>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter batch name"
              />
            </div>

            {/* Field Selection */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-medium text-gray-900">Select details for label</h2>
              <p className="mb-4 text-xs text-gray-500">
                {unitIds.length} unit{unitIds.length !== 1 ? 's' : ''}
              </p>

              {/* Product Information */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-medium text-gray-700">Product information</h3>
                <div className="grid grid-cols-2 gap-3">
                  {PRODUCT_LABEL_FIELDS.map((field) => (
                    <label
                      key={field.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFields.has(field.id)}
                        onChange={() => toggleField(field.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{field.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stock Unit Information */}
              <div>
                <h3 className="mb-3 text-sm font-medium text-gray-700">Stock unit information</h3>
                <div className="grid grid-cols-2 gap-3">
                  {STOCK_UNIT_LABEL_FIELDS.map((field) => (
                    <label
                      key={field.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFields.has(field.id)}
                        onChange={() => toggleField(field.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{field.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div>
            <div className="sticky top-6 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-medium text-gray-900">Label Preview</h2>

              {/* QR Label Preview */}
              <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-3">
                <div className="flex gap-3">
                  {/* QR Code */}
                  <div className="flex-shrink-0">
                    <QRCodeSVG
                      value={previewData.qr_code}
                      size={80}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  {/* Label Fields */}
                  <div className="flex-1 space-y-1 text-xs">
                    {selectedFields.has('product_name') && (
                      <div>
                        <span className="font-medium">Name: </span>
                        {previewData.product_name}
                      </div>
                    )}
                    {selectedFields.has('product_number') && (
                      <div>
                        <span className="font-medium">Product No: </span>
                        {previewData.product_number}
                      </div>
                    )}
                    {selectedFields.has('hsn_code') && (
                      <div>
                        <span className="font-medium">HSN code: </span>
                        {previewData.hsn_code}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Fields */}
                <div className="mt-3 space-y-1 text-xs">
                  {selectedFields.has('material') && (
                    <div>
                      <span className="font-medium">Material: </span>
                      {previewData.material}
                    </div>
                  )}
                  {selectedFields.has('color') && (
                    <div>
                      <span className="font-medium">Color: </span>
                      {previewData.color}
                    </div>
                  )}
                  {selectedFields.has('gsm') && (
                    <div>
                      <span className="font-medium">GSM: </span>
                      {previewData.gsm}
                    </div>
                  )}
                  {selectedFields.has('sale_price') && (
                    <div>
                      <span className="font-medium">Price: </span>
                      {previewData.sale_price}
                    </div>
                  )}
                  {selectedFields.has('unit_number') && (
                    <div>
                      <span className="font-medium">Unit No: </span>
                      {previewData.unit_number}
                    </div>
                  )}
                  {selectedFields.has('made_on') && (
                    <div>
                      <span className="font-medium">Made on: </span>
                      {previewData.made_on}
                    </div>
                  )}
                  {selectedFields.has('size') && (
                    <div>
                      <span className="font-medium">Size: </span>
                      {previewData.size}
                    </div>
                  )}
                  {selectedFields.has('wastage') && (
                    <div>
                      <span className="font-medium">Wastage: </span>
                      {previewData.wastage}
                    </div>
                  )}
                  {selectedFields.has('quality_grade') && (
                    <div>
                      <span className="font-medium">Quality: </span>
                      {previewData.quality_grade}
                    </div>
                  )}
                  {selectedFields.has('location') && (
                    <div>
                      <span className="font-medium">Location: </span>
                      {previewData.location}
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-4 text-xs text-gray-500">
                This is a preview of how your label will appear. Actual labels will be generated as PDF.
              </p>

              <div className="mt-4 rounded-md bg-blue-50 p-3">
                <p className="text-xs text-blue-700">
                  <strong>Layout:</strong> 2 labels per row × 6 per column = 12 labels per A4 page
                </p>
                <p className="mt-1 text-xs text-blue-600">
                  {unitIds.length} unit{unitIds.length !== 1 ? 's' : ''} selected = ~{Math.ceil(unitIds.length / 12)} page{Math.ceil(unitIds.length / 12) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedFields.size === 0}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Generating...' : 'Generate QR Codes'}
          </button>
        </div>
      </div>
    </div>
  );
}
