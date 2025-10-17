import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StaffClient from './StaffClient'

export default async function StaffPage() {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user's company and role
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('company_id, is_demo, role, is_superadmin')
    .eq('auth_user_id', user.id)
    .single()

  if (userError || !userData?.company_id) {
    redirect('/dashboard')
  }

  // Only admins can access staff management
  if (userData.role !== 'admin' && !userData.is_superadmin) {
    redirect('/dashboard')
  }

  // Fetch all staff members for the company (including those who haven't signed up yet)
  const { data: staffMembersRaw, error: staffError } = await supabase
    .from('users')
    .select(`
      id,
      auth_user_id,
      first_name,
      last_name,
      email,
      phone_number,
      role,
      warehouse_id,
      is_active,
      is_demo,
      created_at,
      warehouses (
        id,
        name
      )
    `)
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  // Transform warehouses from array to single object
  const staffMembers = (staffMembersRaw || []).map((member: any) => ({
    ...member,
    warehouses: Array.isArray(member.warehouses)
      ? member.warehouses[0]
      : member.warehouses
  }))

  // Fetch pending invites for this company
  const { data: pendingInvitesRaw, error: invitesError } = await supabase
    .from('invites')
    .select(`
      id,
      code,
      email,
      warehouse_id,
      role,
      status,
      invited_by,
      expires_at,
      created_at,
      warehouses (
        id,
        name
      )
    `)
    .eq('company_id', userData.company_id)
    .eq('invite_type', 'staff')
    .in('status', ['pending', 'accepted'])
    .order('created_at', { ascending: false })

  // Transform warehouses from array to single object
  const pendingInvites = (pendingInvitesRaw || []).map((invite: any) => ({
    ...invite,
    warehouses: Array.isArray(invite.warehouses)
      ? invite.warehouses[0]
      : invite.warehouses
  }))

  return (
    <StaffClient
      staffMembers={staffMembers}
      pendingInvites={pendingInvites}
      isDemo={userData.is_demo}
    />
  )
}
