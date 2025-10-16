'use client'

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { X, Search, Check } from 'lucide-react';
import { StockUnitWithRelations } from '@/lib/types/inventory';

interface InventoryBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableUnits: StockUnitWithRelations[];
  selectedUnitIds: string[];
  onUnitsSelect: (unitIds: string[]) => void;
}

export default function InventoryBrowserModal({
  isOpen,
  onClose,
  availableUnits,
  selectedUnitIds,
  onUnitsSelect,
}: InventoryBrowserModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [localSelectedIds, setLocalSelectedIds] = useState<Set<string>>(
    new Set(selectedUnitIds)
  );

  // Get unique products for filter
  const products = useMemo(() => {
    const unique = new Map();
    availableUnits.forEach((unit) => {
      if (!unique.has(unit.product_id)) {
        unique.set(unit.product_id, unit.products);
      }
    });
    return Array.from(unique.values());
  }, [availableUnits]);

  // Filter units
  const filteredUnits = useMemo(() => {
    return availableUnits.filter((unit) => {
      const matchesSearch =
        searchTerm === '' ||
        unit.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.qr_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.products.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProduct = productFilter === '' || unit.product_id === productFilter;

      return matchesSearch && matchesProduct;
    });
  }, [availableUnits, searchTerm, productFilter]);

  const handleToggleUnit = (unitId: string) => {
    setLocalSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const allIds = filteredUnits.map((u) => u.id);
    setLocalSelectedIds(new Set(allIds));
  };

  const handleClearAll = () => {
    setLocalSelectedIds(new Set());
  };

  const handleConfirm = () => {
    onUnitsSelect(Array.from(localSelectedIds));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Select from Inventory</h2>
              <p className="mt-1 text-sm text-gray-500">
                {localSelectedIds.size} of {availableUnits.length} units selected
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Filters */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by unit number, QR code, or product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Product Filter */}
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Products</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Select All / Clear */}
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Select all ({filteredUnits.length})
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-sm font-medium text-gray-600 hover:text-gray-700"
              >
                Clear selection
              </button>
            </div>
          </div>

          {/* Units List */}
          <div className="max-h-[50vh] overflow-y-auto px-6 py-4">
            {filteredUnits.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                No stock units found matching your filters
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUnits.map((unit) => {
                  const isSelected = localSelectedIds.has(unit.id);
                  return (
                    <div
                      key={unit.id}
                      onClick={() => handleToggleUnit(unit.id)}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Checkbox */}
                        <div
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>

                        {/* Product Image */}
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                          {unit.products.product_images?.[0] ? (
                            <Image
                              src={unit.products.product_images[0]}
                              alt={unit.products.name}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-400">
                              {unit.products.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Unit Info */}
                        <div>
                          <h4 className="font-medium text-gray-900">{unit.products.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="font-mono">#{unit.unit_number}</span>
                            <span>•</span>
                            <span>{unit.warehouses.name}</span>
                            <span>•</span>
                            <span>{unit.quality_grade}</span>
                          </div>
                        </div>
                      </div>

                      {/* Size */}
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {unit.size_quantity - unit.wastage} mtr
                        </p>
                        <p className="text-xs text-gray-500">
                          {unit.location_description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={localSelectedIds.size === 0}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add {localSelectedIds.size} {localSelectedIds.size === 1 ? 'Unit' : 'Units'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
