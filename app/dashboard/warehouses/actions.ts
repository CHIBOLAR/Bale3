'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createWarehouse(formData: FormData) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Get user's company_id
    const { data: userData } = await supabase
      .from('users')
      .select('company_id, id')
      .eq('auth_user_id', user.id)
      .single()

    if (!userData?.company_id) {
      return { error: 'Company not found' }
    }

    const warehouseData = {
      company_id: userData.company_id,
      name: formData.get('name') as string,
      address_line1: formData.get('address_line1') as string,
      address_line2: formData.get('address_line2') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      country: formData.get('country') as string,
      pin_code: formData.get('pin_code') as string,
      created_by: userData.id,
      modified_by: userData.id,
    }

    const { error } = await supabase.from('warehouses').insert([warehouseData])

    if (error) {
      console.error('Error creating warehouse:', error)
      return { error: error.message }
    }

    revalidatePath('/dashboard/warehouses')
    return { success: true }
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return { error: error.message || 'Failed to create warehouse' }
  }
}

export async function updateWarehouse(formData: FormData) {
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

    const warehouseId = formData.get('id') as string

    const warehouseData = {
      name: formData.get('name') as string,
      address_line1: formData.get('address_line1') as string,
      address_line2: formData.get('address_line2') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      country: formData.get('country') as string,
      pin_code: formData.get('pin_code') as string,
      modified_by: userData.id,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('warehouses')
      .update(warehouseData)
      .eq('id', warehouseId)

    if (error) {
      console.error('Error updating warehouse:', error)
      return { error: error.message }
    }

    revalidatePath('/dashboard/warehouses')
    revalidatePath(`/dashboard/warehouses/${warehouseId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return { error: error.message || 'Failed to update warehouse' }
  }
}

export async function deleteWarehouse(warehouseId: string) {
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
      .from('warehouses')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', warehouseId)

    if (error) {
      console.error('Error deleting warehouse:', error)
      return { error: error.message }
    }

    revalidatePath('/dashboard/warehouses')
    return { success: true }
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return { error: error.message || 'Failed to delete warehouse' }
  }
}
