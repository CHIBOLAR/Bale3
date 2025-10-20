'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct, updateProduct } from './actions'
import SuccessDialog from '@/components/SuccessDialog'
import SmartColorPicker from '@/components/SmartColorPicker'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Product {
  id?: string
  product_number: string | null
  name: string | null
  show_on_catalog: boolean | null
  material: string | null
  color: string | null
  color_code: string | null
  gsm: number | null
  thread_count_cm: number | null
  tags: string[] | null
  measuring_unit: string | null
  cost_price_per_unit: number | null
  selling_price_per_unit: number | null
  min_stock_alert: boolean | null
  min_stock_threshold: number | null
  hsn_code: string | null
  notes: string | null
  product_images: string[] | null
}

interface ProductFormProps {
  mode: 'create' | 'edit'
  product?: Product
}

export default function ProductForm({ mode, product }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [showOnCatalog, setShowOnCatalog] = useState(product?.show_on_catalog ?? true)
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false)
  const [colorName, setColorName] = useState(product?.color || '')
  const [colorCode, setColorCode] = useState(product?.color_code || '')
  const [uploadedImages, setUploadedImages] = useState<string[]>(product?.product_images || [])
  const [uploading, setUploading] = useState(false)
  const [productNumber, setProductNumber] = useState(product?.product_number || '')
  const [generatingNumber, setGeneratingNumber] = useState(false)

  // Handle color change from SmartColorPicker
  const handleColorChange = (name: string, code: string) => {
    setColorName(name)
    setColorCode(code)
  }

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const newImages: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const filePath = `product-images/${fileName}`

        const { data, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw uploadError
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)

        newImages.push(publicUrl)
      }

      setUploadedImages([...uploadedImages, ...newImages])
    } catch (err: any) {
      setError(err.message || 'Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  // Remove uploaded image
  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index))
  }

  // Generate next product number
  const generateProductNumber = async () => {
    setGeneratingNumber(true)
    setError(null)

    try {
      const supabase = createClient()

      // Get current user's company
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('auth_user_id', user.id)
        .single()

      if (!userData?.company_id) throw new Error('Company not found')

      // Get the highest product number for this company
      const { data: products } = await supabase
        .from('products')
        .select('product_number')
        .eq('company_id', userData.company_id)
        .is('deleted_at', null)
        .order('product_number', { ascending: false })
        .limit(1)

      let nextNumber = '001'

      if (products && products.length > 0 && products[0].product_number) {
        // Extract numeric part from product number (e.g., "001" from "001" or "PROD-001")
        const lastNumber = products[0].product_number.replace(/[^0-9]/g, '')
        if (lastNumber) {
          const nextNum = parseInt(lastNumber) + 1
          nextNumber = nextNum.toString().padStart(3, '0')
        }
      }

      setProductNumber(nextNumber)
    } catch (err: any) {
      console.error('Error generating product number:', err)
      setError(err.message || 'Failed to generate product number')
    } finally {
      setGeneratingNumber(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Validate color code is provided (name is optional)
    if (!colorCode) {
      setError('Please provide a color code for the product')
      return
    }

    // Validate images if showing on catalog
    if (showOnCatalog && uploadedImages.length === 0) {
      setError('Please upload at least one product image to show on catalog')
      setShowAdditionalDetails(true) // Open the section to show the error
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)

    // Add color data to form
    formData.set('color', colorName)
    formData.set('color_code', colorCode)

    // Add uploaded images to form data
    formData.set('product_images', uploadedImages.join(','))

    const result = mode === 'create'
      ? await createProduct(formData)
      : await updateProduct(formData)

    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setShowSuccessDialog(true)
    }
  }

  const handleSuccessClose = () => {
    setShowSuccessDialog(false)
    router.push('/dashboard/products')
  }

  return (
    <div>
      {/* Success Dialog */}
      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={handleSuccessClose}
        title={mode === 'create' ? 'Product Created!' : 'Product Updated!'}
        message={mode === 'create'
          ? 'Your product has been added to the catalog successfully.'
          : 'Your product details have been updated successfully.'}
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
            {mode === 'edit' && product?.id && (
              <input type="hidden" name="id" value={product.id} />
            )}

            {/* Basic Information - Required Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Basic Information
              </h3>

              {/* Product Number */}
              <div>
                <label htmlFor="product_number" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="product_number"
                    name="product_number"
                    value={productNumber}
                    onChange={(e) => setProductNumber(e.target.value)}
                    required
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                    placeholder="001"
                  />
                  {mode === 'create' && (
                    <button
                      type="button"
                      onClick={generateProductNumber}
                      disabled={generatingNumber}
                      className="px-4 py-2.5 bg-brand-blue text-white rounded-lg font-medium hover:bg-brand-blue/90 focus:ring-2 focus:ring-brand-blue/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap flex items-center gap-2"
                    >
                      {generatingNumber ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="hidden sm:inline">Generating...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span className="hidden sm:inline">Auto-Generate</span>
                          <span className="sm:hidden">Auto</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {mode === 'create'
                    ? 'Enter a product number or use auto-generate for the next available number'
                    : 'A unique identifier for this product'
                  }
                </p>
              </div>

              {/* Product Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={product?.name || ''}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  placeholder="e.g., Blossom Parade, Garden Gala"
                />
              </div>

              {/* Material */}
              <div>
                <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-2">
                  Material <span className="text-red-500">*</span>
                </label>
                <select
                  id="material"
                  name="material"
                  defaultValue={product?.material || ''}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                >
                  <option value="">Select material</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Polyester">Polyester</option>
                  <option value="Silk">Silk</option>
                  <option value="Wool">Wool</option>
                  <option value="Linen">Linen</option>
                  <option value="Rayon">Rayon</option>
                  <option value="Nylon">Nylon</option>
                  <option value="Blend">Blend</option>
                </select>
              </div>

              {/* Smart Color Picker */}
              <SmartColorPicker
                value={colorName}
                codeValue={colorCode}
                onChange={handleColorChange}
                required
              />

              {/* Measuring Unit */}
              <div>
                <label htmlFor="measuring_unit" className="block text-sm font-medium text-gray-700 mb-2">
                  Measuring Unit <span className="text-red-500">*</span>
                </label>
                <select
                  id="measuring_unit"
                  name="measuring_unit"
                  defaultValue={product?.measuring_unit || ''}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                >
                  <option value="">Select unit</option>
                  <option value="Meters">Meters</option>
                  <option value="Yards">Yards</option>
                  <option value="Pieces">Pieces</option>
                  <option value="KG">Kilograms (KG)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  This unit will be used for measuring stock quantities and pricing
                </p>
              </div>

              {/* Minimum Stock Threshold */}
              <div>
                <label htmlFor="min_stock_threshold" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Stock Alert Level <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <input
                    type="number"
                    id="min_stock_threshold"
                    name="min_stock_threshold"
                    defaultValue={product?.min_stock_threshold || ''}
                    min="0"
                    step="0.01"
                    required
                    className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                    placeholder="e.g., 100"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  <strong className="font-medium text-gray-700">Alert when stock falls below this level</strong> (measured in the same unit as "Measuring Unit" above)
                </p>
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong className="font-semibold">Example:</strong> If measuring unit is "Meters" and you enter 100, you'll be alerted when stock drops below 100 meters. If it's "Rolls", the alert triggers at 10 rolls.
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Details - Collapsible */}
            <div className="border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
                className="w-full flex items-center justify-between text-left group"
              >
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Additional Details
                  <span className="text-xs font-normal text-gray-500">(Optional)</span>
                </h3>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${showAdditionalDetails ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showAdditionalDetails && (
                <div className="mt-4 space-y-4">
                  {/* Show on Catalog */}
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <label htmlFor="show_on_catalog" className="block text-sm font-medium text-gray-900">
                          Show on catalog
                        </label>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Turn this on if you want your customers to see this item in your catalog
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          id="show_on_catalog"
                          name="show_on_catalog"
                          value="true"
                          checked={showOnCatalog}
                          onChange={(e) => setShowOnCatalog(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                      </label>
                    </div>
                    {showOnCatalog && (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          <strong className="font-semibold">Product images required:</strong> Please upload at least one image below to display this product in your catalog.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Product Images */}
                  {showOnCatalog && (
                    <div className="pb-4 border-b border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Images
                        <span className="text-red-500 ml-1">*</span>
                        <span className="text-xs font-normal text-gray-500 ml-2">(Required for catalog display)</span>
                      </label>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-brand-blue text-brand-blue rounded-lg font-medium hover:bg-brand-blue hover:text-white transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Choose Files
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                      {uploading && (
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-brand-blue" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading...
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Upload images if showing in catalog (PNG, JPG, JPEG)</p>

                    {/* Uploaded Images Preview */}
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                        {uploadedImages.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Product ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    </div>
                  )}

                  {/* GSM and Thread Count */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="gsm" className="block text-sm font-medium text-gray-700 mb-2">
                        GSM (Grams per Square Meter)
                      </label>
                      <input
                        type="number"
                        id="gsm"
                        name="gsm"
                        defaultValue={product?.gsm || ''}
                        min="0"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                        placeholder="e.g., 120"
                      />
                    </div>

                    <div>
                      <label htmlFor="thread_count_cm" className="block text-sm font-medium text-gray-700 mb-2">
                        Thread Count (per cm)
                      </label>
                      <input
                        type="number"
                        id="thread_count_cm"
                        name="thread_count_cm"
                        defaultValue={product?.thread_count_cm || ''}
                        min="0"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                        placeholder="e.g., 60"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      defaultValue={product?.tags?.join(', ') || ''}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                      placeholder="e.g., premium, floral, wedding"
                    />
                    <p className="mt-1 text-xs text-gray-500">Add tags for easy filtering (comma-separated)</p>
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cost_price_per_unit" className="block text-sm font-medium text-gray-700 mb-2">
                        Purchase Price per Unit
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          type="number"
                          id="cost_price_per_unit"
                          name="cost_price_per_unit"
                          defaultValue={product?.cost_price_per_unit || ''}
                          min="0"
                          step="0.01"
                          className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="selling_price_per_unit" className="block text-sm font-medium text-gray-700 mb-2">
                        Sale Price per Unit
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          type="number"
                          id="selling_price_per_unit"
                          name="selling_price_per_unit"
                          defaultValue={product?.selling_price_per_unit || ''}
                          min="0"
                          step="0.01"
                          className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* HSN Code */}
                  <div>
                    <label htmlFor="hsn_code" className="block text-sm font-medium text-gray-700 mb-2">
                      HSN Code
                    </label>
                    <input
                      type="text"
                      id="hsn_code"
                      name="hsn_code"
                      defaultValue={product?.hsn_code || ''}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                      placeholder="e.g., 5407"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Notes / Specifications
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      defaultValue={product?.notes || ''}
                      rows={4}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue resize-none"
                      placeholder="Enter material composition, specifications, handling instructions, etc..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <Link
                href="/dashboard/products"
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 px-6 md:px-8 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange/90 focus:ring-4 focus:ring-brand-orange/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {loading ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
