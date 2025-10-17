'use client'

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Plus, Minus, X, Edit2, AlertCircle } from 'lucide-react';
import { ProductSelectionItem } from '@/lib/types/inventory';

interface Product {
  id: string;
  name: string;
  material: string;
  color: string;
  product_number: string;
  product_images?: string[];
  measuring_unit: string;
}

interface ProductSelectionListProps {
  products: Product[];
  selectedProducts: Map<string, ProductSelectionItem>;
  onProductAdd: (product: Product) => void;
  onProductRemove: (productId: string) => void;
  onAddSpecification: (productId: string, quantity: number) => void;
  onEditSpecification: (productId: string, specIndex: number) => void;
  onRemoveSpecification: (productId: string, specIndex: number) => void;
  onIncrementSpecQuantity: (productId: string, specIndex: number) => void;
  onDecrementSpecQuantity: (productId: string, specIndex: number) => void;
}

export default function ProductSelectionList({
  products,
  selectedProducts,
  onProductAdd,
  onProductRemove,
  onAddSpecification,
  onEditSpecification,
  onRemoveSpecification,
  onIncrementSpecQuantity,
  onDecrementSpecQuantity,
}: ProductSelectionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [materialFilter, setMaterialFilter] = useState<string>('');
  const [colorFilter, setColorFilter] = useState<string>('');

  // State for inline quantity input before opening modal
  const [quantityInputs, setQuantityInputs] = useState<Map<string, number>>(new Map());

  const handleProductAddWithQuantity = (product: Product) => {
    // Add product AND initialize quantity to 1
    onProductAdd(product);
    setQuantityInputs(new Map(quantityInputs.set(product.id, 1)));
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    const current = quantityInputs.get(productId) || 1;
    const newQty = Math.max(1, current + delta);
    setQuantityInputs(new Map(quantityInputs.set(productId, newQty)));
  };

  const handleOpenSpecModal = (productId: string) => {
    const quantity = quantityInputs.get(productId) || 1;
    onAddSpecification(productId, quantity);
    // Clear the quantity input for this product
    const updated = new Map(quantityInputs);
    updated.delete(productId);
    setQuantityInputs(updated);
  };

  // Get unique values for filters
  const materials = useMemo(() => {
    const unique = new Set(products.map((p) => p.material));
    return Array.from(unique).sort();
  }, [products]);

  const colors = useMemo(() => {
    const unique = new Set(products.map((p) => p.color));
    return Array.from(unique).sort();
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        searchTerm === '' ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_number.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMaterial = materialFilter === '' || product.material === materialFilter;
      const matchesColor = colorFilter === '' || product.color === colorFilter;

      return matchesSearch && matchesMaterial && matchesColor;
    });
  }, [products, searchTerm, materialFilter, colorFilter]);

  const getTotalQuantity = (specifications: ProductSelectionItem['specifications']) => {
    return specifications.reduce((sum, spec) => sum + spec.quantity, 0);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Select products</h2>
        <Link
          href="/dashboard/products/new"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <Plus className="h-4 w-4" />
          New product
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search for item"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={materialFilter}
          onChange={(e) => setMaterialFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Material</option>
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
          <option value="">Color</option>
          {colors.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </div>

      {/* Product List */}
      <div className="space-y-3">
        {filteredProducts.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">No products found</p>
        ) : (
          filteredProducts.map((product) => {
            const selectedProduct = selectedProducts.get(product.id);
            const isAdded = !!selectedProduct;
            const hasSpecs = isAdded && selectedProduct.specifications.length > 0;
            const totalQty = hasSpecs ? getTotalQuantity(selectedProduct.specifications) : 0;

            return (
              <div
                key={product.id}
                className="rounded-lg border border-gray-200 hover:border-gray-300"
              >
                {/* Product Header */}
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    {/* Product Image */}
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                      {product.product_images && product.product_images.length > 0 ? (
                        <Image
                          src={product.product_images[0]}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-400">
                          {product.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div>
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">
                        {product.material}, {product.color}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {isAdded ? (
                      <>
                        {hasSpecs && (
                          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                            {totalQty} roll{totalQty !== 1 ? 's' : ''}
                          </span>
                        )}
                        {/* Always show quantity input for added products */}
                        <div className="flex items-center gap-2 rounded-md bg-blue-600 px-2 py-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(product.id, -1);
                            }}
                            className="rounded p-0.5 hover:bg-blue-700"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4 text-white" />
                          </button>
                          <button
                            onClick={() => handleOpenSpecModal(product.id)}
                            className="min-w-[2rem] text-center font-medium text-white hover:underline"
                          >
                            {quantityInputs.get(product.id) || 1}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(product.id, 1);
                            }}
                            className="rounded p-0.5 hover:bg-blue-700"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4 text-white" />
                          </button>
                        </div>
                        <button
                          onClick={() => onProductRemove(product.id)}
                          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          aria-label="Remove product"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleProductAddWithQuantity(product)}
                        className="flex items-center gap-1 rounded-md border border-blue-600 px-4 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4" />
                        Add
                      </button>
                    )}
                  </div>
                </div>

                {/* Specifications List */}
                {hasSpecs && (
                  <div className="border-t border-gray-200 bg-gray-50 px-3 py-2">
                    <div className="space-y-2">
                      {selectedProduct.specifications.map((spec, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {product.name} {spec.size_quantity} mtr
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(spec.manufacturing_date).toLocaleDateString('en-GB')} •{' '}
                              {spec.wastage > 0 && `${spec.wastage} mtr waste • `}
                              {spec.quality_grade} • {spec.location_description}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1">
                              <button
                                onClick={() => onDecrementSpecQuantity(product.id, index)}
                                className="rounded p-0.5 hover:bg-gray-200"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3 w-3 text-gray-600" />
                              </button>
                              <button
                                onClick={() => onEditSpecification(product.id, index)}
                                className="min-w-[1.5rem] cursor-pointer text-center text-sm font-medium text-gray-900 hover:text-blue-600"
                              >
                                {spec.quantity}
                              </button>
                              <button
                                onClick={() => onIncrementSpecQuantity(product.id, index)}
                                className="rounded p-0.5 hover:bg-gray-200"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3 w-3 text-gray-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State Warning */}
                {isAdded && !hasSpecs && (
                  <div className="border-t border-gray-200 bg-amber-50 px-3 py-2">
                    <div className="flex items-start gap-2 text-xs text-amber-800">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>Click "Add Specification" to define roll details</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
