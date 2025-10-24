'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import StockUnitSelector from '../components/StockUnitSelector';
import InventoryBrowserModal from '../components/InventoryBrowserModal';
import QRScannerModal from '../components/QRScannerModal';
import DispatchForm, { DispatchFormData } from '../components/DispatchForm';
import { SelectedStockUnitItem, StockUnitWithRelations } from '@/lib/types/inventory';
import { getStockUnits, getWarehouses, getPartners, getPendingSalesOrders, getPendingJobWorks } from '@/app/actions/inventory/data';
import { createGoodsDispatch, getGoodsDispatches } from '@/app/actions/inventory/goods-dispatch';

interface Warehouse {
  id: string;
  name: string;
}

interface Partner {
  id: string;
  company_name: string;
  partner_type: string;
}

interface Agent {
  id: string;
  name: string;
}

interface SalesOrder {
  id: string;
  order_number: string;
  customer?: {
    company_name: string;
  };
}

interface JobWork {
  id: string;
  job_number: string;
  partner?: {
    company_name: string;
  } | null;
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
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [jobWorks, setJobWorks] = useState<JobWork[]>([]);
  const [recentDispatches, setRecentDispatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showInventoryBrowser, setShowInventoryBrowser] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [unitsData, warehousesData, partnersData, salesOrdersData, jobWorksData, recentDispatchesData] = await Promise.all([
        getStockUnits({ status: 'available' }), // Only fetch available units
        getWarehouses(),
        getPartners(),
        getPendingSalesOrders(),
        getPendingJobWorks(),
        getGoodsDispatches({}), // Fetch all recent dispatches
      ]);

      setAvailableUnits(unitsData.data);
      setWarehouses(warehousesData);
      setPartners(partnersData);
      setSalesOrders(salesOrdersData);
      setJobWorks(jobWorksData);
      setRecentDispatches((recentDispatchesData || []).slice(0, 5)); // Keep only 5 most recent
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
    const newUnits = availableUnits
      .filter((unit) => unitIds.includes(unit.id))
      .map((unit) => ({
        ...unit,
        // Default dispatched_quantity to available quantity (size - wastage)
        dispatched_quantity: unit.size_quantity - unit.wastage,
      }));
    setSelectedUnits(newUnits);
  };

  const handleQuantityChange = (unitId: string, quantity: number) => {
    setSelectedUnits((prev) =>
      prev.map((unit) =>
        unit.id === unitId ? { ...unit, dispatched_quantity: quantity } : unit
      )
    );
  };

  const handleUnitRemove = (unitId: string) => {
    setSelectedUnits((prev) => prev.filter((unit) => unit.id !== unitId));
  };

  const handleQRScan = (scannedData: string) => {
    console.log('Parent: handleQRScan called with:', scannedData);
    console.log('Parent: Available units:', availableUnits.length);

    // Parse QR code format: QR-{uuid}-{unit_number}
    // Example: QR-1ea3bca1-fc04-46ac-8d0e-0c246fa608e9-UNIT-000007
    let unitNumber = scannedData;
    let unitId = scannedData;

    // Check if it's a formatted QR code
    if (scannedData.startsWith('QR-')) {
      // Extract unit number after the UUID
      const parts = scannedData.split('-');
      console.log('Parent: QR code parts:', parts);

      if (parts.length >= 7) {
        // Format: QR-{uuid-part1}-{uuid-part2}-{uuid-part3}-{uuid-part4}-{uuid-part5}-UNIT-{number}
        // Join last parts after UUID to get UNIT-000007
        unitNumber = parts.slice(6).join('-');
        console.log('Parent: Extracted unit number from QR:', unitNumber);
      }
      // Also extract the UUID part (might be the ID)
      if (parts.length >= 6) {
        unitId = parts.slice(1, 6).join('-');
        console.log('Parent: Extracted UUID from QR:', unitId);
      }
    }

    console.log('Parent: Looking for match with:', {
      original: scannedData,
      parsedUnitNumber: unitNumber,
      parsedUnitId: unitId
    });

    // Log first 3 units to see what data structure looks like
    console.log('Parent: Sample units from database:', availableUnits.slice(0, 3).map(u => ({
      id: u.id,
      unit_number: u.unit_number,
      product_number: u.products?.product_number
    })));

    // Find the stock unit by unit_number, id, or product_number
    const unit = availableUnits.find(u => {
      // Check each condition individually for debugging
      const exactMatch = u.unit_number === scannedData;
      const unitNumberMatch = u.unit_number === unitNumber;
      const idMatch = u.id === scannedData;
      const uuidMatch = u.id === unitId;
      const productMatch = u.products?.product_number === scannedData;

      const matches = exactMatch || unitNumberMatch || idMatch || uuidMatch || productMatch;

      // Log every unit we're checking to find why it's not matching
      if (u.unit_number?.includes('000011') || u.id === unitId) {
        console.log(`Parent: Checking unit ${u.unit_number}:`, {
          unit_id: u.id,
          unit_number: u.unit_number,
          product_number: u.products?.product_number,
          checks: {
            exactMatch: `"${u.unit_number}" === "${scannedData}" = ${exactMatch}`,
            unitNumberMatch: `"${u.unit_number}" === "${unitNumber}" = ${unitNumberMatch}`,
            idMatch: `"${u.id}" === "${scannedData}" = ${idMatch}`,
            uuidMatch: `"${u.id}" === "${unitId}" = ${uuidMatch}`,
            productMatch: `"${u.products?.product_number}" === "${scannedData}" = ${productMatch}`,
          }
        });
      }

      if (matches) {
        console.log(`Parent: ✓ Match found! Unit: ${u.unit_number}, ID: ${u.id}`);
      }
      return matches;
    });

    if (unit) {
      console.log('Parent: Unit found!', unit.unit_number);

      // Use functional state update to check against the latest state
      setSelectedUnits((prev) => {
        // Check if already selected using the latest state
        const alreadySelected = prev.some(u => u.id === unit.id);

        if (alreadySelected) {
          console.log('Parent: Unit already selected, skipping');
          setError(`Unit ${unit.unit_number} is already selected`);
          setTimeout(() => setError(null), 3000);
          return prev; // Return unchanged state
        }

        console.log('Parent: Adding unit to selectedUnits');
        const newUnit = {
          ...unit,
          dispatched_quantity: unit.size_quantity - unit.wastage,
        };
        setError(null);
        return [...prev, newUnit]; // Add new unit
      });
    } else {
      console.log('Parent: Unit NOT found for scanned data:', scannedData);
      console.log('Parent: Tried matching:', {
        original: scannedData,
        parsedUnitNumber: unitNumber,
        parsedUnitId: unitId
      });
      setError(`Stock unit not found for: ${scannedData}`);
      setTimeout(() => setError(null), 3000);
    }
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
        // Convert invoice_amount from string to number
        invoice_amount: formData.invoice_amount ? parseFloat(formData.invoice_amount) : undefined,
        stock_unit_ids: selectedUnits.map((unit) => unit.id),
        // Pass dispatched quantities for each unit
        dispatched_quantities: selectedUnits.map((unit) => ({
          stock_unit_id: unit.id,
          dispatched_quantity: unit.dispatched_quantity,
        })),
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
      <div className="mx-auto max-w-7xl">
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2">
            {/* Step 1: Stock Unit Selection */}
            {currentStep === 1 && (
              <>
                <StockUnitSelector
                  selectedUnits={selectedUnits}
                  onUnitRemove={handleUnitRemove}
                  onQuantityChange={handleQuantityChange}
                  onSelectFromInventory={() => setShowInventoryBrowser(true)}
                  onQRScan={() => setShowQRScanner(true)}
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
                        Total to dispatch: {selectedUnits.reduce((sum, unit) => sum + unit.dispatched_quantity, 0).toFixed(2)} mtr
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
                  salesOrders={salesOrders}
                  jobWorks={jobWorks}
                  onSubmit={handleDispatchSubmit}
                  onCancel={handlePrevStep}
                  isSubmitting={isSubmitting}
                />
              </>
            )}
          </div>

          {/* Recent Dispatches Sidebar - 1 column */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Dispatches</h2>

              {recentDispatches.length === 0 ? (
                <p className="text-sm text-gray-500">No recent dispatches found</p>
              ) : (
                <div className="space-y-3">
                  {recentDispatches.map((dispatch: any) => {
                    const totalQty = dispatch.items?.reduce(
                      (sum: number, item: any) => sum + (item.dispatched_quantity || 0),
                      0
                    ) || 0;

                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case 'pending':
                          return 'bg-yellow-100 text-yellow-800';
                        case 'in_transit':
                          return 'bg-blue-100 text-blue-800';
                        case 'delivered':
                          return 'bg-green-100 text-green-800';
                        case 'cancelled':
                          return 'bg-gray-100 text-gray-800';
                        default:
                          return 'bg-gray-100 text-gray-800';
                      }
                    };

                    return (
                      <a
                        key={dispatch.id}
                        href={`/dashboard/inventory/goods-dispatch/${dispatch.id}`}
                        className="block rounded-lg border border-gray-200 p-3 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span className="font-mono text-sm font-medium text-gray-900">
                            {dispatch.dispatch_number}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(dispatch.dispatch_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          <div className="mb-1">
                            <span className="font-medium">
                              {dispatch.link_type === 'sales_order' && 'Sales Order'}
                              {dispatch.link_type === 'job_work' && 'Job Work'}
                              {dispatch.link_type === 'purchase_return' && 'Purchase Return'}
                              {dispatch.link_type === 'other' && 'Other'}
                            </span>
                            {dispatch.dispatch_to_partner?.company_name && (
                              <span className="text-gray-500"> to {dispatch.dispatch_to_partner.company_name}</span>
                            )}
                            {dispatch.dispatch_to_warehouse?.name && (
                              <span className="text-gray-500"> to {dispatch.dispatch_to_warehouse.name}</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(dispatch.status)}`}>
                              {dispatch.status.replace('_', ' ')}
                            </span>
                            <span className="font-medium text-gray-900">{totalQty.toFixed(2)} mtr</span>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}

              <a
                href="/dashboard/inventory/goods-dispatch"
                className="mt-4 block text-center text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all dispatches →
              </a>
            </div>
          </div>
        </div>

        {/* Inventory Browser Modal */}
        <InventoryBrowserModal
          isOpen={showInventoryBrowser}
          onClose={() => setShowInventoryBrowser(false)}
          availableUnits={availableUnits}
          selectedUnitIds={selectedUnits.map((u) => u.id)}
          onUnitsSelect={handleUnitsSelect}
        />

        {/* QR Scanner Modal */}
        <QRScannerModal
          isOpen={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          onScan={handleQRScan}
          availableUnits={availableUnits}
          scannedCount={selectedUnits.length}
        />
      </div>
    </div>
  );
}
