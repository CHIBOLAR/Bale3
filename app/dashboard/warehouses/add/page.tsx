import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WarehouseForm from '../WarehouseForm'

export default async function AddWarehousePage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Get user details
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('auth_user_id', user.id)
    .single()

  // Only admins can add warehouses
  if (userError || userData?.role !== 'admin') {
    redirect('/dashboard/warehouses')
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-blue mb-2">
          Add Warehouse
        </h1>
        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
          Create a new warehouse location for inventory storage
        </p>
      </div>

      {/* Form */}
      <WarehouseForm mode="create" />
    </div>
  )
}
