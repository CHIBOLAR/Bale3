'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface Product {
  id: string
  product_number: string | null
  name: string | null
  material: string | null
  color: string | null
  color_hex: string | null
  gsm: number | null
  measuring_unit: string | null
  selling_price_per_unit: number | null
  tags: string[] | null
  show_on_catalog: boolean | null
}

interface ProductsClientProps {
  products: Product[]
  canCreateProduct: boolean
}

export default function ProductsClient({ products, canCreateProduct }: ProductsClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [materialFilter, setMaterialFilter] = useState<string>('all')
  const [colorFilter, setColorFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Extract unique materials and colors for filters
  const materials = useMemo(() => {
    const unique = new Set(products.map(p => p.material).filter(Boolean))
    return Array.from(unique).sort()
  }, [products])

  const colors = useMemo(() => {
    const unique = new Set(products.map(p => p.color).filter(Boolean))
    return Array.from(unique).sort()
  }, [products])

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      const matchesSearch = !searchTerm ||
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      // Material filter
      const matchesMaterial = materialFilter === 'all' || product.material === materialFilter

      // Color filter
      const matchesColor = colorFilter === 'all' || product.color === colorFilter

      return matchesSearch && matchesMaterial && matchesColor
    })
  }, [products, searchTerm, materialFilter, colorFilter])

  return (
    <>
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">Search products</label>
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, product number, or tags..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>
          </div>

          {/* Material Filter */}
          <div className="w-full lg:w-48">
            <label htmlFor="material-filter" className="sr-only">Filter by material</label>
            <select
              id="material-filter"
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
            >
              <option value="all">All Materials</option>
              {materials.map(material => (
                <option key={material} value={material}>{material}</option>
              ))}
            </select>
          </div>

          {/* Color Filter */}
          <div className="w-full lg:w-48">
            <label htmlFor="color-filter" className="sr-only">Filter by color</label>
            <select
              id="color-filter"
              value={colorFilter}
              onChange={(e) => setColorFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
            >
              <option value="all">All Colors</option>
              {colors.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-brand-blue shadow-sm'
                  : 'text-gray-600 hover:text-brand-blue'
              }`}
              title="Grid view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-brand-blue shadow-sm'
                  : 'text-gray-600 hover:text-brand-blue'
              }`}
              title="List view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(searchTerm || materialFilter !== 'all' || colorFilter !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-blue/10 text-brand-blue text-sm rounded-full">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="hover:bg-brand-blue/20 rounded-full p-0.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {materialFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-blue/10 text-brand-blue text-sm rounded-full">
                Material: {materialFilter}
                <button onClick={() => setMaterialFilter('all')} className="hover:bg-brand-blue/20 rounded-full p-0.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {colorFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-blue/10 text-brand-blue text-sm rounded-full">
                Color: {colorFilter}
                <button onClick={() => setColorFilter('all')} className="hover:bg-brand-blue/20 rounded-full p-0.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('')
                setMaterialFilter('all')
                setColorFilter('all')
              }}
              className="text-sm text-gray-600 hover:text-brand-blue underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> of <span className="font-semibold text-gray-900">{products.length}</span> products
          </p>
        </div>
      </div>

      {/* Products Display */}
      {filteredProducts.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid gap-4 md:gap-6' : 'space-y-4'}>
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={canCreateProduct ? `/dashboard/products/${product.id}` : '#'}
              className={`bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 ${
                canCreateProduct ? 'hover:shadow-xl transition-shadow cursor-pointer' : 'cursor-default'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-brand-blue/10 rounded-lg">
                      <svg className="w-6 h-6 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                      {product.product_number && (
                        <p className="text-sm text-gray-500 mt-0.5">#{product.product_number}</p>
                      )}
                    </div>
                    {product.show_on_catalog && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        Catalog
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
                    {product.material && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        <span className="text-gray-600">{product.material}</span>
                      </div>
                    )}

                    {product.color && (
                      <div className="flex items-center gap-2">
                        {product.color_hex && (
                          <div
                            className="w-4 h-4 rounded border border-gray-300"
                            style={{ backgroundColor: product.color_hex }}
                          />
                        )}
                        <span className="text-gray-600">{product.color}</span>
                      </div>
                    )}

                    {product.gsm && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">GSM:</span>
                        <span className="text-gray-700 font-medium">{product.gsm}</span>
                      </div>
                    )}

                    {product.measuring_unit && product.selling_price_per_unit && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Price:</span>
                        <span className="text-brand-blue font-semibold">
                          ₹{product.selling_price_per_unit}/{product.measuring_unit}
                        </span>
                      </div>
                    )}
                  </div>

                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {product.tags.slice(0, 3).map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs font-medium bg-brand-green/10 text-brand-green rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {product.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                          +{product.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {canCreateProduct && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search or filters
          </p>
          <button
            onClick={() => {
              setSearchTerm('')
              setMaterialFilter('all')
              setColorFilter('all')
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-blue/90 transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}
    </>
  )
}
