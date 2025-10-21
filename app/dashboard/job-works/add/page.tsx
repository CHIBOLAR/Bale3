import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import JobWorkForm from '../JobWorkForm'

export const metadata = {
  title: 'Create Job Work | Bale',
  description: 'Create a new job work order',
}

export default async function AddJobWorkPage() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Get user data
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('company_id, warehouse_id')
    .eq('auth_user_id', user.id)
    .single()

  if (userError || !userData) {
    redirect('/login')
  }

  // Fetch partners (vendors and agents)
  const { data: partnersData, error: partnersError} = await supabase
    .from('partners')
    .select('id, first_name, last_name, company_name, partner_type')
    .eq('company_id', userData.company_id)
    .in('partner_type', ['Vendor', 'Agent'])
    .is('deleted_at', null)
    .order('partner_type')
    .order('company_name')

  if (partnersError) {
    console.error('Error fetching partners:', partnersError)
  }

  // Transform partners data
  const partners = partnersData?.map(p => ({
    id: p.id,
    partner_name: p.company_name || `${p.first_name} ${p.last_name}`,
    partner_type: p.partner_type
  })) || []

  // Fetch warehouses
  let warehouses: Array<{ id: string; warehouse_name: string }> = []
  if (!userData.warehouse_id) {
    // Admin: fetch all warehouses
    const { data: warehousesData, error: warehousesError } = await supabase
      .from('warehouses')
      .select('id, name')
      .eq('company_id', userData.company_id)
      .is('deleted_at', null)
      .order('name')

    if (warehousesError) {
      console.error('Error fetching warehouses:', warehousesError)
    } else {
      warehouses = warehousesData ? warehousesData.map(w => ({ id: w.id, warehouse_name: w.name })) : []
    }
  } else {
    // Staff: fetch only their assigned warehouse
    const { data: warehouseData, error: warehouseError } = await supabase
      .from('warehouses')
      .select('id, name')
      .eq('id', userData.warehouse_id)
      .single()

    if (warehouseError) {
      console.error('Error fetching warehouse:', warehouseError)
    } else if (warehouseData) {
      warehouses = [{ id: warehouseData.id, warehouse_name: warehouseData.name }]
    }
  }

  // Fetch sales orders (optional)
  const { data: salesOrders, error: salesOrdersError } = await supabase
    .from('sales_orders')
    .select('id, order_number')
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .order('order_number', { ascending: false })
    .limit(50)

  if (salesOrdersError) {
    console.error('Error fetching sales orders:', salesOrdersError)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-blue mb-2">
          Create Job Work Order
        </h1>
        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
          Send raw materials to a partner for processing and track the finished goods expected in return
        </p>
      </div>

      {/* Form */}
      <JobWorkForm
        key="job-work-form"
        partners={partners}
        warehouses={warehouses}
        salesOrders={salesOrders || []}
      />
    </div>
  )
}
