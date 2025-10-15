'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  CreateBarcodeBatchInput,
  ProductQRSummary,
  StockUnitWithRelations,
  BarcodeBatchWithRelations,
} from '@/lib/types/inventory';
import { generateQRCodesPDF, formatFieldValue } from '@/lib/utils/pdf-generator';

interface CreateBarcodeBatchResult {
  success: boolean;
  batchId?: string;
  error?: string;
}

/**
 * Gets unique filter values for products
 */
export async function getProductFilterOptions() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { materials: [], colors: [] };

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData?.company_id) return { materials: [], colors: [] };

    // Get all products for this company
    const { data: products } = await supabase
      .from('products')
      .select('material, color')
      .eq('company_id', userData.company_id)
      .is('deleted_at', null);

    if (!products) return { materials: [], colors: [] };

    // Extract unique values
    const materials = [...new Set(products.map(p => p.material).filter(Boolean))].sort();
    const colors = [...new Set(products.map(p => p.color).filter(Boolean))].sort();

    return { materials, colors };
  } catch (error) {
    console.error('Error in getProductFilterOptions:', error);
    return { materials: [], colors: [] };
  }
}

/**
 * Gets summary of products with QR code status
 * Staff users only see products from their assigned warehouse
 */
export async function getProductsQRSummary(): Promise<ProductQRSummary[]> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: userData } = await supabase
      .from('users')
      .select('company_id, role, warehouse_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData?.company_id) return [];

    // Get all stock units grouped by product
    let query = supabase
      .from('stock_units')
      .select('id, product_id, warehouse_id, products(id, name), date_received')
      .eq('company_id', userData.company_id)
      .is('deleted_at', null);

    // Apply warehouse filtering for staff users
    if (userData.role === 'staff' && userData.warehouse_id) {
      query = query.eq('warehouse_id', userData.warehouse_id);
    }

    const { data: units } = await query.order('date_received', { ascending: false });

    if (!units) return [];

    // Get all barcode batch items to check which units have QR codes
    const { data: batchItems } = await supabase
      .from('barcode_batch_items')
      .select('stock_unit_id');

    const unitsWithQR = new Set(batchItems?.map((item) => item.stock_unit_id) || []);

    // Group by product
    const productMap = new Map<string, ProductQRSummary>();

    units.forEach((unit: any) => {
      if (!unit.products) return;

      if (!productMap.has(unit.product_id)) {
        productMap.set(unit.product_id, {
          product_id: unit.product_id,
          product_name: unit.products.name,
          total_units: 0,
          qr_pending_count: 0,
          qr_generated_count: 0,
          last_added_date: unit.date_received,
        });
      }

      const product = productMap.get(unit.product_id)!;
      product.total_units++;

      if (unitsWithQR.has(unit.id)) {
        product.qr_generated_count++;
      } else {
        product.qr_pending_count++;
      }

      // Update last_added_date if this unit is newer
      if (new Date(unit.date_received) > new Date(product.last_added_date)) {
        product.last_added_date = unit.date_received;
      }
    });

    return Array.from(productMap.values());
  } catch (error) {
    console.error('Error in getProductsQRSummary:', error);
    return [];
  }
}

/**
 * Gets stock units for a product for QR generation with QR status
 * Staff users only see units from their assigned warehouse
 */
export async function getStockUnitsForQRGeneration(
  productId: string
): Promise<StockUnitWithRelations[]> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: userData } = await supabase
      .from('users')
      .select('company_id, role, warehouse_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData?.company_id) return [];

    let query = supabase
      .from('stock_units')
      .select(
        `
        *,
        products (id, name, material, color, product_number, product_images),
        warehouses (id, name)
      `
      )
      .eq('company_id', userData.company_id)
      .eq('product_id', productId)
      .is('deleted_at', null);

    // Apply warehouse filtering for staff users
    if (userData.role === 'staff' && userData.warehouse_id) {
      query = query.eq('warehouse_id', userData.warehouse_id);
    }

    const { data: units, error } = await query.order('date_received', { ascending: false });

    if (error) {
      console.error('Error fetching units:', error);
      return [];
    }

    return units || [];
  } catch (error) {
    console.error('Error in getStockUnitsForQRGeneration:', error);
    return [];
  }
}

/**
 * Check which stock units have QR codes generated
 */
export async function getStockUnitsQRStatus(unitIds: string[]): Promise<Map<string, boolean>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return new Map();

    const { data: batchItems } = await supabase
      .from('barcode_batch_items')
      .select('stock_unit_id')
      .in('stock_unit_id', unitIds);

    const statusMap = new Map<string, boolean>();
    unitIds.forEach(id => statusMap.set(id, false));
    batchItems?.forEach(item => statusMap.set(item.stock_unit_id, true));

    return statusMap;
  } catch (error) {
    console.error('Error in getStockUnitsQRStatus:', error);
    return new Map();
  }
}

/**
 * Creates a barcode batch and generates QR codes with PDF
 */
export async function createBarcodeBatch(
  input: CreateBarcodeBatchInput
): Promise<CreateBarcodeBatchResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData?.company_id) {
      return { success: false, error: 'Company not found' };
    }

    // Get warehouse_id from first stock unit if not provided
    let warehouseId = input.warehouse_id;
    if (!warehouseId && input.stock_unit_ids.length > 0) {
      const { data: unit } = await supabase
        .from('stock_units')
        .select('warehouse_id')
        .eq('id', input.stock_unit_ids[0])
        .single();

      warehouseId = unit?.warehouse_id || '';
    }

    // Create barcode batch
    const { data: batch, error: batchError } = await supabase
      .from('barcode_batches')
      .insert({
        company_id: userData.company_id,
        warehouse_id: warehouseId,
        batch_name: input.batch_name,
        layout_config: input.layout_config || {},
        fields_selected: input.fields_selected,
        status: 'generating',
        created_by: user.id,
      })
      .select()
      .single();

    if (batchError || !batch) {
      console.error('Error creating batch:', batchError);
      return { success: false, error: 'Failed to create batch' };
    }

    // Create barcode batch items
    const batchItems = input.stock_unit_ids.map((unitId) => ({
      batch_id: batch.id,
      stock_unit_id: unitId,
      barcode_generated_at: new Date().toISOString(),
    }));

    const { error: itemsError } = await supabase
      .from('barcode_batch_items')
      .insert(batchItems);

    if (itemsError) {
      console.error('Error creating batch items:', itemsError);
      return { success: false, error: 'Failed to create batch items' };
    }

    // Fetch stock units with full details for PDF generation
    const { data: stockUnits } = await supabase
      .from('stock_units')
      .select(
        `
        *,
        products (id, name, material, color, product_number, hsn_code, gsm, sale_price)
      `
      )
      .in('id', input.stock_unit_ids);

    if (!stockUnits || stockUnits.length === 0) {
      return { success: false, error: 'Stock units not found' };
    }

    // Prepare label data
    const labels = stockUnits.map((unit: any) => {
      const fields = input.fields_selected.map((fieldId) => {
        let label = '';
        let value = '';

        // Product fields
        if (fieldId === 'product_name') {
          label = 'Name';
          value = unit.products?.name || '';
        } else if (fieldId === 'product_number') {
          label = 'Product No';
          value = unit.products?.product_number || '';
        } else if (fieldId === 'hsn_code') {
          label = 'HSN';
          value = unit.products?.hsn_code || '';
        } else if (fieldId === 'material') {
          label = 'Material';
          value = unit.products?.material || '';
        } else if (fieldId === 'color') {
          label = 'Color';
          value = unit.products?.color || '';
        } else if (fieldId === 'gsm') {
          label = 'GSM';
          value = unit.products?.gsm?.toString() || '';
        } else if (fieldId === 'sale_price') {
          label = 'Price';
          value = unit.products?.sale_price ? `₹${unit.products.sale_price}` : '';
        }
        // Stock unit fields
        else if (fieldId === 'unit_number') {
          label = 'Unit No';
          value = unit.unit_number || '';
        } else if (fieldId === 'made_on') {
          label = 'Made on';
          value = unit.manufacture_date || '';
        } else if (fieldId === 'size') {
          label = 'Size';
          value = `${unit.size_quantity} m`;
        } else if (fieldId === 'wastage') {
          label = 'Wastage';
          value = `${unit.wastage_quantity || unit.wastage || 0} m`;
        } else if (fieldId === 'quality_grade') {
          label = 'Quality';
          value = unit.quality_grade || '';
        } else if (fieldId === 'location') {
          label = 'Location';
          value = unit.location_description || unit.location || '';
        }

        return { label, value };
      }).filter(f => f.value); // Only include fields with values

      return {
        qr_code: unit.qr_code,
        fields,
      };
    });

    // Generate PDF
    const pdfBuffer = await generateQRCodesPDF(
      labels,
      input.batch_name,
      input.layout_config || {}
    );

    // Upload PDF to Supabase Storage
    const fileName = `qr-batches/${batch.id}/${batch.batch_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading PDF:', uploadError);
      // Don't fail the entire operation, just mark as completed without PDF
      await supabase
        .from('barcode_batches')
        .update({ status: 'completed' })
        .eq('id', batch.id);
    } else {
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Update batch with PDF URL
      await supabase
        .from('barcode_batches')
        .update({
          status: 'completed',
          pdf_url: urlData.publicUrl,
        })
        .eq('id', batch.id);
    }

    revalidatePath('/dashboard/inventory/qr-codes');

    return { success: true, batchId: batch.id };
  } catch (error) {
    console.error('Error in createBarcodeBatch:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Gets all barcode batches
 * Staff users only see batches from their assigned warehouse
 */
export async function getBarcodeBatches(): Promise<BarcodeBatchWithRelations[]> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: userData } = await supabase
      .from('users')
      .select('company_id, role, warehouse_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData?.company_id) return [];

    let query = supabase
      .from('barcode_batches')
      .select(
        `
        *,
        warehouses (id, name)
      `
      )
      .eq('company_id', userData.company_id);

    // Apply warehouse filtering for staff users
    if (userData.role === 'staff' && userData.warehouse_id) {
      query = query.eq('warehouse_id', userData.warehouse_id);
    }

    const { data: batches, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching batches:', error);
      return [];
    }

    // Get item counts for each batch
    const batchesWithCounts = await Promise.all(
      (batches || []).map(async (batch: any) => {
        const { count } = await supabase
          .from('barcode_batch_items')
          .select('*', { count: 'exact', head: true })
          .eq('batch_id', batch.id);

        return {
          ...batch,
          items_count: count || 0,
        };
      })
    );

    return batchesWithCounts;
  } catch (error) {
    console.error('Error in getBarcodeBatches:', error);
    return [];
  }
}

/**
 * Gets a single barcode batch with all items
 * Staff users can only access batches from their assigned warehouse
 */
export async function getBarcodeBatch(batchId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: userData } = await supabase
      .from('users')
      .select('company_id, role, warehouse_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData?.company_id) return null;

    let query = supabase
      .from('barcode_batches')
      .select(
        `
        *,
        warehouses (id, name)
      `
      )
      .eq('id', batchId)
      .eq('company_id', userData.company_id);

    // Apply warehouse filtering for staff users
    if (userData.role === 'staff' && userData.warehouse_id) {
      query = query.eq('warehouse_id', userData.warehouse_id);
    }

    const { data: batch, error } = await query.single();

    if (error || !batch) {
      console.error('Error fetching batch:', error);
      return null;
    }

    // Get batch items with stock units
    const { data: items } = await supabase
      .from('barcode_batch_items')
      .select(
        `
        *,
        stock_units (
          *,
          products (id, name, material, color, product_number, product_images),
          warehouses (id, name)
        )
      `
      )
      .eq('batch_id', batchId);

    return {
      ...batch,
      items: items || [],
    };
  } catch (error) {
    console.error('Error in getBarcodeBatch:', error);
    return null;
  }
}
