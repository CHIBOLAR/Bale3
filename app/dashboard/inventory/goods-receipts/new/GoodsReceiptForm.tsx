'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Building2,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  FileText,
  DollarSign,
  Truck,
  FileType,
  AlertCircle,
} from 'lucide-react';
import ProductSelectionList from '../components/ProductSelectionList';
import ProductDetailsModal from '../components/ProductDetailsModal';
import { ProductSelectionItem, SpecificationItem } from '@/lib/types/inventory';

interface Warehouse {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  product_number: string;
  measuring_unit: string;
  material: string;
  color: string;
  product_images?: string[];
}

interface Partner {
  id: string;
  company_name: string;
  partner_type: string;
}

interface GoodsReceiptFormProps {
  warehouses: Warehouse[];
  products: Product[];
  partners: Partner[];
  userId: string;
  companyId: string;
}

export default function GoodsReceiptForm({
  warehouses,
  products,
  partners,
  userId,
  companyId,
}: GoodsReceiptFormProps) {
  const router = useRouter();

  // Debug: Log products
  console.log('Products received:', products.length, products);

  // Product selection - FIRST
  const [selectedProducts, setSelectedProducts] = useState<Map<string, ProductSelectionItem>>(
    new Map()
  );

  // Receipt details - SECOND
  const [warehouseId, setWarehouseId] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [linkType, setLinkType] = useState('purchase');
  const [issuedByPartnerId, setIssuedByPartnerId] = useState('');
  const [issuedByWarehouseId, setIssuedByWarehouseId] = useState('');

  // Additional details (collapsible)
  const [showAdditional, setShowAdditional] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [transportDetails, setTransportDetails] = useState('');
  const [notes, setNotes] = useState('');

  // Modal state - for specification editing
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    productId: string | null;
    specificationIndex?: number; // undefined for new, number for editing
    prefilledQuantity?: number; // Quantity from inline input
  }>({
    isOpen: false,
    productId: null,
    specificationIndex: undefined,
    prefilledQuantity: undefined,
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleProductAdd = (product: Product) => {
    const newProduct: ProductSelectionItem = {
      product_id: product.id,
      product_name: product.name,
      fabric_type: product.material || '',
      color: product.color || '',
      product_number: product.product_number || '',
      specifications: [], // Start with empty specifications
    };
    setSelectedProducts(new Map(selectedProducts.set(product.id, newProduct)));
  };

  const handleProductRemove = (productId: string) => {
    const updated = new Map(selectedProducts);
    updated.delete(productId);
    setSelectedProducts(updated);
  };

  const handleAddSpecification = (productId: string, quantity: number) => {
    setModalState({
      isOpen: true,
      productId,
      specificationIndex: undefined, // undefined = new specification
      prefilledQuantity: quantity, // Prefill the quantity from inline input
    });
  };

  const handleEditSpecification = (productId: string, specIndex: number) => {
    setModalState({
      isOpen: true,
      productId,
      specificationIndex: specIndex,
      prefilledQuantity: undefined,
    });
  };

  const handleRemoveSpecification = (productId: string, specIndex: number) => {
    const product = selectedProducts.get(productId);
    if (!product) return;

    const updatedProduct = { ...product };
    updatedProduct.specifications = updatedProduct.specifications.filter((_, i) => i !== specIndex);

    setSelectedProducts(new Map(selectedProducts.set(productId, updatedProduct)));
  };

  const handleIncrementSpecQuantity = (productId: string, specIndex: number) => {
    const product = selectedProducts.get(productId);
    if (!product) return;

    const updatedProduct = { ...product };
    updatedProduct.specifications[specIndex] = {
      ...updatedProduct.specifications[specIndex],
      quantity: updatedProduct.specifications[specIndex].quantity + 1,
    };

    setSelectedProducts(new Map(selectedProducts.set(productId, updatedProduct)));
  };

  const handleDecrementSpecQuantity = (productId: string, specIndex: number) => {
    const product = selectedProducts.get(productId);
    if (!product) return;

    const spec = product.specifications[specIndex];
    if (spec.quantity > 1) {
      const updatedProduct = { ...product };
      updatedProduct.specifications[specIndex] = {
        ...spec,
        quantity: spec.quantity - 1,
      };
      setSelectedProducts(new Map(selectedProducts.set(productId, updatedProduct)));
    } else {
      // If quantity is 1, remove the specification
      handleRemoveSpecification(productId, specIndex);
    }
  };

  const handleSaveSpecification = (data: SpecificationItem) => {
    if (!modalState.productId) return;

    const product = selectedProducts.get(modalState.productId);
    if (!product) return;

    const updatedProduct = { ...product };

    if (modalState.specificationIndex !== undefined) {
      // Edit existing specification
      updatedProduct.specifications[modalState.specificationIndex] = { ...data };
    } else {
      // Add new specification
      updatedProduct.specifications.push({ ...data });
    }

    setSelectedProducts(new Map(selectedProducts.set(modalState.productId, updatedProduct)));

    // Close modal
    setModalState({
      isOpen: false,
      productId: null,
      specificationIndex: undefined,
      prefilledQuantity: undefined,
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (selectedProducts.size === 0) {
      newErrors.products = 'At least one product is required';
    } else {
      // Validate that each product has at least one specification
      for (const [productId, product] of selectedProducts) {
        if (product.specifications.length === 0) {
          newErrors.products = `Please add at least one specification for ${product.product_name}`;
          break;
        }
      }
    }

    if (!warehouseId) newErrors.warehouse = 'Warehouse is required';
    if (!receiptDate) newErrors.receiptDate = 'Receipt date is required';
    if (!linkType) newErrors.linkType = 'Link type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const supabase = createClient();

      // Generate receipt number
      const { data: lastReceipt } = await supabase
        .from('goods_receipts')
        .select('receipt_number')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const lastNumber = lastReceipt?.receipt_number
        ? parseInt(lastReceipt.receipt_number.split('-').pop() || '0')
        : 0;
      const newReceiptNumber = `GR-${String(lastNumber + 1).padStart(5, '0')}`;

      // Insert goods receipt
      const { data: receipt, error: receiptError } = await supabase
        .from('goods_receipts')
        .insert({
          company_id: companyId,
          warehouse_id: warehouseId,
          receipt_number: newReceiptNumber,
          issued_by_partner_id: linkType === 'purchase' ? (issuedByPartnerId || null) : null,
          issued_by_warehouse_id: linkType === 'transfer' ? (issuedByWarehouseId || null) : null,
          link_type: linkType,
          receipt_date: receiptDate,
          invoice_number: invoiceNumber || null,
          invoice_amount: invoiceAmount ? parseFloat(invoiceAmount) : null,
          transport_details: transportDetails || null,
          notes: notes || null,
          created_by: userId,
          modified_by: userId,
        })
        .select()
        .single();

      if (receiptError) throw receiptError;

      console.log('✓ Goods receipt created:', receipt);

      // Get the maximum unit number using a raw query to extract the numeric part
      const { data: maxUnitData } = await supabase.rpc('get_max_unit_number', {
        p_company_id: companyId
      });

      let unitCounter = 1;

      if (maxUnitData && typeof maxUnitData === 'number') {
        unitCounter = maxUnitData + 1;
      } else {
        // Fallback: fetch all units and find max manually
        const { data: allUnits } = await supabase
          .from('stock_units')
          .select('unit_number')
          .eq('company_id', companyId);

        if (allUnits && allUnits.length > 0) {
          const maxNumber = Math.max(...allUnits.map(u => {
            const match = u.unit_number.match(/\d+$/);
            return match ? parseInt(match[0]) : 0;
          }));
          unitCounter = maxNumber + 1;
        }
      }

      console.log('Starting unit counter from:', unitCounter);

      // Insert goods receipt items with specifications
      // Each specification = one receipt_item

      for (const product of selectedProducts.values()) {
        // Process each specification for this product
        for (const specification of product.specifications) {
          // Create receipt item (specification)
          const { data: receiptItem, error: itemError } = await supabase
            .from('goods_receipt_items')
            .insert({
              company_id: companyId,
              receipt_id: receipt.id,
              product_id: product.product_id,
              quantity_received: specification.quantity,
              quality_grade: specification.quality_grade,
              wastage: specification.wastage || 0,
              location_description: specification.location_description,
              manufacturing_date: specification.manufacturing_date,
              notes: specification.notes || null,
            })
            .select()
            .single();

          if (itemError) throw itemError;

          console.log('✓ Receipt item created:', receiptItem);

          // Create stock units for this specification
          const stockUnits: any[] = [];
          for (let i = 0; i < specification.quantity; i++) {
            const unitNumber = `UNIT-${String(unitCounter).padStart(6, '0')}`;
            const qrCode = `QR-${companyId}-${unitNumber}`;

            stockUnits.push({
              company_id: companyId,
              product_id: product.product_id,
              warehouse_id: warehouseId,
              receipt_item_id: receiptItem.id, // Link to specification!
              unit_number: unitNumber,
              qr_code: qrCode,
              size_quantity: specification.size_quantity,
              wastage: specification.wastage || 0,
              quality_grade: specification.quality_grade,
              location_description: specification.location_description,
              status: 'available',
              date_received: receiptDate,
              manufacturing_date: specification.manufacturing_date,
              notes: specification.notes || null,
              created_by: userId,
              modified_by: userId,
            });

            unitCounter++;
          }

          const { error: stockUnitsError } = await supabase.from('stock_units').insert(stockUnits);

          if (stockUnitsError) throw stockUnitsError;

          console.log(`✓ Created ${stockUnits.length} stock units for specification`);
        }
      }

      console.log('✓ All done! Redirecting...');

      // Show success message immediately
      setSuccessMessage(`✓ Goods receipt ${receipt.receipt_number} created successfully! Redirecting...`);
      setIsSubmitting(false);

      // Force a small delay to show the message, then redirect to detail page
      await new Promise(resolve => setTimeout(resolve, 1500));

      router.push(`/dashboard/inventory/goods-receipts/${receipt.id}`);
      router.refresh();
    } catch (error: any) {
      console.error('Error creating goods receipt:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      console.error('Error details:', error?.details);
      setErrors({
        submit: error.message || error?.details || error?.hint || 'Failed to create goods receipt. Check console for details.'
      });
      setIsSubmitting(false);
    }
  };

  const currentModalProduct = modalState.productId
    ? selectedProducts.get(modalState.productId)
    : null;

  const currentModalSpec =
    currentModalProduct && modalState.specificationIndex !== undefined
      ? currentModalProduct.specifications[modalState.specificationIndex]
      : modalState.prefilledQuantity
        ? {
            quantity: modalState.prefilledQuantity,
            size_quantity: 0,
            wastage: 0,
            quality_grade: '',
            location_description: '',
            manufacturing_date: new Date().toISOString().split('T')[0],
            notes: '',
          }
        : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Goods Receipt</h1>
        <p className="mt-1 text-sm text-gray-600">Select products and rolls, then add receipt details</p>
      </div>

      {/* STEP 1: Product Selection - FIRST & PROMINENT */}
      <div className="rounded-lg border-2 border-blue-200 bg-blue-50/30 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">Step 1: Select Products & Rolls</h2>
          <p className="text-sm text-gray-600">Choose products and specify number of rolls/stock units</p>
        </div>

        <div className="rounded-lg bg-white p-4">
          <ProductSelectionList
            products={products}
            selectedProducts={selectedProducts}
            onProductAdd={handleProductAdd}
            onProductRemove={handleProductRemove}
            onAddSpecification={handleAddSpecification}
            onEditSpecification={handleEditSpecification}
            onRemoveSpecification={handleRemoveSpecification}
            onIncrementSpecQuantity={handleIncrementSpecQuantity}
            onDecrementSpecQuantity={handleDecrementSpecQuantity}
          />

          {errors.products && (
            <div className="mt-4 flex items-start gap-2 rounded-md bg-amber-50 p-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
              <p className="text-sm text-amber-800">{errors.products}</p>
            </div>
          )}
        </div>
      </div>

      {/* STEP 2: Receipt Details - SECOND */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Step 2: Receipt Details</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Warehouse */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Building2 className="h-4 w-4" />
              Warehouse *
            </label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className={`w-full rounded-md border ${
                errors.warehouse ? 'border-red-500' : 'border-gray-300'
              } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
              required
            >
              <option value="">Select warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            {errors.warehouse && <p className="mt-1 text-xs text-red-600">{errors.warehouse}</p>}
          </div>

          {/* Receipt Date */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Calendar className="h-4 w-4" />
              Receipt Date *
            </label>
            <input
              type="date"
              value={receiptDate}
              onChange={(e) => setReceiptDate(e.target.value)}
              className={`w-full rounded-md border ${
                errors.receiptDate ? 'border-red-500' : 'border-gray-300'
              } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
              required
            />
            {errors.receiptDate && (
              <p className="mt-1 text-xs text-red-600">{errors.receiptDate}</p>
            )}
          </div>

          {/* Link Type */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <FileType className="h-4 w-4" />
              Receipt Type *
            </label>
            <select
              value={linkType}
              onChange={(e) => {
                setLinkType(e.target.value);
                setIssuedByPartnerId('');
                setIssuedByWarehouseId('');
              }}
              className={`w-full rounded-md border ${
                errors.linkType ? 'border-red-500' : 'border-gray-300'
              } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
              required
            >
              <option value="purchase">Purchase (From Supplier)</option>
              <option value="transfer">Transfer (From Warehouse)</option>
              <option value="job_work_return">Job Work Return</option>
              <option value="sales_return">Sales Return</option>
              <option value="production">Production</option>
            </select>
            {errors.linkType && <p className="mt-1 text-xs text-red-600">{errors.linkType}</p>}
          </div>

          {/* Conditional Source */}
          {linkType === 'purchase' && (
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <User className="h-4 w-4" />
                Supplier
              </label>
              <select
                value={issuedByPartnerId}
                onChange={(e) => setIssuedByPartnerId(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select supplier (optional)</option>
                {partners
                  .filter((p) => p.partner_type === 'Supplier')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.company_name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {linkType === 'transfer' && (
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <Building2 className="h-4 w-4" />
                Source Warehouse
              </label>
              <select
                value={issuedByWarehouseId}
                onChange={(e) => setIssuedByWarehouseId(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select warehouse (optional)</option>
                {warehouses
                  .filter((w) => w.id !== warehouseId)
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {(linkType === 'job_work_return' || linkType === 'sales_return') && (
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <User className="h-4 w-4" />
                {linkType === 'job_work_return' ? 'Job Work Partner' : 'Customer'}
              </label>
              <select
                value={issuedByPartnerId}
                onChange={(e) => setIssuedByPartnerId(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select {linkType === 'job_work_return' ? 'partner' : 'customer'} (optional)</option>
                {partners
                  .filter((p) => p.partner_type === (linkType === 'job_work_return' ? 'Agent' : 'Customer'))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.company_name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {linkType === 'production' && (
            <div>
              <p className="text-sm text-gray-500">Internally produced goods</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Details (Collapsible) */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setShowAdditional(!showAdditional)}
          className="flex w-full items-center justify-between p-6 text-left"
        >
          <h2 className="text-base font-semibold text-gray-900">Additional Details (Optional)</h2>
          {showAdditional ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>

        {showAdditional && (
          <div className="border-t border-gray-200 p-6 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Invoice Number */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <FileText className="h-4 w-4" />
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="INV-2025-001"
                />
              </div>

              {/* Invoice Amount */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <DollarSign className="h-4 w-4" />
                  Invoice Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              {/* Transport Details */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Truck className="h-4 w-4" />
                  Transport Details
                </label>
                <input
                  type="text"
                  value={transportDetails}
                  onChange={(e) => setTransportDetails(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Vehicle number, driver name, etc."
                />
              </div>

              {/* Notes */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <FileText className="h-4 w-4" />
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Success Message - Show at top for visibility */}
      {successMessage && (
        <div className="rounded-lg border-2 border-green-500 bg-green-50 p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold text-green-900">{successMessage}</p>
              <p className="text-sm text-green-700">Stock units have been created and added to inventory.</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errors.submit && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !!successMessage}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSubmitting ? 'Creating...' : successMessage ? 'Redirecting...' : 'Create Goods Receipt'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting || !!successMessage}
          className="rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
      </div>

      {/* Specification Modal */}
      {modalState.isOpen && currentModalProduct && (
        <ProductDetailsModal
          isOpen={modalState.isOpen}
          onClose={() =>
            setModalState({
              isOpen: false,
              productId: null,
              specificationIndex: undefined,
              prefilledQuantity: undefined,
            })
          }
          productName={currentModalProduct.product_name}
          specificationIndex={modalState.specificationIndex}
          initialData={currentModalSpec}
          onSave={handleSaveSpecification}
        />
      )}
    </form>
  );
}
