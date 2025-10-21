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
    .eq('auth_user_id', user.id)
    .single()

  if (userError || !userData) {
    redirect('/login')
  }

  // Fetch job work with all relations
  let jobWorkQuery = supabase
    .from('job_works')
    .select(`
      *,
      partner:partners(id, first_name, last_name, company_name, partner_type, phone_number, email),
      warehouse:warehouses(id, name),
      sales_order:sales_orders(id, order_number, status),
      agent:partners!job_works_agent_id_fkey(id, first_name, last_name, company_name)
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
      notes,
      items:goods_dispatch_items(
        id,
        dispatched_quantity,
        stock_unit:stock_units(
          id,
          unit_number,
          qr_code,
          size_quantity,
          status,
          product:products(id, name, measuring_unit)
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
      notes,
      items:goods_receipt_items(
        id,
        quantity_received,
        product:products(id, name, measuring_unit)
      )
    `)
    .eq('job_work_id', id)
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .order('receipt_date', { ascending: false })

  if (receiptsError) {
    console.error('Error fetching receipts:', receiptsError)
  }

  // Transform data to match client component expectations
  const transformedJobWork = {
    ...jobWork,
    partner: jobWork.partner ? {
      ...jobWork.partner,
      partner_name: jobWork.partner.company_name || `${jobWork.partner.first_name} ${jobWork.partner.last_name}`,
      contact_person: jobWork.partner.first_name && jobWork.partner.last_name
        ? `${jobWork.partner.first_name} ${jobWork.partner.last_name}`
        : null
    } : null,
    warehouse: jobWork.warehouse ? {
      ...jobWork.warehouse,
      warehouse_name: jobWork.warehouse.name
    } : null,
    agent: jobWork.agent ? {
      ...jobWork.agent,
      agent_name: jobWork.agent.company_name || `${jobWork.agent.first_name} ${jobWork.agent.last_name}`
    } : null
  }

  const transformedDispatches = dispatches?.map(dispatch => ({
    ...dispatch,
    items: dispatch.items?.map((item: any) => ({
      ...item,
      stock_unit: item.stock_unit ? {
        ...item.stock_unit,
        product: item.stock_unit.product ? {
          ...item.stock_unit.product,
          product_name: item.stock_unit.product.name
        } : null
      } : null
    })) || []
  })) || []

  const transformedReceipts = receipts?.map(receipt => ({
    ...receipt,
    items: receipt.items?.map((item: any) => ({
      ...item,
      product: item.product ? {
        ...item.product,
        product_name: item.product.name
      } : null
    })) || []
  })) || []

  return (
    <JobWorkDetail
      jobWork={transformedJobWork}
      dispatches={transformedDispatches}
      receipts={transformedReceipts}
      isDemo={userData.is_demo}
    />
  )
}
