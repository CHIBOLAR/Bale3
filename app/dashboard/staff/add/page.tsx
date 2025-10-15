import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AddStaffForm from './AddStaffForm'

export default async function AddStaffPage() {
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

  // Redirect demo users
  if (userData.is_demo) {
    redirect('/dashboard/staff')
  }

  // Only admins can add staff
  if (userData.role !== 'admin' && !userData.is_superadmin) {
    redirect('/dashboard/staff')
  }

  // Fetch warehouses for dropdown
  const { data: warehouses } = await supabase
    .from('warehouses')
    .select('id, name')
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .order('name', { ascending: true })

  return <AddStaffForm warehouses={warehouses || []} />
}
