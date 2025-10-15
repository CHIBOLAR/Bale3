'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, ChevronRight } from 'lucide-react';
import { ProductQRSummary } from '@/lib/types/inventory';
import { getProductsQRSummary, getProductFilterOptions } from '@/app/actions/inventory/barcode';

export default function NewQRCodeBatchPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductQRSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [materialFilter, setMaterialFilter] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [materials, setMaterials] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchFilterOptions();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const data = await getProductsQRSummary();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFilterOptions() {
    try {
      const options = await getProductFilterOptions();
      setMaterials(options.materials);
      setColors(options.colors);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchTerm === '' ||
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase());

    // Note: We'll need to enhance getProductsQRSummary to include material/color
    // For now, filters work on product name only
    return matchesSearch;
  });

  const handleProductSelect = (productId: string) => {
    router.push(`/dashboard/inventory/qr-codes/new/select-units?product=${productId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Select product</h1>
          <p className="mt-1 text-sm text-gray-600">
            Choose a product to generate QR codes for its stock units
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for item"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-3">
          <select
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Materials</option>
            {materials.map((material) => (
              <option key={material} value={material}>
                {material}
              </option>
            ))}
          </select>

          <select
            value={colorFilter}
            onChange={(e) => setColorFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Colors</option>
            {colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        {/* Products List */}
        <div className="space-y-3">
          {filteredProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">No products found</p>
          ) : (
            filteredProducts.map((product) => (
              <button
                key={product.product_id}
                onClick={() => handleProductSelect(product.product_id)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-4 text-left transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {/* Product Image Placeholder */}
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                    <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-400">
                      {product.product_name.substring(0, 2).toUpperCase()}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div>
                    <h3 className="font-medium text-gray-900">{product.product_name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                      {product.qr_pending_count > 0 ? (
                        <span className="text-orange-600">
                          {product.qr_pending_count} QR code{product.qr_pending_count > 1 ? 's' : ''} pending
                        </span>
                      ) : (
                        <span>No QR code pending</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Last added on {new Date(product.last_added_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
