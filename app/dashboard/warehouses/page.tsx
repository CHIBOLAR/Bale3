import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function WarehousesPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Get user details to find company_id
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('company_id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (userError || !userData?.company_id) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800">Company not found. Please contact support.</p>
        </div>
      </div>
    )
  }

  // Fetch all warehouses for this company
  const { data: warehouses, error: warehousesError } = await supabase
    .from('warehouses')
    .select('*')
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (warehousesError) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800">Failed to load warehouses.</p>
        </div>
      </div>
    )
  }

  const isAdmin = userData.role === 'admin'

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-blue mb-2">
            Warehouses
          </h1>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            Manage your warehouse locations and inventory storage
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/dashboard/warehouses/add"
            className="inline-flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange/90 transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Warehouse
          </Link>
        )}
      </div>

      {/* Warehouses List */}
      {warehouses && warehouses.length > 0 ? (
        <div className="grid gap-4 md:gap-6">
          {warehouses.map((warehouse) => (
            <Link
              key={warehouse.id}
              href={`/dashboard/warehouses/${warehouse.id}`}
              className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-brand-blue/10 rounded-lg">
                      <svg className="w-6 h-6 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{warehouse.name}</h3>
                  </div>
                  <div className="space-y-2 text-sm md:text-base text-gray-600">
                    {warehouse.address_line1 && (
                      <p className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>
                          {warehouse.address_line1}
                          {warehouse.address_line2 && `, ${warehouse.address_line2}`}
                        </span>
                      </p>
                    )}
                    {(warehouse.city || warehouse.state || warehouse.pin_code) && (
                      <p className="flex items-center gap-2 pl-7">
                        {warehouse.city && <span>{warehouse.city}</span>}
                        {warehouse.state && <span>{warehouse.state}</span>}
                        {warehouse.pin_code && <span>{warehouse.pin_code}</span>}
                      </p>
                    )}
                    {warehouse.country && (
                      <p className="flex items-center gap-2 pl-7">
                        <span>{warehouse.country}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No warehouses yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by adding your first warehouse location
          </p>
          {isAdmin && (
            <Link
              href="/dashboard/warehouses/add"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange/90 transition-all shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Warehouse
            </Link>
          )}
        </div>
      )}

      {!isAdmin && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-amber-800 text-sm leading-relaxed">
              Only administrators can add or edit warehouses. Contact your admin to make changes.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
