import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import WarehouseForm from '../WarehouseForm'
import Link from 'next/link'

export default async function EditWarehousePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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
    .select('company_id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (userError || !userData?.company_id) {
    redirect('/dashboard/warehouses')
  }

  // Fetch warehouse
  const { data: warehouse, error: warehouseError } = await supabase
    .from('warehouses')
    .select('*')
    .eq('id', id)
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .single()

  if (warehouseError || !warehouse) {
    notFound()
  }

  const isAdmin = userData.role === 'admin'

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/dashboard/warehouses"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Back to warehouses"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-blue">
            {isAdmin ? 'Edit Warehouse' : 'Warehouse Details'}
          </h1>
        </div>
        <p className="text-sm md:text-base text-gray-600 leading-relaxed pl-14">
          {isAdmin ? 'Update warehouse information and address' : 'View warehouse information and address'}
        </p>
      </div>

      {/* Admin Warning */}
      {!isAdmin && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-amber-800 text-sm leading-relaxed">
              Only administrators can edit warehouses. Contact your admin to make changes.
            </p>
          </div>
        </div>
      )}

      {/* Form or Read-only View */}
      {isAdmin ? (
        <WarehouseForm mode="edit" warehouse={warehouse} />
      ) : (
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="space-y-6">
              {/* Warehouse Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warehouse Name
                </label>
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {warehouse.name || '—'}
                </div>
              </div>

              {/* Address Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>

                <div className="space-y-4">
                  {/* Address Line 1 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1
                    </label>
                    <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {warehouse.address_line1 || '—'}
                    </div>
                  </div>

                  {/* Address Line 2 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2
                    </label>
                    <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {warehouse.address_line2 || '—'}
                    </div>
                  </div>

                  {/* City and State */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {warehouse.city || '—'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {warehouse.state || '—'}
                      </div>
                    </div>
                  </div>

                  {/* Country and Pin Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {warehouse.country || '—'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pin Code
                      </label>
                      <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {warehouse.pin_code || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back Button */}
              <div className="pt-6 border-t border-gray-200">
                <Link
                  href="/dashboard/warehouses"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Warehouses
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
