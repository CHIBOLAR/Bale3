'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPartner, updatePartner } from './actions'
import AddressAutocomplete from '@/components/AddressAutocomplete'
import SuccessDialog from '@/components/SuccessDialog'
import Link from 'next/link'

interface Partner {
  id?: string
  first_name: string | null
  last_name: string | null
  company_name: string | null
  phone_number: string | null
  email: string | null
  partner_type: string | null
  gst_number: string | null
  pan_number: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  country: string | null
  pin_code: string | null
  notes: string | null
}

interface PartnerFormProps {
  mode: 'create' | 'edit'
  partner?: Partner
}

export default function PartnerForm({ mode, partner }: PartnerFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [addressLine1, setAddressLine1] = useState(partner?.address_line1 || '')
  const [addressLine2, setAddressLine2] = useState(partner?.address_line2 || '')
  const [city, setCity] = useState(partner?.city || '')
  const [state, setState] = useState(partner?.state || '')
  const [country, setCountry] = useState(partner?.country || '')
  const [pinCode, setPinCode] = useState(partner?.pin_code || '')

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
      ? await createPartner(formData)
      : await updatePartner(formData)

    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setShowSuccessDialog(true)
    }
  }

  const handleSuccessClose = () => {
    setShowSuccessDialog(false)
    router.push('/dashboard/partners')
  }

  return (
    <div>
      {/* Success Dialog */}
      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={handleSuccessClose}
        title={mode === 'create' ? 'Partner Created!' : 'Partner Updated!'}
        message={mode === 'create'
          ? 'Your partner has been added successfully.'
          : 'Your partner details have been updated successfully.'}
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
            {mode === 'edit' && partner?.id && (
              <input type="hidden" name="id" value={partner.id} />
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Basic Information
              </h3>

              {/* Partner Type */}
              <div>
                <label htmlFor="partner_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Partner Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="partner_type"
                  name="partner_type"
                  defaultValue={partner?.partner_type || ''}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                >
                  <option value="">Select type</option>
                  <option value="Customer">Customer</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Both">Both</option>
                  <option value="Job Worker">Job Worker</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Is this partner a customer, supplier, both, or job worker?
                </p>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    defaultValue={partner?.first_name || ''}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                    placeholder="First name"
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    defaultValue={partner?.last_name || ''}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                    placeholder="Last name"
                  />
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  defaultValue={partner?.company_name || ''}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  placeholder="e.g., ABC Textiles Pvt Ltd"
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    defaultValue={partner?.phone_number || ''}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    defaultValue={partner?.email || ''}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                    placeholder="contact@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Tax Information */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Tax Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="gst_number" className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number
                  </label>
                  <input
                    type="text"
                    id="gst_number"
                    name="gst_number"
                    defaultValue={partner?.gst_number || ''}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                    placeholder="e.g., 22AAAAA0000A1Z5"
                  />
                </div>

                <div>
                  <label htmlFor="pan_number" className="block text-sm font-medium text-gray-700 mb-2">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    id="pan_number"
                    name="pan_number"
                    defaultValue={partner?.pan_number || ''}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                    placeholder="e.g., ABCDE1234F"
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Address
              </h3>

              <div className="space-y-4">
                {/* Address Autocomplete */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Address
                  </label>
                  <AddressAutocomplete
                    onSelectAddress={handleAddressSelect}
                    placeholder="Start typing the address..."
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

            {/* Notes */}
            <div className="border-t border-gray-200 pt-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                defaultValue={partner?.notes || ''}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue resize-none"
                placeholder="Any additional information about this partner..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <Link
                href="/dashboard/partners"
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 px-6 md:px-8 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange/90 focus:ring-4 focus:ring-brand-orange/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {loading ? 'Saving...' : mode === 'create' ? 'Create Partner' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
