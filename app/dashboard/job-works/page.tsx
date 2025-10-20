import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import JobWorksClient from './JobWorksClient'

export const metadata = {
  title: 'Job Works | Bale',
  description: 'Manage job work orders sent to partners for processing',
}

export default async function JobWorksPage() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Get user data
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('company_id, warehouse_id')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    redirect('/login')
  }

  // Fetch job works with relations
  let jobWorksQuery = supabase
    .from('job_works')
    .select(`
      *,
      partner:partners(id, partner_name, partner_type),
      warehouse:warehouses(id, warehouse_name),
      sales_order:sales_orders(id, order_number),
      raw_materials:job_work_raw_materials(id, product_id),
      finished_goods:job_work_finished_goods(id, expected_quantity, received_quantity)
    `)
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)

  // Apply warehouse scoping for staff
  if (userData.warehouse_id) {
    jobWorksQuery = jobWorksQuery.eq('warehouse_id', userData.warehouse_id)
  }

  const { data: jobWorks, error: jobWorksError } = await jobWorksQuery
    .order('created_at', { ascending: false })
    .limit(1000)

  if (jobWorksError) {
    console.error('Error fetching job works:', jobWorksError)
  }

  // Fetch partners for filter dropdown
  const { data: partners, error: partnersError } = await supabase
    .from('partners')
    .select('id, partner_name')
    .eq('company_id', userData.company_id)
    .eq('partner_type', 'Job Worker')
    .is('deleted_at', null)
    .order('partner_name')

  if (partnersError) {
    console.error('Error fetching partners:', partnersError)
  }

  // Fetch warehouses for filter dropdown (only for admins)
  let warehouses: Array<{ id: string; warehouse_name: string }> = []
  if (!userData.warehouse_id) {
    const { data: warehousesData, error: warehousesError } = await supabase
      .from('warehouses')
      .select('id, warehouse_name')
      .eq('company_id', userData.company_id)
      .is('deleted_at', null)
      .order('warehouse_name')

    if (warehousesError) {
      console.error('Error fetching warehouses:', warehousesError)
    } else {
      warehouses = warehousesData || []
    }
  }

  return (
    <JobWorksClient
      jobWorks={jobWorks || []}
      partners={partners || []}
      warehouses={warehouses}
      userWarehouseId={userData.warehouse_id}
    />
  )
}
