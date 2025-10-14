'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateCompany(formData: FormData) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Get user details to verify role and get company_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('auth_user_id', user.id)
      .single()

    if (userError || !userData?.company_id) {
      return { error: 'Company not found' }
    }

    // Only admins can update company details
    if (userData.role !== 'admin') {
      return { error: 'Forbidden: Admin access required' }
    }

    // Extract form data
    const companyId = formData.get('id') as string
    const updateData = {
      name: formData.get('name') as string,
      business_type: (formData.get('business_type') as string) || null,
      gst_number: (formData.get('gst_number') as string) || null,
      pan_number: (formData.get('pan_number') as string) || null,
      address_line1: (formData.get('address_line1') as string) || null,
      address_line2: (formData.get('address_line2') as string) || null,
      city: (formData.get('city') as string) || null,
      state: (formData.get('state') as string) || null,
      country: (formData.get('country') as string) || null,
      pin_code: (formData.get('pin_code') as string) || null,
      modified_by: user.id,
      updated_at: new Date().toISOString(),
    }

    // Verify the company_id matches the user's company
    if (companyId !== userData.company_id) {
      return { error: 'Forbidden: Cannot update another company' }
    }

    // Update company using Supabase auto-generated API
    const { error: updateError } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', companyId)

    if (updateError) {
      console.error('Update error:', updateError)
      return { error: 'Failed to update company details' }
    }

    // Revalidate the settings page to show updated data
    revalidatePath('/dashboard/settings')

    return { success: true }
  } catch (error) {
    console.error('Error updating company:', error)
    return { error: 'Internal server error' }
  }
}
