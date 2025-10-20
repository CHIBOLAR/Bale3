import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import JobWorkDetail from './JobWorkDetail'

export const metadata = {
  title: 'Job Work Details | Bale',
  description: 'View job work details and track progress',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function JobWorkDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Get user data
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('company_id, warehouse_id, is_demo')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    redirect('/login')
  }

  // Fetch job work with all relations
  let jobWorkQuery = supabase
    .from('job_works')
    .select(`
      *,
      partner:partners(id, partner_name, partner_type, contact_person, phone_number, email),
      warehouse:warehouses(id, warehouse_name, address),
      sales_order:sales_orders(id, order_number, status),
      raw_materials:job_work_raw_materials(
        id,
        required_quantity,
        unit,
        product:products(id, product_name, measuring_unit)
      ),
      finished_goods:job_work_finished_goods(
        id,
        expected_quantity,
        received_quantity,
        unit,
        product:products(id, product_name, measuring_unit)
      )
    `)
    .eq('id', id)
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)

  // Apply warehouse scoping for staff
  if (userData.warehouse_id) {
    jobWorkQuery = jobWorkQuery.eq('warehouse_id', userData.warehouse_id)
  }

  const { data: jobWork, error: jobWorkError } = await jobWorkQuery.single()

  if (jobWorkError || !jobWork) {
    notFound()
  }

  // Fetch goods dispatches for this job work
  const { data: dispatches, error: dispatchesError } = await supabase
    .from('goods_dispatches')
    .select(`
      id,
      dispatch_number,
      dispatch_date,
      status,
      items:goods_dispatch_items(
        id,
        dispatched_quantity,
        stock_unit_id,
        stock_unit:stock_units(
          id,
          size_quantity,
          status,
          product:products(id, product_name, measuring_unit)
        )
      )
    `)
    .eq('job_work_id', id)
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .order('dispatch_date', { ascending: false })

  if (dispatchesError) {
    console.error('Error fetching dispatches:', dispatchesError)
  }

  // Fetch goods receipts for this job work
  const { data: receipts, error: receiptsError } = await supabase
    .from('goods_receipts')
    .select(`
      id,
      receipt_number,
      receipt_date,
      status,
      items:goods_receipt_items(
        id,
        received_quantity,
        stock_unit_id,
        stock_unit:stock_units(
          id,
          size_quantity,
          status,
          product:products(id, product_name, measuring_unit)
        )
      )
    `)
    .eq('job_work_id', id)
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .order('receipt_date', { ascending: false })

  if (receiptsError) {
    console.error('Error fetching receipts:', receiptsError)
  }

  return (
    <JobWorkDetail
      jobWork={jobWork}
      dispatches={dispatches || []}
      receipts={receipts || []}
      isDemo={userData.is_demo}
    />
  )
}
