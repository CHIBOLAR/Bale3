'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createWarehouse, updateWarehouse } from './actions'
import AddressAutocomplete from '@/components/AddressAutocomplete'
import SuccessDialog from '@/components/SuccessDialog'
import Link from 'next/link'

interface Warehouse {
  id?: string
  name: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  country: string | null
  pin_code: string | null
}

interface WarehouseFormProps {
  mode: 'create' | 'edit'
  warehouse?: Warehouse
}

export default function WarehouseForm({ mode, warehouse }: WarehouseFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [addressLine1, setAddressLine1] = useState(warehouse?.address_line1 || '')
  const [addressLine2, setAddressLine2] = useState(warehouse?.address_line2 || '')
  const [city, setCity] = useState(warehouse?.city || '')
  const [state, setState] = useState(warehouse?.state || '')
  const [country, setCountry] = useState(warehouse?.country || '')
  const [pinCode, setPinCode] = useState(warehouse?.pin_code || '')

  // Handle address autocomplete selection
  const handleAddressSelect = (addressComponents: {
    address_line1: string
    address_line2: string
    city: string
    state: string
    country: string
    pin_code: string
  }) => {
    setAddressLine1(addressComponents.address_line1)
    setAddressLine2(addressComponents.address_line2)
    setCity(addressComponents.city)
    setState(addressComponents.state)
    setCountry(addressComponents.country)
    setPinCode(addressComponents.pin_code)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)

    const result = mode === 'create'
      ? await createWarehouse(formData)
      : await updateWarehouse(formData)

    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setShowSuccessDialog(true)
    }
  }

  const handleSuccessClose = () => {
    setShowSuccessDialog(false)
    router.push('/dashboard/warehouses')
  }

  return (
    <div>
      {/* Success Dialog */}
      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={handleSuccessClose}
        title={mode === 'create' ? 'Warehouse Created!' : 'Warehouse Updated!'}
        message={mode === 'create'
          ? 'Your warehouse has been created successfully.'
          : 'Your warehouse details have been updated successfully.'}
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
            {mode === 'edit' && warehouse?.id && (
              <input type="hidden" name="id" value={warehouse.id} />
            )}

            {/* Warehouse Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Warehouse Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={warehouse?.name || ''}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                placeholder="e.g., Main Depot, Branch Office"
              />
              <p className="mt-1 text-xs text-gray-500">A unique name to identify this warehouse</p>
            </div>

            {/* Address Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>

              <div className="space-y-4">
                {/* Address Autocomplete */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Address
                  </label>
                  <AddressAutocomplete
                    onSelectAddress={handleAddressSelect}
                    placeholder="Start typing the warehouse address..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Search and select an address to auto-fill the fields below
                  </p>
                </div>

                {/* Address Line 1 */}
                <div>
                  <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    id="address_line1"
                    name="address_line1"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                    placeholder="Street address, building name, etc."
                  />
                </div>

                {/* Address Line 2 */}
                <div>
                  <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    id="address_line2"
                    name="address_line2"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                    placeholder="Apartment, suite, floor, etc."
                  />
                </div>

                {/* City and State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                      placeholder="State"
                    />
                  </div>
                </div>

                {/* Country and Pin Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                      placeholder="Country"
                    />
                  </div>

                  <div>
                    <label htmlFor="pin_code" className="block text-sm font-medium text-gray-700 mb-2">
                      Pin Code
                    </label>
                    <input
                      type="text"
                      id="pin_code"
                      name="pin_code"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                      placeholder="Pin code"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <Link
                href="/dashboard/warehouses"
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 px-6 md:px-8 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange/90 focus:ring-4 focus:ring-brand-orange/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {loading ? 'Saving...' : mode === 'create' ? 'Create Warehouse' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
