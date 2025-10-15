'use client'

import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Ruler, AlertTriangle, Calendar, Award, MapPin, Package } from 'lucide-react';
import { SpecificationItem } from '@/lib/types/inventory';

interface SpecificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  specificationIndex?: number; // undefined for new, number for editing
  initialData?: SpecificationItem;
  onSave: (data: SpecificationItem) => void;
}

export default function ProductDetailsModal({
  isOpen,
  onClose,
  productName,
  specificationIndex,
  initialData,
  onSave,
}: SpecificationModalProps) {
  const [formData, setFormData] = useState<SpecificationItem>(
    initialData || {
      quantity: 1,
      size_quantity: 0,
      wastage: 0,
      quality_grade: '',
      location_description: '',
      manufacturing_date: new Date().toISOString().split('T')[0],
      notes: '',
    }
  );

  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be at least 1';
    }
    if (!formData.size_quantity || formData.size_quantity <= 0) {
      newErrors.size_quantity = 'Size is required';
    }
    if (!formData.quality_grade.trim()) {
      newErrors.quality_grade = 'Quality grade is required';
    }
    if (!formData.location_description.trim()) {
      newErrors.location_description = 'Location is required';
    }
    if (!formData.manufacturing_date) {
      newErrors.manufacturing_date = 'Manufacturing date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (field: keyof SpecificationItem, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {specificationIndex !== undefined ? 'Edit' : 'Add'} Specification
              </h2>
              <p className="text-sm text-gray-500">{productName}</p>
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

          {/* Form Content */}
          <div className="flex-1 space-y-6 px-6 py-6">
            {/* Quantity of Rolls - Editable */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Package className="h-4 w-4 text-gray-400" />
                Number of Rolls with This Specification
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity || ''}
                onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                className={`w-full rounded-md border ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="1"
              />
              {errors.quantity && (
                <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                All {formData.quantity || 0} roll{formData.quantity !== 1 ? 's' : ''} will have identical specifications below
              </p>
            </div>

            {/* Size & Wastage Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Size */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Ruler className="h-4 w-4 text-gray-400" />
                  Size
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.size_quantity || ''}
                    onChange={(e) => handleChange('size_quantity', parseFloat(e.target.value) || 0)}
                    className={`w-full rounded-md border ${
                      errors.size_quantity ? 'border-red-500' : 'border-gray-300'
                    } py-2 pl-3 pr-12 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    mtr
                  </span>
                </div>
                {errors.size_quantity && (
                  <p className="mt-1 text-xs text-red-600">{errors.size_quantity}</p>
                )}
              </div>

              {/* Wastage */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <AlertTriangle className="h-4 w-4 text-gray-400" />
                  Wastage
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.wastage || ''}
                    onChange={(e) => handleChange('wastage', parseFloat(e.target.value) || 0)}
                    className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-12 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    mtr
                  </span>
                </div>
              </div>
            </div>

            {/* Made on */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4 text-gray-400" />
                Made on
              </label>
              <input
                type="date"
                value={formData.manufacturing_date}
                onChange={(e) => handleChange('manufacturing_date', e.target.value)}
                className={`w-full rounded-md border ${
                  errors.manufacturing_date ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
              {errors.manufacturing_date && (
                <p className="mt-1 text-xs text-red-600">{errors.manufacturing_date}</p>
              )}
            </div>

            {/* Quality */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Award className="h-4 w-4 text-gray-400" />
                Quality
              </label>
              <input
                type="text"
                value={formData.quality_grade}
                onChange={(e) => handleChange('quality_grade', e.target.value)}
                className={`w-full rounded-md border ${
                  errors.quality_grade ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="A, B, C, Premium, etc."
              />
              {errors.quality_grade && (
                <p className="mt-1 text-xs text-red-600">{errors.quality_grade}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4 text-gray-400" />
                Location
              </label>
              <input
                type="text"
                value={formData.location_description}
                onChange={(e) => handleChange('location_description', e.target.value)}
                className={`w-full rounded-md border ${
                  errors.location_description ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="Rack A1, Bin 12, etc."
              />
              {errors.location_description && (
                <p className="mt-1 text-xs text-red-600">{errors.location_description}</p>
              )}
            </div>

            {/* Additional Details (Collapsible) */}
            <div className="border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
                className="flex w-full items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <span>Additional Details</span>
                {showAdditionalDetails ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showAdditionalDetails && (
                <div className="mt-4">
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={4}
                    placeholder="Enter defect note, processing history, etc..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
