'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { invalidatePartnerCache } from '@/lib/cache'

export async function createPartner(formData: FormData) {
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

    const partnerData = {
      company_id: userData.company_id,
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      company_name: formData.get('company_name') as string || null,
      phone_number: formData.get('phone_number') as string,
      email: formData.get('email') as string || null,
      partner_type: formData.get('partner_type') as string,
      gst_number: formData.get('gst_number') as string || null,
      pan_number: formData.get('pan_number') as string || null,
      address_line1: formData.get('address_line1') as string || null,
      address_line2: formData.get('address_line2') as string || null,
      city: formData.get('city') as string || null,
      state: formData.get('state') as string || null,
      country: formData.get('country') as string || null,
      pin_code: formData.get('pin_code') as string || null,
      notes: formData.get('notes') as string || null,
      created_by: userData.id,
      modified_by: userData.id,
    }

    const { error } = await supabase.from('partners').insert([partnerData])

    if (error) {
      console.error('Error creating partner:', error)
      return { error: error.message }
    }

    // Invalidate partner cache (pass partner_type for specific cache invalidation)
    invalidatePartnerCache(userData.company_id, partnerData.partner_type)

    return { success: true }
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return { error: error.message || 'Failed to create partner' }
  }
}

export async function updatePartner(formData: FormData) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Get user's id and company_id
    const { data: userData } = await supabase
      .from('users')
      .select('id, company_id')
      .eq('auth_user_id', user.id)
      .single()

    if (!userData?.id || !userData?.company_id) {
      return { error: 'User not found' }
    }

    const partnerId = formData.get('id') as string

    const partnerData = {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      company_name: formData.get('company_name') as string || null,
      phone_number: formData.get('phone_number') as string,
      email: formData.get('email') as string || null,
      partner_type: formData.get('partner_type') as string,
      gst_number: formData.get('gst_number') as string || null,
      pan_number: formData.get('pan_number') as string || null,
      address_line1: formData.get('address_line1') as string || null,
      address_line2: formData.get('address_line2') as string || null,
      city: formData.get('city') as string || null,
      state: formData.get('state') as string || null,
      country: formData.get('country') as string || null,
      pin_code: formData.get('pin_code') as string || null,
      notes: formData.get('notes') as string || null,
      modified_by: userData.id,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('partners')
      .update(partnerData)
      .eq('id', partnerId)

    if (error) {
      console.error('Error updating partner:', error)
      return { error: error.message }
    }

    // Invalidate partner cache (pass partner_type for specific cache invalidation)
    invalidatePartnerCache(userData.company_id, partnerData.partner_type)

    return { success: true }
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return { error: error.message || 'Failed to update partner' }
  }
}

export async function deletePartner(partnerId: string) {
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
      .select('company_id')
      .eq('auth_user_id', user.id)
      .single()

    if (!userData?.company_id) {
      return { error: 'User not found' }
    }

    // Soft delete by setting deleted_at
    const { error } = await supabase
      .from('partners')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', partnerId)

    if (error) {
      console.error('Error deleting partner:', error)
      return { error: error.message }
    }

    // Invalidate partner cache (invalidate all partner types since we don't know which type was deleted)
    invalidatePartnerCache(userData.company_id)

    return { success: true }
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return { error: error.message || 'Failed to delete partner' }
  }
}
