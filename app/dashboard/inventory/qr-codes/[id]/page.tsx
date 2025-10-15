'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Download, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { getBarcodeBatch } from '@/app/actions/inventory/barcode';
import { PRODUCT_LABEL_FIELDS, STOCK_UNIT_LABEL_FIELDS } from '@/lib/types/inventory';

interface GroupedBatchItems {
  receipt_number: string;
  receipt_date: string;
  items: any[];
}

export default function BatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const batchId = params.id as string;

  const [batch, setBatch] = useState<any>(null);
  const [groupedItems, setGroupedItems] = useState<GroupedBatchItems[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatch();
  }, [batchId]);

  async function fetchBatch() {
    setLoading(true);
    try {
      const data = await getBarcodeBatch(batchId);
      if (data) {
        setBatch(data);
        const grouped = groupItemsByReceipt(data.items || []);
        setGroupedItems(grouped);
        // Auto-expand first group
        if (grouped.length > 0) {
          setExpandedGroups(new Set([grouped[0].receipt_number]));
        }
      }
    } catch (error) {
      console.error('Error fetching batch:', error);
    } finally {
      setLoading(false);
    }
  }

  function groupItemsByReceipt(items: any[]): GroupedBatchItems[] {
    const groups = new Map<string, GroupedBatchItems>();

    items.forEach((item) => {
      if (!item.stock_units) return;

      const receiptNumber = item.stock_units.unit_number.split('-').slice(0, 2).join('-');

      if (!groups.has(receiptNumber)) {
        groups.set(receiptNumber, {
          receipt_number: receiptNumber,
          receipt_date: item.stock_units.date_received,
          items: [],
        });
      }
      groups.get(receiptNumber)!.items.push(item);
    });

    return Array.from(groups.values()).sort(
      (a, b) => new Date(b.receipt_date).getTime() - new Date(a.receipt_date).getTime()
    );
  }

  const toggleGroup = (receiptNumber: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(receiptNumber)) {
        next.delete(receiptNumber);
      } else {
        next.add(receiptNumber);
      }
      return next;
    });
  };

  const handleShare = async () => {
    if (batch?.pdf_url && navigator.share) {
      try {
        await navigator.share({
          title: batch.batch_name,
          text: `QR Code batch: ${batch.batch_name}`,
          url: batch.pdf_url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleDownload = () => {
    if (batch?.pdf_url) {
      window.open(batch.pdf_url, '_blank');
    }
  };

  const getFieldValue = (item: any, fieldId: string): string => {
    const stockUnit = item.stock_units;
    const product = stockUnit?.products;

    // Product fields
    if (fieldId === 'product_name') return product?.name || '';
    if (fieldId === 'product_number') return product?.product_number || '';
    if (fieldId === 'hsn_code') return product?.hsn_code || '';
    if (fieldId === 'material') return product?.material || '';
    if (fieldId === 'color') return product?.color || '';
    if (fieldId === 'gsm') return product?.gsm?.toString() || '';
    if (fieldId === 'sale_price') return product?.sale_price?.toString() || '';

    // Stock unit fields
    if (fieldId === 'unit_number') return stockUnit?.unit_number || '';
    if (fieldId === 'made_on') return stockUnit?.manufacture_date || '';
    if (fieldId === 'size') return `${stockUnit?.size_quantity} m` || '';
    if (fieldId === 'wastage') return `${stockUnit?.wastage_quantity} m` || '';
    if (fieldId === 'quality_grade') return stockUnit?.quality_grade || '';
    if (fieldId === 'location') return stockUnit?.location || '';

    return '';
  };

  const getAllFields = () => {
    return [...PRODUCT_LABEL_FIELDS, ...STOCK_UNIT_LABEL_FIELDS];
  };

  const getFieldLabel = (fieldId: string): string => {
    const field = getAllFields().find(f => f.id === fieldId);
    return field?.label || fieldId;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading batch details...</div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Batch not found</div>
      </div>
    );
  }

  const selectedItem = batch.items?.[selectedUnitIndex];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/inventory/qr-codes')}
            className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to QR Codes
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{batch.batch_name}</h1>
              <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                <span>{batch.items?.length || 0} QR codes</span>
                <span>•</span>
                <span>Created on {new Date(batch.created_at).toLocaleDateString()}</span>
                {batch.warehouses && (
                  <>
                    <span>•</span>
                    <span>{batch.warehouses.name}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {batch.pdf_url && (
                <>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column - QR Preview */}
          <div>
            <div className="sticky top-6 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-medium text-gray-900">QR Code Preview</h2>

              {selectedItem && selectedItem.stock_units && (
                <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-6">
                  <div className="flex gap-4">
                    {/* QR Code */}
                    <div className="flex-shrink-0">
                      <QRCodeSVG
                        value={selectedItem.stock_units.qr_code}
                        size={120}
                        level="H"
                        includeMargin={false}
                      />
                    </div>

                    {/* Label Fields */}
                    <div className="flex-1 space-y-1 text-xs">
                      {batch.fields_selected?.slice(0, 3).map((fieldId: string) => {
                        const value = getFieldValue(selectedItem, fieldId);
                        if (!value) return null;
                        return (
                          <div key={fieldId}>
                            <span className="font-medium">{getFieldLabel(fieldId)}: </span>
                            {value}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Additional Fields */}
                  <div className="mt-4 space-y-1 text-xs">
                    {batch.fields_selected?.slice(3).map((fieldId: string) => {
                      const value = getFieldValue(selectedItem, fieldId);
                      if (!value) return null;
                      return (
                        <div key={fieldId}>
                          <span className="font-medium">{getFieldLabel(fieldId)}: </span>
                          {value}
                        </div>
                      );
                    })}
                  </div>

                  {/* QR Code String */}
                  <div className="mt-4 rounded-md bg-white p-3">
                    <p className="break-all text-center font-mono text-xs text-gray-600">
                      {selectedItem.stock_units.qr_code}
                    </p>
                  </div>
                </div>
              )}

              <p className="mt-4 text-xs text-gray-500">
                Click on any unit below to preview its QR code
              </p>
            </div>
          </div>

          {/* Right Column - Units List */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-gray-900">Stock Units</h2>

            {groupedItems.map((group) => {
              const isExpanded = expandedGroups.has(group.receipt_number);

              return (
                <div key={group.receipt_number} className="rounded-lg bg-white shadow-sm">
                  {/* Group Header */}
                  <div className="flex items-center justify-between border-b border-gray-200 p-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {group.receipt_number}
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          ({group.items.length} units)
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(group.receipt_date).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleGroup(group.receipt_number)}
                      className="rounded-md p-1 hover:bg-gray-100"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>

                  {/* Group Items */}
                  {isExpanded && (
                    <div className="divide-y divide-gray-100">
                      {group.items.map((item, index) => {
                        if (!item.stock_units) return null;

                        const globalIndex = batch.items.indexOf(item);
                        const isSelected = selectedUnitIndex === globalIndex;

                        return (
                          <button
                            key={item.id}
                            onClick={() => setSelectedUnitIndex(globalIndex)}
                            className={`flex w-full items-center justify-between p-4 text-left transition-colors ${
                              isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-sm font-medium text-gray-900">
                                  #{item.stock_units.unit_number}
                                </p>
                                {isSelected && (
                                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                    Previewing
                                  </span>
                                )}
                              </div>
                              {item.stock_units.products && (
                                <p className="mt-0.5 text-xs text-gray-500">
                                  {item.stock_units.products.name}
                                </p>
                              )}
                            </div>

                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                {item.stock_units.size_quantity} m
                              </p>
                              {item.stock_units.quality_grade && (
                                <p className="text-xs text-gray-500">
                                  {item.stock_units.quality_grade}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {groupedItems.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-500">No units in this batch</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
