'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import StockUnitSelector from '../components/StockUnitSelector';
import InventoryBrowserModal from '../components/InventoryBrowserModal';
import DispatchForm, { DispatchFormData } from '../components/DispatchForm';
import { SelectedStockUnitItem, StockUnitWithRelations } from '@/lib/types/inventory';
import { getStockUnits, getWarehouses, getPartners } from '@/app/actions/inventory/data';
import { createGoodsDispatch } from '@/app/actions/inventory/goods-dispatch';

interface Warehouse {
  id: string;
  name: string;
}

interface Partner {
  id: string;
  name: string;
  partner_type: string;
}

interface Agent {
  id: string;
  name: string;
}

export default function NewGoodsDispatchPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Data state
  const [availableUnits, setAvailableUnits] = useState<StockUnitWithRelations[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<SelectedStockUnitItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showInventoryBrowser, setShowInventoryBrowser] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [unitsData, warehousesData, partnersData] = await Promise.all([
        getStockUnits({ status: 'available' }), // Only fetch available units
        getWarehouses(),
        getPartners(),
      ]);

      setAvailableUnits(unitsData);
      setWarehouses(warehousesData);
      setPartners(partnersData);
      // TODO: Fetch agents from database
      setAgents([]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  const handleUnitsSelect = (unitIds: string[]) => {
    const newUnits = availableUnits.filter((unit) => unitIds.includes(unit.id));
    setSelectedUnits(newUnits);
  };

  const handleUnitRemove = (unitId: string) => {
    setSelectedUnits((prev) => prev.filter((unit) => unit.id !== unitId));
  };

  const handleNextStep = () => {
    if (selectedUnits.length === 0) {
      setError('Please select at least one stock unit');
      return;
    }
    setError(null);
    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleDispatchSubmit = async (formData: DispatchFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const dispatchData = {
        ...formData,
        stock_unit_ids: selectedUnits.map((unit) => unit.id),
      };

      const result = await createGoodsDispatch(dispatchData);

      if (result.success) {
        router.push(`/dashboard/inventory/goods-dispatch/${result.dispatchId}`);
      } else {
        setError(result.error || 'Failed to create goods dispatch');
      }
    } catch (error) {
      console.error('Error creating dispatch:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <h1 className="text-2xl font-bold text-gray-900">New Goods Dispatch</h1>
          <p className="mt-1 text-sm text-gray-600">
            {currentStep === 1
              ? 'Select stock units to dispatch'
              : 'Enter dispatch details'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Step 1: Stock Unit Selection */}
        {currentStep === 1 && (
          <>
            <StockUnitSelector
              selectedUnits={selectedUnits}
              onUnitRemove={handleUnitRemove}
              onSelectFromInventory={() => setShowInventoryBrowser(true)}
              onQRScan={() => {
                // TODO: Implement QR scanner
                alert('QR scanner coming soon!');
              }}
            />

            {/* Next Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleNextStep}
                disabled={selectedUnits.length === 0}
                className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next Step
              </button>
            </div>
          </>
        )}

        {/* Step 2: Dispatch Form */}
        {currentStep === 2 && (
          <>
            {/* Selected Units Summary */}
            <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedUnits.length} {selectedUnits.length === 1 ? 'unit' : 'units'}{' '}
                    selected
                  </p>
                  <p className="text-xs text-gray-500">
                    Total: {selectedUnits.reduce((sum, unit) => sum + (unit.size_quantity - unit.wastage), 0).toFixed(2)} mtr
                  </p>
                </div>
                <button
                  onClick={handlePrevStep}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Change selection
                </button>
              </div>
            </div>

            <DispatchForm
              warehouses={warehouses}
              partners={partners}
              agents={agents}
              salesOrders={[]} // TODO: Fetch from database
              jobWorks={[]} // TODO: Fetch from database
              onSubmit={handleDispatchSubmit}
              onCancel={handlePrevStep}
              isSubmitting={isSubmitting}
            />
          </>
        )}

        {/* Inventory Browser Modal */}
        <InventoryBrowserModal
          isOpen={showInventoryBrowser}
          onClose={() => setShowInventoryBrowser(false)}
          availableUnits={availableUnits}
          selectedUnitIds={selectedUnits.map((u) => u.id)}
          onUnitsSelect={handleUnitsSelect}
        />
      </div>
    </div>
  );
}
