'use client'

import { useState } from 'react'
import { updateCompany } from './actions'
import AddressAutocomplete from '@/components/AddressAutocomplete'
import SuccessDialog from '@/components/SuccessDialog'

interface Company {
  id: string
  name: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  country: string | null
  pin_code: string | null
  business_type: string | null
  gst_number: string | null
  pan_number: string | null
  logo_url: string | null
}

interface CompanySettingsFormProps {
  company: Company
  userRole: string
}

interface FormErrors {
  gst_number?: string
  pan_number?: string
  pin_code?: string
}

export default function CompanySettingsForm({ company, userRole }: CompanySettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  // Form field states for validation
  const [gstNumber, setGstNumber] = useState(company.gst_number || '')
  const [panNumber, setPanNumber] = useState(company.pan_number || '')

  // Form field states for auto-fill
  const [addressLine1, setAddressLine1] = useState(company.address_line1 || '')
  const [addressLine2, setAddressLine2] = useState(company.address_line2 || '')
  const [city, setCity] = useState(company.city || '')
  const [state, setState] = useState(company.state || '')
  const [country, setCountry] = useState(company.country || '')
  const [pinCode, setPinCode] = useState(company.pin_code || '')

  const isAdmin = userRole === 'admin'

  // Validation functions
  const validateGST = (gst: string): string | undefined => {
    if (!gst) return undefined
    if (gst.length > 15) {
      return 'GST number cannot exceed 15 characters'
    }
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    if (gst.length === 15 && !gstRegex.test(gst)) {
      return 'Invalid GST format (e.g., 22AAAAA0000A1Z5)'
    }
    return undefined
  }

  const validatePAN = (pan: string): string | undefined => {
    if (!pan) return undefined
    if (pan.length > 10) {
      return 'PAN number cannot exceed 10 characters'
    }
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    if (pan.length === 10 && !panRegex.test(pan)) {
      return 'Invalid PAN format (e.g., AAAAA0000A)'
    }
    return undefined
  }

  const validatePinCode = (pin: string, isSubmit: boolean = false): string | undefined => {
    if (!pin) return undefined

    // Check length limit
    if (pin.length > 8) {
      return 'Pin code cannot exceed 8 digits'
    }

    // Check if contains only digits
    const digitsOnlyRegex = /^[0-9]+$/
    if (!digitsOnlyRegex.test(pin)) {
      return 'Pin code must contain only digits'
    }

    // Only check minimum length on form submit
    if (isSubmit && pin.length < 4) {
      return 'Pin code must be at least 4 digits'
    }

    return undefined
  }

  // Handle real-time validation for GST
  const handleGSTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setGstNumber(value)
    const error = validateGST(value)
    setErrors(prev => ({ ...prev, gst_number: error }))
  }

  // Handle real-time validation for PAN
  const handlePANChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setPanNumber(value)
    const error = validatePAN(value)
    setErrors(prev => ({ ...prev, pan_number: error }))
  }

  // Handle real-time validation for Pincode
  const handlePinCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPinCode(value)
    const error = validatePinCode(value)
    setErrors(prev => ({ ...prev, pin_code: error }))
  }

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
    // Validate the autocompleted pin code
    const error = validatePinCode(addressComponents.pin_code)
    setErrors(prev => ({ ...prev, pin_code: error }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)

    // Validate all fields one final time
    const gst = formData.get('gst_number') as string
    const pan = formData.get('pan_number') as string
    const pin = formData.get('pin_code') as string

    const newErrors: FormErrors = {}
    const gstError = validateGST(gst)
    const panError = validatePAN(pan)
    const pinError = validatePinCode(pin, true) // Pass true for submit validation

    if (gstError) newErrors.gst_number = gstError
    if (panError) newErrors.pan_number = panError
    if (pinError) newErrors.pin_code = pinError

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      setError('Please fix validation errors before submitting')
      return
    }

    const result = await updateCompany(formData)

    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setShowSuccessDialog(true)
    }
  }

  return (
    <div>
      {/* Success Dialog */}
      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="Settings Saved!"
        message="Your company details have been updated successfully."
      />

      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100">
        <div className="p-4 sm:p-6 md:p-8">
          {!isAdmin && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-amber-800 text-sm leading-relaxed">
                  Only administrators can edit company settings. Contact your admin to make changes.
                </p>
              </div>
            </div>
          )}

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
          <input type="hidden" name="id" value={company.id} />

          {/* Company Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={company.name || ''}
              required
              disabled={!isAdmin}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter your company name"
            />
            <p className="mt-1 text-xs text-gray-500">The legal name of your company</p>
          </div>

          {/* Business Type */}
          <div>
            <label htmlFor="business_type" className="block text-sm font-medium text-gray-700 mb-2">
              Business Type
            </label>
            <input
              type="text"
              id="business_type"
              name="business_type"
              defaultValue={company.business_type || ''}
              disabled={!isAdmin}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="e.g., Embroidery, Sports, Weddings, etc."
            />
            <p className="mt-1 text-xs text-gray-500">The type of business you operate</p>
          </div>

          {/* GST Number */}
          <div>
            <label htmlFor="gst_number" className="block text-sm font-medium text-gray-700 mb-2">
              GST Number
            </label>
            <input
              type="text"
              id="gst_number"
              name="gst_number"
              value={gstNumber}
              onChange={handleGSTChange}
              disabled={!isAdmin}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.gst_number ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="22AAAAA0000A1Z5"
            />
            {errors.gst_number && (
              <p className="mt-1 text-xs text-red-600">{errors.gst_number}</p>
            )}
            {!errors.gst_number && (
              <p className="mt-1 text-xs text-gray-500">15-character alphanumeric GST identification number</p>
            )}
          </div>

          {/* PAN Number */}
          <div>
            <label htmlFor="pan_number" className="block text-sm font-medium text-gray-700 mb-2">
              PAN Number
            </label>
            <input
              type="text"
              id="pan_number"
              name="pan_number"
              value={panNumber}
              onChange={handlePANChange}
              disabled={!isAdmin}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.pan_number ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="AAAAA0000A"
            />
            {errors.pan_number && (
              <p className="mt-1 text-xs text-red-600">{errors.pan_number}</p>
            )}
            {!errors.pan_number && (
              <p className="mt-1 text-xs text-gray-500">10-character alphanumeric PAN identification number</p>
            )}
          </div>

          {/* Address Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>

            <div className="space-y-4">
              {/* Address Autocomplete */}
              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Address
                  </label>
                  <AddressAutocomplete
                    onSelectAddress={handleAddressSelect}
                    placeholder="Start typing your address..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Search and select your address to auto-fill the fields below
                  </p>
                </div>
              )}

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
                  disabled={!isAdmin}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={!isAdmin}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    disabled={!isAdmin}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    disabled={!isAdmin}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    disabled={!isAdmin}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    onChange={handlePinCodeChange}
                    disabled={!isAdmin}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors.pin_code ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Pin code"
                  />
                  {errors.pin_code && (
                    <p className="mt-1 text-xs text-red-600">{errors.pin_code}</p>
                  )}
                  {!errors.pin_code && (
                    <p className="mt-1 text-xs text-gray-500">4-8 digit postal code</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {isAdmin && (
            <div className="flex flex-col sm:flex-row justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 md:px-8 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange/90 focus:ring-4 focus:ring-brand-orange/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  </div>
  )
}
