'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createJobWork } from './actions'
import SuccessDialog from '@/components/SuccessDialog'
import Link from 'next/link'
import { Plus, X } from 'lucide-react'

interface Partner {
  id: string
  partner_name: string
  partner_type: string
}

interface Warehouse {
  id: string
  warehouse_name: string
}

interface Product {
  id: string
  name: string
  measuring_unit: string
}

interface SalesOrder {
  id: string
  order_number: string
}

interface RawMaterial {
  product_id: string
  required_quantity: number
  unit: string
}

interface ExpectedReturn {
  product_id: string
  expected_quantity: number
  unit: string
}

interface JobWorkFormProps {
  partners: Partner[]
  warehouses: Warehouse[]
  products: Product[]
  salesOrders: SalesOrder[]
}

export default function JobWorkForm({ partners, warehouses, products, salesOrders }: JobWorkFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([
    { product_id: '', required_quantity: 0, unit: '' }
  ])
  const [expectedReturns, setExpectedReturns] = useState<ExpectedReturn[]>([
    { product_id: '', expected_quantity: 0, unit: '' }
  ])

  const addRawMaterial = () => {
    setRawMaterials([...rawMaterials, { product_id: '', required_quantity: 0, unit: '' }])
  }

  const removeRawMaterial = (index: number) => {
    setRawMaterials(rawMaterials.filter((_, i) => i !== index))
  }

  const updateRawMaterial = (index: number, field: keyof RawMaterial, value: any) => {
    const updated = [...rawMaterials]
    updated[index] = { ...updated[index], [field]: value }
    setRawMaterials(updated)
  }

  const addExpectedReturn = () => {
    setExpectedReturns([...expectedReturns, { product_id: '', expected_quantity: 0, unit: '' }])
  }

  const removeExpectedReturn = (index: number) => {
    setExpectedReturns(expectedReturns.filter((_, i) => i !== index))
  }

  const updateExpectedReturn = (index: number, field: keyof ExpectedReturn, value: any) => {
    const updated = [...expectedReturns]
    updated[index] = { ...updated[index], [field]: value }
    setExpectedReturns(updated)
  }

  const handleProductChange = (index: number, productId: string, isMaterial: boolean) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    if (isMaterial) {
      updateRawMaterial(index, 'product_id', productId)
      updateRawMaterial(index, 'unit', product.measuring_unit || '')
    } else {
      updateExpectedReturn(index, 'product_id', productId)
      updateExpectedReturn(index, 'unit', product.measuring_unit || '')
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)

    // Validate raw materials
    const validRawMaterials = rawMaterials.filter(
      m => m.product_id && m.required_quantity > 0
    )

    // Validate expected returns
    const validExpectedReturns = expectedReturns.filter(
      r => r.product_id && r.expected_quantity > 0
    )

    if (validRawMaterials.length === 0) {
      setError('Please add at least one raw material')
      setLoading(false)
      return
    }

    if (validExpectedReturns.length === 0) {
      setError('Please add at least one expected return item')
      setLoading(false)
      return
    }

    const result = await createJobWork({
      partner_id: formData.get('partner_id') as string,
      warehouse_id: formData.get('warehouse_id') as string,
      sales_order_id: formData.get('sales_order_id') as string || null,
      job_description: formData.get('job_description') as string || undefined,
      expected_delivery_date: formData.get('expected_delivery_date') as string || null,
      raw_materials: validRawMaterials,
      expected_returns: validExpectedReturns,
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setShowSuccessDialog(true)
    }
  }

  const handleSuccessClose = () => {
    setShowSuccessDialog(false)
    router.push('/dashboard/job-works')
  }

  return (
    <div>
      {/* Success Dialog */}
      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={handleSuccessClose}
        title="Job Work Created!"
        message="Your job work order has been created successfully."
      />

      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100">
        <div className="p-4 sm:p-6 md:p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 text-sm leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Basic Information
              </h3>

              {/* Partner Selection */}
              <div>
                <label htmlFor="partner_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Partner <span className="text-red-500">*</span>
                </label>
                <select
                  id="partner_id"
                  name="partner_id"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                >
                  <option value="">Select job worker</option>
                  {partners.map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.partner_name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select the partner who will process this job work
                </p>
              </div>

              {/* Warehouse Selection */}
              <div>
                <label htmlFor="warehouse_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Warehouse <span className="text-red-500">*</span>
                </label>
                <select
                  id="warehouse_id"
                  name="warehouse_id"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                >
                  <option value="">Select warehouse</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.warehouse_name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Warehouse from which materials will be dispatched
                </p>
              </div>

              {/* Sales Order (Optional) */}
              <div>
                <label htmlFor="sales_order_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Linked Sales Order
                </label>
                <select
                  id="sales_order_id"
                  name="sales_order_id"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                >
                  <option value="">None (Optional)</option>
                  {salesOrders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.order_number}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Link to a sales order if this job work is for a specific order
                </p>
              </div>

              {/* Job Description */}
              <div>
                <label htmlFor="job_description" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  id="job_description"
                  name="job_description"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue resize-none"
                  placeholder="Describe the work to be done..."
                />
              </div>

              {/* Expected Delivery Date */}
              <div>
                <label htmlFor="expected_delivery_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  id="expected_delivery_date"
                  name="expected_delivery_date"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                />
              </div>
            </div>

            {/* Raw Materials Section */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Raw Materials <span className="text-red-500">*</span>
                </h3>
                <button
                  type="button"
                  onClick={addRawMaterial}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-brand-blue text-white rounded-lg font-medium hover:bg-brand-blue/90 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Material
                </button>
              </div>

              <div className="space-y-3">
                {rawMaterials.map((material, index) => (
                  <div key={index} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <select
                          value={material.product_id}
                          onChange={(e) => handleProductChange(index, e.target.value, true)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue text-sm"
                        >
                          <option value="">Select product</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={material.required_quantity}
                          onChange={(e) => updateRawMaterial(index, 'required_quantity', parseFloat(e.target.value))}
                          placeholder="Qty"
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue text-sm"
                        />
                        <input
                          type="text"
                          value={material.unit}
                          readOnly
                          placeholder="Unit"
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm"
                        />
                      </div>
                    </div>
                    {rawMaterials.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRawMaterial(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Returns Section */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Expected Returns (Finished Goods) <span className="text-red-500">*</span>
                </h3>
                <button
                  type="button"
                  onClick={addExpectedReturn}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-brand-blue text-white rounded-lg font-medium hover:bg-brand-blue/90 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              <div className="space-y-3">
                {expectedReturns.map((item, index) => (
                  <div key={index} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <select
                          value={item.product_id}
                          onChange={(e) => handleProductChange(index, e.target.value, false)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue text-sm"
                        >
                          <option value="">Select product</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={item.expected_quantity}
                          onChange={(e) => updateExpectedReturn(index, 'expected_quantity', parseFloat(e.target.value))}
                          placeholder="Qty"
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue text-sm"
                        />
                        <input
                          type="text"
                          value={item.unit}
                          readOnly
                          placeholder="Unit"
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm"
                        />
                      </div>
                    </div>
                    {expectedReturns.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExpectedReturn(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <Link
                href="/dashboard/job-works"
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 px-6 md:px-8 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange/90 focus:ring-4 focus:ring-brand-orange/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {loading ? 'Creating...' : 'Create Job Work'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
