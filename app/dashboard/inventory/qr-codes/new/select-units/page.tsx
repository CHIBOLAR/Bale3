'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, ChevronDown, ChevronUp, Clock, CheckCircle } from 'lucide-react';
import { StockUnitWithRelations } from '@/lib/types/inventory';
import { getStockUnitsForQRGeneration, getStockUnitsQRStatus } from '@/app/actions/inventory/barcode';

interface GroupedUnits {
  receipt_number: string;
  receipt_date: string;
  units: StockUnitWithRelations[];
}

export default function SelectUnitsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('product');

  const [productName, setProductName] = useState('');
  const [groupedUnits, setGroupedUnits] = useState<GroupedUnits[]>([]);
  const [selectedUnitIds, setSelectedUnitIds] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [qrStatusMap, setQrStatusMap] = useState<Map<string, boolean>>(new Map());
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
        // Group by receipt number
        const grouped = groupByReceipt(data);
        setGroupedUnits(grouped);

        // Fetch QR status for all units
        const unitIds = data.map(u => u.id);
        const statusMap = await getStockUnitsQRStatus(unitIds);
        setQrStatusMap(statusMap);

        // Auto-expand first group
        if (grouped.length > 0) {
          setExpandedGroups(new Set([grouped[0].receipt_number]));
        }
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    } finally {
      setLoading(false);
    }
  }

  function groupByReceipt(units: StockUnitWithRelations[]): GroupedUnits[] {
    const groups = new Map<string, GroupedUnits>();

    units.forEach((unit) => {
      // For now, use unit_number prefix as receipt group (e.g., GRN-120)
      // In production, you'd have actual receipt_id and fetch receipt details
      const receiptNumber = unit.unit_number.split('-').slice(0, 2).join('-');

      if (!groups.has(receiptNumber)) {
        groups.set(receiptNumber, {
          receipt_number: receiptNumber,
          receipt_date: unit.date_received,
          units: [],
        });
      }
      groups.get(receiptNumber)!.units.push(unit);
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

  const toggleGroupSelection = (group: GroupedUnits) => {
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

  const hasQRCode = (unit: StockUnitWithRelations) => {
    return qrStatusMap.get(unit.id) || false;
  };

  const getGroupSelectedCount = (group: GroupedUnits) => {
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

        {/* Grouped Units List */}
        <div className="space-y-3">
          {groupedUnits.map((group) => {
            const isExpanded = expandedGroups.has(group.receipt_number);
            const selectedCount = getGroupSelectedCount(group);
            const allSelected = selectedCount === group.units.length;

            return (
              <div key={group.receipt_number} className="rounded-lg bg-white shadow-sm">
                {/* Group Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-4">
                  <button
                    onClick={() => toggleGroupSelection(group)}
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
                    </div>
                  </button>

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

                {/* Group Units */}
                {isExpanded && (
                  <div className="divide-y divide-gray-100">
                    {group.units.map((unit) => {
                      const isSelected = selectedUnitIds.has(unit.id);
                      const unitHasQR = hasQRCode(unit);

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
                                {unitHasQR ? (
                                  <span className="flex items-center gap-1 text-xs text-green-600">
                                    <CheckCircle className="h-3 w-3" />
                                    QR code generated
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-xs text-orange-600">
                                    <Clock className="h-3 w-3" />
                                    QR code pending
                                  </span>
                                )}
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
