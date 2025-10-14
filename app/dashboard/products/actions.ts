'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProduct(formData: FormData) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Get user's company_id and user id
    const { data: userData } = await supabase
      .from('users')
      .select('company_id, id')
      .eq('auth_user_id', user.id)
      .single()

    if (!userData?.company_id) {
      return { error: 'Company not found' }
    }

    // Parse tags from comma-separated string to array
    const tagsString = formData.get('tags') as string
    const tags = tagsString
      ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag)
      : []

    // Parse product images from comma-separated string to array
    const imagesString = formData.get('product_images') as string
    const product_images = imagesString
      ? imagesString.split(',').map(img => img.trim()).filter(img => img)
      : []

    const productData = {
      company_id: userData.company_id,
      product_number: formData.get('product_number') as string,
      name: formData.get('name') as string,
      show_on_catalog: formData.get('show_on_catalog') === 'true',
      material: formData.get('material') as string || null,
      color: formData.get('color') as string || null,
      color_hex: formData.get('color_hex') as string || null,
      gsm: formData.get('gsm') ? parseInt(formData.get('gsm') as string) : null,
      thread_count_cm: formData.get('thread_count_cm') ? parseInt(formData.get('thread_count_cm') as string) : null,
      tags: tags.length > 0 ? tags : null,
      measuring_unit: formData.get('measuring_unit') as string || null,
      cost_price_per_unit: formData.get('cost_price_per_unit') ? parseFloat(formData.get('cost_price_per_unit') as string) : null,
      selling_price_per_unit: formData.get('selling_price_per_unit') ? parseFloat(formData.get('selling_price_per_unit') as string) : null,
      min_stock_alert: true, // Always enabled since threshold is required
      min_stock_threshold: formData.get('min_stock_threshold') ? parseInt(formData.get('min_stock_threshold') as string) : null,
      hsn_code: formData.get('hsn_code') as string || null,
      notes: formData.get('notes') as string || null,
      product_images: product_images.length > 0 ? product_images : null,
      created_by: userData.id,
      modified_by: userData.id,
    }

    const { error } = await supabase.from('products').insert([productData])

    if (error) {
      console.error('Error creating product:', error)
      return { error: error.message }
    }

    revalidatePath('/dashboard/products')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return { error: error.message || 'Failed to create product' }
  }
}

export async function updateProduct(formData: FormData) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Get user's id
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!userData?.id) {
      return { error: 'User not found' }
    }

    const productId = formData.get('id') as string

    // Parse tags from comma-separated string to array
    const tagsString = formData.get('tags') as string
    const tags = tagsString
      ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag)
      : []

    // Parse product images from comma-separated string to array
    const imagesString = formData.get('product_images') as string
    const product_images = imagesString
      ? imagesString.split(',').map(img => img.trim()).filter(img => img)
      : []

    const productData = {
      product_number: formData.get('product_number') as string,
      name: formData.get('name') as string,
      show_on_catalog: formData.get('show_on_catalog') === 'true',
      material: formData.get('material') as string || null,
      color: formData.get('color') as string || null,
      color_hex: formData.get('color_hex') as string || null,
      gsm: formData.get('gsm') ? parseInt(formData.get('gsm') as string) : null,
      thread_count_cm: formData.get('thread_count_cm') ? parseInt(formData.get('thread_count_cm') as string) : null,
      tags: tags.length > 0 ? tags : null,
      measuring_unit: formData.get('measuring_unit') as string || null,
      cost_price_per_unit: formData.get('cost_price_per_unit') ? parseFloat(formData.get('cost_price_per_unit') as string) : null,
      selling_price_per_unit: formData.get('selling_price_per_unit') ? parseFloat(formData.get('selling_price_per_unit') as string) : null,
      min_stock_alert: true, // Always enabled since threshold is required
      min_stock_threshold: formData.get('min_stock_threshold') ? parseInt(formData.get('min_stock_threshold') as string) : null,
      hsn_code: formData.get('hsn_code') as string || null,
      notes: formData.get('notes') as string || null,
      product_images: product_images.length > 0 ? product_images : null,
      modified_by: userData.id,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', productId)

    if (error) {
      console.error('Error updating product:', error)
      return { error: error.message }
    }

    revalidatePath('/dashboard/products')
    revalidatePath(`/dashboard/products/${productId}`)
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return { error: error.message || 'Failed to update product' }
  }
}

export async function deleteProduct(productId: string) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Soft delete by setting deleted_at
    const { error } = await supabase
      .from('products')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', productId)

    if (error) {
      console.error('Error deleting product:', error)
      return { error: error.message }
    }

    revalidatePath('/dashboard/products')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return { error: error.message || 'Failed to delete product' }
  }
}
