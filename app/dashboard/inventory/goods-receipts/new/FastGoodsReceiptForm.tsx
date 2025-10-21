'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Trash2, Save, Package } from 'lucide-react';
import { createGoodsReceipt } from '@/app/actions/inventory/goods-receipts';

interface Warehouse {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  product_number: string;
  material: string;
  color: string;
}

interface Partner {
  id: string;
  company_name: string;
  partner_type: string;
}

interface BatchRow {
  id: string;
  product_id: string;
  num_rolls: number;
  length_per_roll: number;
  wastage: number;
  quality_grade: string;
  location: string;
  notes: string;
}

interface FastGoodsReceiptFormProps {
  warehouses: Warehouse[];
  products: Product[];
  partners: Partner[];
}

export default function FastGoodsReceiptForm({
  warehouses,
  products,
  partners,
}: FastGoodsReceiptFormProps) {
  const router = useRouter();

  // Receipt header
  const [warehouseId, setWarehouseId] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [linkType, setLinkType] = useState<'purchase' | 'transfer' | 'job_work_return' | 'sales_return' | 'production'>('purchase');
  const [sourcePartnerId, setSourcePartnerId] = useState('');
  const [sourceWarehouseId, setSourceWarehouseId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [notes, setNotes] = useState('');

  // Batches
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [nextBatchId, setNextBatchId] = useState(1);

  // UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addBatch = () => {
    setBatches([
      ...batches,
      {
        id: `batch-${nextBatchId}`,
        product_id: '',
        num_rolls: 1,
        length_per_roll: 0,
        wastage: 0,
        quality_grade: '',
        location: '',
        notes: '',
      },
    ]);
    setNextBatchId(nextBatchId + 1);
  };

  const removeBatch = (id: string) => {
    setBatches(batches.filter((b) => b.id !== id));
  };

  const updateBatch = (id: string, field: keyof BatchRow, value: any) => {
    setBatches(
      batches.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!warehouseId) {
      setError('Please select a warehouse');
      return;
    }

    if (batches.length === 0) {
      setError('Please add at least one batch');
      return;
    }

    for (const batch of batches) {
      if (!batch.product_id) {
        setError('All batches must have a product selected');
        return;
      }
      if (batch.num_rolls <= 0) {
        setError('Number of rolls must be greater than 0');
        return;
      }
      if (batch.length_per_roll <= 0) {
        setError('Length per roll must be greater than 0');
        return;
      }
    }

    if (linkType === 'purchase' || linkType === 'job_work_return' || linkType === 'sales_return') {
      if (!sourcePartnerId) {
        setError('Please select a source partner');
        return;
      }
    } else if (linkType === 'transfer') {
      if (!sourceWarehouseId) {
        setError('Please select a source warehouse');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Transform batches to API format
      const items = batches.map((batch) => ({
        product_id: batch.product_id,
        quantity_received: batch.num_rolls,
        notes: batch.notes || undefined,
        stock_unit_details: Array.from({ length: batch.num_rolls }, () => ({
          size_quantity: batch.length_per_roll,
          wastage: batch.wastage,
          quality_grade: batch.quality_grade || 'Standard',
          location_description: batch.location || 'Warehouse',
          status: 'available' as const,
          manufacturing_date: receiptDate,
          notes: batch.notes || undefined,
        })),
      }));

      const result = await createGoodsReceipt({
        warehouse_id: warehouseId,
        receipt_date: receiptDate,
        link_type: linkType,
        issued_by_partner_id: sourcePartnerId || undefined,
        issued_by_warehouse_id: sourceWarehouseId || undefined,
        invoice_number: invoiceNumber || undefined,
        invoice_amount: invoiceAmount ? parseFloat(invoiceAmount) : undefined,
        notes: notes || undefined,
        items,
      });

      if (result.success) {
        router.push(`/dashboard/inventory/goods-receipts`);
      } else {
        setError(result.error || 'Failed to create goods receipt');
      }
    } catch (err) {
      console.error('Error creating receipt:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalRolls = () => batches.reduce((sum, b) => sum + b.num_rolls, 0);
  const getTotalLength = () =>
    batches.reduce((sum, b) => sum + b.num_rolls * b.length_per_roll, 0);
  const getTotalWastage = () => batches.reduce((sum, b) => sum + b.num_rolls * b.wastage, 0);

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Receipt Details Card */}
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <h2 className="mb-3 text-base font-semibold text-gray-900">Receipt Details</h2>

          <div className="space-y-3">
            {/* Warehouse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warehouse <span className="text-red-500">*</span>
              </label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Type Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={linkType}
                  onChange={(e) => {
                    setLinkType(e.target.value as any);
                    setSourcePartnerId('');
                    setSourceWarehouseId('');
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="purchase">Purchase</option>
                  <option value="transfer">Transfer</option>
                  <option value="job_work_return">Job Work Return</option>
                  <option value="sales_return">Sales Return</option>
                  <option value="production">Production</option>
                </select>
              </div>
            </div>

            {/* Source Partner or Warehouse */}
            {(linkType === 'purchase' || linkType === 'job_work_return' || linkType === 'sales_return') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Partner <span className="text-red-500">*</span>
                </label>
                <select
                  value={sourcePartnerId}
                  onChange={(e) => setSourcePartnerId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select partner</option>
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.company_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {linkType === 'transfer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Warehouse <span className="text-red-500">*</span>
                </label>
                <select
                  value={sourceWarehouseId}
                  onChange={(e) => setSourceWarehouseId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Invoice Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice #</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Optional notes..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Batches Section */}
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Products & Batches</h2>
            <button
              type="button"
              onClick={addBatch}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 active:scale-95 transition-transform"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>

          {batches.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">No batches added</p>
              <p className="text-xs text-gray-400 mt-1">Click "Add" to start</p>
            </div>
          ) : (
            <div className="space-y-3">
              {batches.map((batch, index) => (
                <div
                  key={batch.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700">Batch {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeBatch(batch.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {/* Product */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Product <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={batch.product_id}
                        onChange={(e) => updateBatch(batch.id, 'product_id', e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.material} - {p.color})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Rolls and Length Row */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Rolls <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={batch.num_rolls}
                          onChange={(e) =>
                            updateBatch(batch.id, 'num_rolls', parseInt(e.target.value) || 1)
                          }
                          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Length (m) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={batch.length_per_roll}
                          onChange={(e) =>
                            updateBatch(batch.id, 'length_per_roll', parseFloat(e.target.value) || 0)
                          }
                          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Wastage and Quality Row */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Wastage (m)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={batch.wastage}
                          onChange={(e) =>
                            updateBatch(batch.id, 'wastage', parseFloat(e.target.value) || 0)
                          }
                          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Quality</label>
                        <input
                          type="text"
                          value={batch.quality_grade}
                          onChange={(e) => updateBatch(batch.id, 'quality_grade', e.target.value)}
                          placeholder="A, B, C..."
                          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Location and Notes */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          value={batch.location}
                          onChange={(e) => updateBatch(batch.id, 'location', e.target.value)}
                          placeholder="Optional"
                          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                        <input
                          type="text"
                          value={batch.notes}
                          onChange={(e) => updateBatch(batch.id, 'notes', e.target.value)}
                          placeholder="Optional"
                          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Batch Summary */}
                    <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between text-xs text-gray-600">
                      <span>
                        Total: <strong className="text-gray-900">{batch.num_rolls * batch.length_per_roll} m</strong>
                      </span>
                      <span>
                        Usable: <strong className="text-green-700">{batch.num_rolls * (batch.length_per_roll - batch.wastage)} m</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Overall Summary */}
              <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-3">
                <h3 className="mb-2 text-xs font-semibold text-blue-900">Receipt Summary</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-blue-700">Rolls</p>
                    <p className="text-lg font-bold text-blue-900">{getTotalRolls()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700">Length</p>
                    <p className="text-lg font-bold text-blue-900">{getTotalLength().toFixed(1)} m</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700">Wastage</p>
                    <p className="text-lg font-bold text-blue-900">{getTotalWastage().toFixed(1)} m</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || batches.length === 0}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-lg bg-brand-orange px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-98 transition-all"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Creating...' : 'Create Receipt'}
          </button>
        </div>
      </form>
    </div>
  );
}
