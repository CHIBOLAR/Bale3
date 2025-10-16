'use client'

import { useState } from 'react';
import Image from 'next/image';
import { QrCode, X, Package } from 'lucide-react';
import { SelectedStockUnitItem } from '@/lib/types/inventory';

interface StockUnitSelectorProps {
  selectedUnits: SelectedStockUnitItem[];
  onUnitRemove: (unitId: string) => void;
  onQuantityChange: (unitId: string, quantity: number) => void;
  onSelectFromInventory: () => void;
  onQRScan?: () => void;
}

export default function StockUnitSelector({
  selectedUnits,
  onUnitRemove,
  onQuantityChange,
  onSelectFromInventory,
  onQRScan,
}: StockUnitSelectorProps) {
  return (
    <div className="space-y-4">
      {/* QR Scanner Section */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="text-center">
          <h3 className="mb-4 text-sm font-medium text-gray-900">Scan QR to add item</h3>

          {/* QR Scanner Placeholder */}
          <div className="relative mx-auto mb-4 aspect-video max-w-sm overflow-hidden rounded-lg bg-gray-900">
            {/* Camera placeholder image */}
            <div className="flex h-full items-center justify-center">
              <QrCode className="h-16 w-16 text-gray-600" />
            </div>
            {/* Scanning frame overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 rounded-lg border-4 border-white opacity-50" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onQRScan}
              className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              <QrCode className="h-4 w-4" />
              Scan QR
            </button>
            <button
              type="button"
              onClick={onSelectFromInventory}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Select from inventory
            </button>
          </div>
        </div>
      </div>

      {/* Selected Units List */}
      {selectedUnits.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">
            Selected Units ({selectedUnits.length})
          </h3>
          {selectedUnits.map((unit) => (
            <div
              key={unit.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
            >
              <div className="flex items-center gap-3">
                {/* Product Image */}
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                  {unit.products.product_images?.[0] ? (
                    <Image
                      src={unit.products.product_images[0]}
                      alt={unit.products.name}
                      width={48}
                      height={48}
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
                  <p className="font-mono text-xs text-gray-500">#{unit.unit_number}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Quantity Details */}
                <div className="flex flex-col gap-1.5">
                  {/* Available Quantity (Informational) */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500">Available:</span>
                    <span className="font-medium text-gray-700">
                      {(unit.size_quantity - unit.wastage).toFixed(2)} mtr
                    </span>
                  </div>

                  {/* Wastage (Informational - Internal Only) */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400">Wastage (internal):</span>
                    <span className="font-mono text-gray-400">{unit.wastage.toFixed(2)} mtr</span>
                  </div>

                  {/* Dispatched Quantity (Editable) */}
                  <div className="flex items-center gap-2">
                    <label htmlFor={`qty-${unit.id}`} className="text-xs font-medium text-gray-700">
                      Dispatch:
                    </label>
                    <input
                      id={`qty-${unit.id}`}
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={unit.size_quantity - unit.wastage}
                      value={unit.dispatched_quantity}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        const availableQty = unit.size_quantity - unit.wastage;
                        if (value > 0 && value <= availableQty) {
                          onQuantityChange(unit.id, value);
                        } else if (value > availableQty) {
                          onQuantityChange(unit.id, availableQty);
                        }
                      }}
                      className="w-24 rounded border border-gray-300 px-2 py-1 text-sm font-semibold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-500">mtr</span>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => onUnitRemove(unit.id)}
                  className="rounded-md p-1 hover:bg-gray-100"
                  aria-label="Remove unit"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No units selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Scan a QR code or select units from inventory to begin
          </p>
        </div>
      )}
    </div>
  );
}
