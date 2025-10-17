'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendStaffInviteEmail } from '@/lib/email/resend'

/**
 * Generates a unique invite code
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Creates a staff invite and returns the invite code
 */
export async function generateStaffInvite(formData: FormData) {
  try {
    const supabase = await createClient()

    // Authenticate
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Get user's company and role
    const { data: userData } = await supabase
      .from('users')
      .select('id, company_id, role, is_superadmin')
      .eq('auth_user_id', user.id)
      .single()

    if (!userData?.company_id) return { error: 'Company not found' }

    // Only admins can create staff invites
    if (userData.role !== 'admin' && !userData.is_superadmin) {
      return { error: 'Only admins can invite staff members' }
    }

    // Extract form data
    const firstName = formData.get('first_name') as string
    const lastName = formData.get('last_name') as string
    const email = formData.get('email') as string
    const phoneNumber = formData.get('phone_number') as string
    const warehouseId = formData.get('warehouse_id') as string
    const role = 'staff' // Always staff for now

    // Validate required fields
    if (!firstName || !firstName.trim()) {
      return { error: 'First name is required' }
    }
    if (!lastName || !lastName.trim()) {
      return { error: 'Last name is required' }
    }
    if (!email || !email.includes('@')) {
      return { error: 'Valid email is required' }
    }

    // Check if user already exists with this email in the company
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('company_id', userData.company_id)
      .eq('email', email)
      .single()

    if (existingUser) {
      return { error: 'A staff member with this email already exists' }
    }

    // Check if there's already a pending invite for this email
    const { data: existingInvite } = await supabase
      .from('invites')
      .select('id')
      .eq('company_id', userData.company_id)
      .eq('email', email)
      .eq('status', 'pending')
      .single()

    if (existingInvite) {
      return { error: 'An invite is already pending for this email' }
    }

    // Generate unique invite code
    let inviteCode = generateInviteCode()
    let codeExists = true
    let attempts = 0

    while (codeExists && attempts < 10) {
      const { data: existing } = await supabase
        .from('invites')
        .select('id')
        .eq('code', inviteCode)
        .single()

      if (!existing) {
        codeExists = false
      } else {
        inviteCode = generateInviteCode()
        attempts++
      }
    }

    if (codeExists) {
      return { error: 'Could not generate unique invite code. Please try again.' }
    }

    // Set expiration (72 hours from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 72)

    // First, create the staff user record (without auth_user_id yet)
    const { data: staffUser, error: staffUserError } = await supabase
      .from('users')
      .insert([{
        company_id: userData.company_id,
        email: email,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phoneNumber?.trim() || null,
        role: role,
        warehouse_id: warehouseId || null,
        is_active: true,
        is_demo: false,
        created_by: userData.id,
        modified_by: userData.id,
        // auth_user_id will be set when they complete OTP verification
      }])
      .select()
      .single()

    if (staffUserError) {
      console.error('Staff user creation error:', staffUserError)
      return { error: staffUserError.message }
    }

    // Then create invite record linked to the staff user
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .insert([{
        invite_type: 'staff',
        code: inviteCode,
        email: email,
        company_id: userData.company_id,
        warehouse_id: warehouseId || null,
        role: role,
        status: 'pending', // Will be changed to 'accepted' when staff completes signup
        invited_by: userData.id,
        expires_at: expiresAt.toISOString(),
        metadata: {
          generation_method: 'manual',
          invited_by_email: user.email,
          staff_user_id: staffUser.id // Link to the staff user record
        }
      }])
      .select()
      .single()

    if (inviteError) {
      console.error('Invite creation error:', inviteError)
      // Rollback: delete the staff user if invite creation fails
      await supabase.from('users').delete().eq('id', staffUser.id)
      return { error: inviteError.message }
    }

    // Send invite email using Resend
    const recipientName = `${firstName.trim()} ${lastName.trim()}`
    const emailResult = await sendStaffInviteEmail(email, inviteCode, recipientName)

    if (!emailResult.success) {
      console.error('Failed to send invite email:', emailResult.error)
      // Don't fail the invite creation, but log the error
      // Admin can manually share the link or resend later
    } else {
      console.log('✅ Invite email sent successfully to:', email)
    }

    revalidatePath('/dashboard/staff')
    return { success: true, inviteCode, inviteId: invite.id, staffUserId: staffUser.id }

  } catch (error: any) {
    console.error('Error generating staff invite:', error)
    return { error: error.message }
  }
}

/**
 * Revokes a staff invite
 */
export async function revokeInvite(inviteId: string) {
  try {
    const supabase = await createClient()

    // Authenticate
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Get user's company
    const { data: userData } = await supabase
      .from('users')
      .select('company_id, role, is_superadmin')
      .eq('auth_user_id', user.id)
      .single()

    if (!userData?.company_id) return { error: 'Company not found' }

    // Only admins can revoke invites
    if (userData.role !== 'admin' && !userData.is_superadmin) {
      return { error: 'Only admins can revoke invites' }
    }

    // Update invite status to revoked
    const { error: updateError } = await supabase
      .from('invites')
      .update({
        status: 'revoked',
        updated_at: new Date().toISOString()
      })
      .eq('id', inviteId)
      .eq('company_id', userData.company_id)

    if (updateError) {
      return { error: updateError.message }
    }

    revalidatePath('/dashboard/staff')
    return { success: true }

  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Updates a staff member's information
 */
export async function updateStaffMember(staffId: string, formData: FormData) {
  try {
    const supabase = await createClient()

    // Authenticate
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Get user's company
    const { data: userData } = await supabase
      .from('users')
      .select('id, company_id, role, is_superadmin')
      .eq('auth_user_id', user.id)
      .single()

    if (!userData?.company_id) return { error: 'Company not found' }

    // Only admins can update staff
    if (userData.role !== 'admin' && !userData.is_superadmin) {
      return { error: 'Only admins can update staff members' }
    }

    // Extract form data
    const firstName = formData.get('first_name') as string
    const lastName = formData.get('last_name') as string
    const phoneNumber = formData.get('phone_number') as string
    const warehouseId = formData.get('warehouse_id') as string

    // Update staff member
    const { error: updateError } = await supabase
      .from('users')
      .update({
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber || null,
        warehouse_id: warehouseId || null,
        modified_by: userData.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', staffId)
      .eq('company_id', userData.company_id)

    if (updateError) {
      return { error: updateError.message }
    }

    revalidatePath('/dashboard/staff')
    revalidatePath(`/dashboard/staff/${staffId}`)
    return { success: true }

  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Toggles a staff member's active status
 */
export async function toggleStaffStatus(staffId: string, currentStatus: boolean) {
  try {
    const supabase = await createClient()

    // Authenticate
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Get user's company
    const { data: userData } = await supabase
      .from('users')
      .select('id, company_id, role, is_superadmin')
      .eq('auth_user_id', user.id)
      .single()

    if (!userData?.company_id) return { error: 'Company not found' }

    // Only admins can toggle staff status
    if (userData.role !== 'admin' && !userData.is_superadmin) {
      return { error: 'Only admins can change staff status' }
    }

    // Prevent deactivating yourself
    if (staffId === userData.id) {
      return { error: 'You cannot deactivate your own account' }
    }

    // Toggle status
    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_active: !currentStatus,
        modified_by: userData.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', staffId)
      .eq('company_id', userData.company_id)

    if (updateError) {
      return { error: updateError.message }
    }

    revalidatePath('/dashboard/staff')
    revalidatePath(`/dashboard/staff/${staffId}`)
    return { success: true }

  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Resends an invite email using Resend
 */
export async function resendInvite(inviteId: string) {
  try {
    const supabase = await createClient()

    // Authenticate
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Get user's company to verify permissions
    const { data: userData } = await supabase
      .from('users')
      .select('company_id, role, is_superadmin')
      .eq('auth_user_id', user.id)
      .single()

    if (!userData?.company_id) return { error: 'Company not found' }

    // Only admins can resend invites
    if (userData.role !== 'admin' && !userData.is_superadmin) {
      return { error: 'Only admins can resend invites' }
    }

    // Get invite details with metadata
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('code, email, company_id, status, metadata')
      .eq('id', inviteId)
      .single()

    if (inviteError || !invite) return { error: 'Invite not found' }

    // Verify invite belongs to user's company
    if (invite.company_id !== userData.company_id) {
      return { error: 'Unauthorized' }
    }

    // Check if invite is still valid
    if (invite.status === 'revoked') {
      return { error: 'This invite has been revoked and cannot be resent' }
    }

    if (invite.status === 'used') {
      return { error: 'This invite has already been used' }
    }

    // Extract name from metadata
    const metadata = invite.metadata as any || {}
    const recipientName = metadata.name || metadata.first_name || 'there'

    // Send email using Resend
    const emailResult = await sendStaffInviteEmail(
      invite.email,
      invite.code,
      recipientName
    )

    if (!emailResult.success) {
      console.error('Failed to resend invite:', emailResult.error)
      return {
        error: 'Failed to send email. Please check email configuration.',
        inviteCode: invite.code
      }
    }

    console.log('✅ Invite email resent successfully to:', invite.email)

    return {
      success: true,
      message: 'Invite email has been resent successfully',
      inviteCode: invite.code
    }

  } catch (error: any) {
    console.error('Error resending invite:', error)
    return { error: error.message }
  }
}
