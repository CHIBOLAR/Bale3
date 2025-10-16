'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, ChevronDown, ChevronUp, Clock, CheckCircle } from 'lucide-react';
import { StockUnitWithRelations } from '@/lib/types/inventory';
import { getStockUnitsForQRGeneration, getStockUnitsQRStatus } from '@/app/actions/inventory/barcode';

interface BatchGroup {
  batch_id: string;
  batch_name: string;
  created_at: string;
  units: StockUnitWithRelations[];
}

interface ReceiptItemGroup {
  receipt_item_id: string;
  receipt_number: string;
  receipt_date: string;
  supplier_name: string;
  variant_combination: any;
  units: StockUnitWithRelations[];
}

export default function SelectUnitsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('product');

  const [productName, setProductName] = useState('');
  const [batchGroups, setBatchGroups] = useState<BatchGroup[]>([]);
  const [receiptItemGroups, setReceiptItemGroups] = useState<ReceiptItemGroup[]>([]);
  const [selectedUnitIds, setSelectedUnitIds] = useState<Set<string>>(new Set());
  const [expandedBatchGroups, setExpandedBatchGroups] = useState<Set<string>>(new Set());
  const [expandedReceiptGroups, setExpandedReceiptGroups] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      fetchUnits();
    }
  }, [productId]);

  async function fetchUnits() {
    setLoading(true);
    try {
      const data = await getStockUnitsForQRGeneration(productId!);
      if (data.length > 0) {
        setProductName(data[0].products.name);

        // Separate units with and without QR codes
        const unitsWithQR = data.filter((unit: any) => unit.batch_info !== null);
        const unitsWithoutQR = data.filter((unit: any) => unit.batch_info === null);

        // Group units with QR codes by batch
        const batchGrouped = groupByBatch(unitsWithQR);
        setBatchGroups(batchGrouped);

        // Group units without QR codes by receipt item
        const receiptGrouped = groupByReceiptItem(unitsWithoutQR);
        setReceiptItemGroups(receiptGrouped);

        // Auto-expand first groups
        if (batchGrouped.length > 0) {
          setExpandedBatchGroups(new Set([batchGrouped[0].batch_id]));
        }
        if (receiptGrouped.length > 0) {
          setExpandedReceiptGroups(new Set([receiptGrouped[0].receipt_item_id]));
        }
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    } finally {
      setLoading(false);
    }
  }

  function groupByBatch(units: any[]): BatchGroup[] {
    const groups = new Map<string, BatchGroup>();

    units.forEach((unit) => {
      const batchId = unit.batch_info?.batch_id;
      if (!batchId) return;

      if (!groups.has(batchId)) {
        groups.set(batchId, {
          batch_id: batchId,
          batch_name: unit.batch_info.batch_name,
          created_at: unit.batch_info.created_at,
          units: [],
        });
      }
      groups.get(batchId)!.units.push(unit);
    });

    return Array.from(groups.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  function groupByReceiptItem(units: any[]): ReceiptItemGroup[] {
    const groups = new Map<string, ReceiptItemGroup>();

    units.forEach((unit) => {
      const receiptItemId = unit.receipt_item_info?.receipt_item_id;
      if (!receiptItemId) return;

      if (!groups.has(receiptItemId)) {
        groups.set(receiptItemId, {
          receipt_item_id: receiptItemId,
          receipt_number: unit.receipt_item_info.receipt_number,
          receipt_date: unit.receipt_item_info.receipt_date,
          supplier_name: unit.receipt_item_info.supplier_name,
          variant_combination: unit.receipt_item_info.variant_combination,
          units: [],
        });
      }
      groups.get(receiptItemId)!.units.push(unit);
    });

    return Array.from(groups.values()).sort(
      (a, b) => new Date(b.receipt_date).getTime() - new Date(a.receipt_date).getTime()
    );
  }

  function formatVariantInfo(variantCombination: any): string {
    if (!variantCombination || typeof variantCombination !== 'object') return '';

    const entries = Object.entries(variantCombination);
    if (entries.length === 0) return '';

    return entries
      .map(([key, value]) => `${key}: ${value}`)
      .join(' • ');
  }

  const toggleBatchGroup = (batchId: string) => {
    setExpandedBatchGroups((prev) => {
      const next = new Set(prev);
      if (next.has(batchId)) {
        next.delete(batchId);
      } else {
        next.add(batchId);
      }
      return next;
    });
  };

  const toggleReceiptGroup = (receiptItemId: string) => {
    setExpandedReceiptGroups((prev) => {
      const next = new Set(prev);
      if (next.has(receiptItemId)) {
        next.delete(receiptItemId);
      } else {
        next.add(receiptItemId);
      }
      return next;
    });
  };

  const toggleBatchGroupSelection = (group: BatchGroup) => {
    const groupUnitIds = group.units.map((u) => u.id);
    const allSelected = groupUnitIds.every((id) => selectedUnitIds.has(id));

    setSelectedUnitIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        groupUnitIds.forEach((id) => next.delete(id));
      } else {
        groupUnitIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleReceiptGroupSelection = (group: ReceiptItemGroup) => {
    const groupUnitIds = group.units.map((u) => u.id);
    const allSelected = groupUnitIds.every((id) => selectedUnitIds.has(id));

    setSelectedUnitIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        groupUnitIds.forEach((id) => next.delete(id));
      } else {
        groupUnitIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleUnitSelection = (unitId: string) => {
    setSelectedUnitIds((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
      }
      return next;
    });
  };

  const getBatchGroupSelectedCount = (group: BatchGroup) => {
    return group.units.filter((u) => selectedUnitIds.has(u.id)).length;
  };

  const getReceiptGroupSelectedCount = (group: ReceiptItemGroup) => {
    return group.units.filter((u) => selectedUnitIds.has(u.id)).length;
  };

  const handleNext = () => {
    if (selectedUnitIds.size === 0) return;

    const unitIds = Array.from(selectedUnitIds).join(',');
    router.push(`/dashboard/inventory/qr-codes/new/configure?product=${productId}&units=${unitIds}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading stock units...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Select stock units</h1>
          <p className="mt-1 text-sm text-gray-600">{productName}</p>
        </div>

        {/* Units with QR Codes - Grouped by Batch */}
        {batchGroups.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-medium text-gray-700">Already have QR codes</h2>
            <div className="space-y-3">
              {batchGroups.map((group) => {
                const isExpanded = expandedBatchGroups.has(group.batch_id);
                const selectedCount = getBatchGroupSelectedCount(group);
                const allSelected = selectedCount === group.units.length;

                return (
                  <div key={group.batch_id} className="rounded-lg bg-white shadow-sm">
                    {/* Group Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 p-4">
                      <button
                        onClick={() => toggleBatchGroupSelection(group)}
                        className="flex items-center gap-3"
                      >
                        <div
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 ${
                            allSelected
                              ? 'border-blue-600 bg-blue-600'
                              : selectedCount > 0
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {allSelected && <Check className="h-3 w-3 text-white" />}
                          {selectedCount > 0 && !allSelected && (
                            <div className="h-2 w-2 rounded-sm bg-white" />
                          )}
                        </div>

                        <div className="text-left">
                          <p className="font-medium text-gray-900">
                            {group.batch_name}
                            <span className="ml-2 text-sm font-normal text-gray-500">
                              ({selectedCount} selected)
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(group.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => toggleBatchGroup(group.batch_id)}
                        className="rounded-md p-1 hover:bg-gray-100"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>

                    {/* Group Units */}
                    {isExpanded && (
                      <div className="divide-y divide-gray-100">
                        {group.units.map((unit) => {
                          const isSelected = selectedUnitIds.has(unit.id);

                          return (
                            <button
                              key={unit.id}
                              onClick={() => toggleUnitSelection(unit.id)}
                              className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 ${
                                    isSelected
                                      ? 'border-blue-600 bg-blue-600'
                                      : 'border-gray-300 bg-white'
                                  }`}
                                >
                                  {isSelected && <Check className="h-3 w-3 text-white" />}
                                </div>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-mono text-sm font-medium text-gray-900">
                                      #{unit.unit_number}
                                    </p>
                                    <span className="flex items-center gap-1 text-xs text-green-600">
                                      <CheckCircle className="h-3 w-3" />
                                      Has QR
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <p className="text-sm text-gray-500">
                                  {new Date(unit.date_received).toLocaleDateString()}
                                </p>
                                <p className="font-semibold text-gray-900">
                                  {unit.size_quantity} m
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Units without QR Codes - Grouped by Receipt Item */}
        {receiptItemGroups.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-medium text-gray-700">Pending QR codes</h2>
            <div className="space-y-3">
              {receiptItemGroups.map((group) => {
                const isExpanded = expandedReceiptGroups.has(group.receipt_item_id);
                const selectedCount = getReceiptGroupSelectedCount(group);
                const allSelected = selectedCount === group.units.length;

                return (
                  <div key={group.receipt_item_id} className="rounded-lg bg-white shadow-sm">
                    {/* Group Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 p-4">
                      <button
                        onClick={() => toggleReceiptGroupSelection(group)}
                        className="flex items-center gap-3"
                      >
                        <div
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 ${
                            allSelected
                              ? 'border-blue-600 bg-blue-600'
                              : selectedCount > 0
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {allSelected && <Check className="h-3 w-3 text-white" />}
                          {selectedCount > 0 && !allSelected && (
                            <div className="h-2 w-2 rounded-sm bg-white" />
                          )}
                        </div>

                        <div className="text-left">
                          <p className="font-medium text-gray-900">
                            {group.receipt_number}
                            <span className="ml-2 text-sm font-normal text-gray-500">
                              ({selectedCount} selected)
                            </span>
                          </p>
                          {group.variant_combination && (
                            <p className="text-xs text-gray-500">
                              {formatVariantInfo(group.variant_combination)}
                            </p>
                          )}
                          <p className="text-xs text-gray-400">
                            {group.supplier_name} • {new Date(group.receipt_date).toLocaleDateString()}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => toggleReceiptGroup(group.receipt_item_id)}
                        className="rounded-md p-1 hover:bg-gray-100"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>

                    {/* Group Units */}
                    {isExpanded && (
                      <div className="divide-y divide-gray-100">
                        {group.units.map((unit) => {
                          const isSelected = selectedUnitIds.has(unit.id);

                          return (
                            <button
                              key={unit.id}
                              onClick={() => toggleUnitSelection(unit.id)}
                              className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 ${
                                    isSelected
                                      ? 'border-blue-600 bg-blue-600'
                                      : 'border-gray-300 bg-white'
                                  }`}
                                >
                                  {isSelected && <Check className="h-3 w-3 text-white" />}
                                </div>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-mono text-sm font-medium text-gray-900">
                                      #{unit.unit_number}
                                    </p>
                                    <span className="flex items-center gap-1 text-xs text-orange-600">
                                      <Clock className="h-3 w-3" />
                                      Pending
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <p className="text-sm text-gray-500">
                                  {new Date(unit.date_received).toLocaleDateString()}
                                </p>
                                <p className="font-semibold text-gray-900">
                                  {unit.size_quantity} m
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">
            {selectedUnitIds.size} unit{selectedUnitIds.size !== 1 ? 's' : ''} selected
          </p>
          <button
            onClick={handleNext}
            disabled={selectedUnitIds.size === 0}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
