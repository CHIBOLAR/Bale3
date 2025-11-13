import { Info, Package, Tag, FileText } from 'lucide-react'
import Image from 'next/image'

interface ProductPrimaryDetailsProps {
  product: {
    id: string
    product_number: string
    name: string
    material?: string
    color?: string
    color_code?: string
    gsm?: number
    measuring_unit: string
    hsn_code?: string
    sac_code?: string
    tags?: string[]
    notes?: string
    product_images?: string[]
    created_at: string
    updated_at: string
  }
}

export function ProductPrimaryDetails({ product }: ProductPrimaryDetailsProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left Column - Product Information */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Info className="w-6 h-6 text-brand-blue" />
          Product Information
        </h2>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Product name</p>
              <p className="text-base font-semibold text-gray-900">{product.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Product ID</p>
              <p className="text-base font-semibold text-gray-900">{product.product_number}</p>
            </div>
          </div>

          {product.material && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Material</p>
              <p className="text-base font-semibold text-gray-900">{product.material}</p>
            </div>
          )}

          {product.color && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Color</p>
              <div className="flex items-center gap-2">
                {product.color_code && (
                  <div
                    className="w-6 h-6 rounded border-2 border-gray-300"
                    style={{ backgroundColor: product.color_code }}
                  />
                )}
                <p className="text-base font-semibold text-gray-900">{product.color}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {product.gsm && (
              <div>
                <p className="text-sm text-gray-500 mb-1">GSM</p>
                <p className="text-base font-semibold text-gray-900">{product.gsm}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 mb-1">Measuring Unit</p>
              <p className="text-base font-semibold text-gray-900">{product.measuring_unit}</p>
            </div>
          </div>

          {(product.hsn_code || product.sac_code) && (
            <div className="grid grid-cols-2 gap-4">
              {product.hsn_code && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">HSN Code</p>
                  <p className="text-base font-semibold text-gray-900">{product.hsn_code}</p>
                </div>
              )}
              {product.sac_code && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">SAC Code</p>
                  <p className="text-base font-semibold text-gray-900">{product.sac_code}</p>
                </div>
              )}
            </div>
          )}

          {product.tags && product.tags.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-brand-green/10 text-brand-green rounded-full"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.notes && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Product Image */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Package className="w-6 h-6 text-brand-blue" />
          Product Image
        </h2>

        <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
          {product.product_images && product.product_images.length > 0 ? (
            <div className="relative w-full h-full">
              <Image
                src={product.product_images[0]}
                alt={product.name}
                fill
                className="object-contain p-4"
              />
            </div>
          ) : (
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No image available</p>
              <p className="text-xs text-gray-400 mt-1">(Max 8 photos, 30 MB Total)</p>
              <p className="text-xs text-gray-400">Supports: JPG, PNG</p>
            </div>
          )}
        </div>

        {product.product_images && product.product_images.length > 1 && (
          <div className="mt-4 grid grid-cols-4 gap-2">
            {product.product_images.slice(1, 5).map((image, index) => (
              <div
                key={index}
                className="relative h-16 border border-gray-200 rounded overflow-hidden"
              >
                <Image
                  src={image}
                  alt={`${product.name} - ${index + 2}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
