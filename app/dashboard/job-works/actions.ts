'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { invalidateJobWorkCache } from '@/lib/cache'

interface RawMaterial {
  product_id: string
  required_quantity: number
  unit: string
}

interface ExpectedReturn {
  product_id: string
  expected_quantity: number
  unit: string
}

interface CreateJobWorkInput {
  partner_id: string
  warehouse_id: string
  sales_order_id?: string | null
  job_description?: string
  expected_delivery_date?: string | null
  raw_materials: RawMaterial[]
  expected_returns: ExpectedReturn[]
}

export async function generateJobNumber(companyId: string) {
  const supabase = await createClient()

  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const prefix = `JW-${year}-${month}-`

  // Get the last job work number for this month
  const { data, error } = await supabase
    .from('job_works')
    .select('job_number')
    .eq('company_id', companyId)
    .like('job_number', `${prefix}%`)
    .order('job_number', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error('Error generating job number:', error)
    return { data: null, error: 'Failed to generate job number' }
  }

  let sequence = 1
  if (data?.job_number) {
    const lastSequence = parseInt(data.job_number.split('-').pop() || '0')
    sequence = lastSequence + 1
  }

  const jobNumber = `${prefix}${String(sequence).padStart(5, '0')}`
  return { data: jobNumber, error: null }
}

export async function createJobWork(input: CreateJobWorkInput) {
  const supabase = await createClient()

  // Check demo mode
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Unauthorized' }
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('company_id, is_demo')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    return { data: null, error: 'User not found' }
  }

  if (userData.is_demo) {
    return { data: null, error: 'Cannot create job works in demo mode' }
  }

  // Generate job number
  const { data: jobNumber, error: jobNumberError } = await generateJobNumber(userData.company_id)
  if (jobNumberError || !jobNumber) {
    return { data: null, error: jobNumberError || 'Failed to generate job number' }
  }

  // Create job work
  const { data: jobWork, error: jobWorkError } = await supabase
    .from('job_works')
    .insert({
      company_id: userData.company_id,
      job_number: jobNumber,
      partner_id: input.partner_id,
      warehouse_id: input.warehouse_id,
      sales_order_id: input.sales_order_id,
      job_description: input.job_description,
      expected_delivery_date: input.expected_delivery_date,
      status: 'pending',
      created_by: user.id,
    })
    .select()
    .single()

  if (jobWorkError || !jobWork) {
    return { data: null, error: 'Failed to create job work' }
  }

  // Insert raw materials
  if (input.raw_materials.length > 0) {
    const { error: rawMaterialsError } = await supabase
      .from('job_work_raw_materials')
      .insert(
        input.raw_materials.map((material) => ({
          job_work_id: jobWork.id,
          product_id: material.product_id,
          required_quantity: material.required_quantity,
          unit: material.unit,
        }))
      )

    if (rawMaterialsError) {
      // Rollback job work creation
      await supabase.from('job_works').delete().eq('id', jobWork.id)
      return { data: null, error: 'Failed to add raw materials' }
    }
  }

  // Insert expected returns (finished goods)
  if (input.expected_returns.length > 0) {
    const { error: finishedGoodsError } = await supabase
      .from('job_work_finished_goods')
      .insert(
        input.expected_returns.map((item) => ({
          job_work_id: jobWork.id,
          product_id: item.product_id,
          expected_quantity: item.expected_quantity,
          unit: item.unit,
        }))
      )

    if (finishedGoodsError) {
      // Rollback job work creation
      await supabase.from('job_works').delete().eq('id', jobWork.id)
      return { data: null, error: 'Failed to add expected returns' }
    }
  }

  invalidateJobWorkCache(userData.company_id)

  return { data: jobWork, error: null }
}

export async function getJobWork(jobWorkId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Unauthorized' }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id, warehouse_id')
    .eq('id', user.id)
    .single()

  if (!userData) {
    return { data: null, error: 'User not found' }
  }

  let query = supabase
    .from('job_works')
    .select(`
      *,
      partner:partners(id, first_name, last_name, company_name, partner_type),
      warehouse:warehouses(id, name),
      sales_order:sales_orders(id, order_number),
      raw_materials:job_work_raw_materials(
        id,
        required_quantity,
        unit,
        product:products(id, name, measuring_unit)
      ),
      finished_goods:job_work_finished_goods(
        id,
        expected_quantity,
        received_quantity,
        unit,
        product:products(id, name, measuring_unit)
      ),
      dispatches:goods_dispatches(
        id,
        dispatch_number,
        dispatch_date,
        status
      ),
      receipts:goods_receipts(
        id,
        receipt_number,
        receipt_date,
        status
      )
    `)
    .eq('id', jobWorkId)
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)

  // Apply warehouse scoping for staff
  if (userData.warehouse_id) {
    query = query.eq('warehouse_id', userData.warehouse_id)
  }

  const { data, error } = await query.single()

  if (error) {
    return { data: null, error: 'Job work not found' }
  }

  // Transform data to match expected interface
  const transformed = data ? {
    ...data,
    partner: data.partner ? {
      ...data.partner,
      partner_name: data.partner.company_name || `${data.partner.first_name} ${data.partner.last_name}`
    } : null,
    warehouse: data.warehouse ? {
      ...data.warehouse,
      warehouse_name: data.warehouse.name
    } : null,
    raw_materials: data.raw_materials?.map((rm: any) => ({
      ...rm,
      product: rm.product ? { ...rm.product, product_name: rm.product.name } : null
    })) || [],
    finished_goods: data.finished_goods?.map((fg: any) => ({
      ...fg,
      product: fg.product ? { ...fg.product, product_name: fg.product.name } : null
    })) || []
  } : null

  return { data: transformed, error: null }
}

export async function getJobWorks(filters?: {
  status?: string
  partner_id?: string
  warehouse_id?: string
  search?: string
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Unauthorized' }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id, warehouse_id')
    .eq('id', user.id)
    .single()

  if (!userData) {
    return { data: null, error: 'User not found' }
  }

  let query = supabase
    .from('job_works')
    .select(`
      *,
      partner:partners(id, first_name, last_name, company_name, partner_type),
      warehouse:warehouses(id, name),
      sales_order:sales_orders(id, order_number),
      raw_materials:job_work_raw_materials(id, product_id),
      finished_goods:job_work_finished_goods(id, expected_quantity, received_quantity)
    `, { count: 'exact' })
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)

  // Apply warehouse scoping for staff
  if (userData.warehouse_id) {
    query = query.eq('warehouse_id', userData.warehouse_id)
  }

  // Apply filters
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.partner_id) {
    query = query.eq('partner_id', filters.partner_id)
  }

  if (filters?.warehouse_id) {
    query = query.eq('warehouse_id', filters.warehouse_id)
  }

  if (filters?.search) {
    query = query.or(`job_number.ilike.%${filters.search}%,job_description.ilike.%${filters.search}%`)
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .limit(1000)

  if (error) {
    return { data: null, error: 'Failed to fetch job works', count: 0 }
  }

  // Transform data to match expected interface
  const transformed = data?.map(item => ({
    ...item,
    partner: item.partner ? {
      ...item.partner,
      partner_name: item.partner.company_name || `${item.partner.first_name} ${item.partner.last_name}`
    } : null,
    warehouse: item.warehouse ? {
      ...item.warehouse,
      warehouse_name: item.warehouse.name
    } : null
  })) || []

  return { data: transformed, error: null, count: count || 0 }
}

export async function updateJobWorkStatus(jobWorkId: string, status: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Unauthorized' }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id, is_demo')
    .eq('id', user.id)
    .single()

  if (!userData) {
    return { data: null, error: 'User not found' }
  }

  if (userData.is_demo) {
    return { data: null, error: 'Cannot update job works in demo mode' }
  }

  const { data, error } = await supabase
    .from('job_works')
    .update({ status })
    .eq('id', jobWorkId)
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .select()
    .single()

  if (error) {
    return { data: null, error: 'Failed to update job work status' }
  }

  invalidateJobWorkCache(userData.company_id)

  return { data, error: null }
}

export async function deleteJobWork(jobWorkId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Unauthorized' }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id, is_demo')
    .eq('id', user.id)
    .single()

  if (!userData) {
    return { data: null, error: 'User not found' }
  }

  if (userData.is_demo) {
    return { data: null, error: 'Cannot delete job works in demo mode' }
  }

  const { error } = await supabase
    .from('job_works')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', jobWorkId)
    .eq('company_id', userData.company_id)

  if (error) {
    return { data: null, error: 'Failed to delete job work' }
  }

  invalidateJobWorkCache(userData.company_id)

  return { data: true, error: null }
}
