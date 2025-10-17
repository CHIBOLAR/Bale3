import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import StaffDetailClient from './StaffDetailClient'

export default async function StaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user's company and role
  const { data: userData } = await supabase
    .from('users')
    .select('company_id, is_demo, role, is_superadmin')
    .eq('auth_user_id', user.id)
    .single()

  if (!userData?.company_id) redirect('/dashboard')

  // Only admins can view staff details
  if (userData.role !== 'admin' && !userData.is_superadmin) {
    redirect('/dashboard/staff')
  }

  // Fetch staff member details
  const { data: staffMember, error } = await supabase
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
      updated_at,
      warehouses (
        id,
        name,
        location
      )
    `)
    .eq('id', id)
    .eq('company_id', userData.company_id)
    .single()

  if (error || !staffMember) {
    notFound()
  }

  // Fetch all warehouses for edit form
  const { data: warehouses } = await supabase
    .from('warehouses')
    .select('id, name')
    .eq('company_id', userData.company_id)
    .eq('is_active', true)
    .order('name', { ascending: true })

  return (
    <StaffDetailClient
      staffMember={staffMember}
      warehouses={warehouses || []}
      isDemo={userData.is_demo}
    />
  )
}
