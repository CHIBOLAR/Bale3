import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PartnersPage() {
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
    .select('company_id, role, is_demo')
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

  // Fetch all partners for this company
  const { data: partners, error: partnersError } = await supabase
    .from('partners')
    .select('*')
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (partnersError) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800">Failed to load partners.</p>
        </div>
      </div>
    )
  }

  const isDemo = userData.is_demo
  const canManagePartners = !isDemo

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-blue mb-2">
            Partners
          </h1>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            Manage your customers and suppliers
          </p>
        </div>
        {canManagePartners && (
          <Link
            href="/dashboard/partners/add"
            className="inline-flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange/90 transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Partner
          </Link>
        )}
      </div>

      {/* Partners List */}
      {partners && partners.length > 0 ? (
        <div className="grid gap-4 md:gap-6">
          {partners.map((partner) => (
            <Link
              key={partner.id}
              href={canManagePartners ? `/dashboard/partners/${partner.id}` : '#'}
              className={`bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 ${
                canManagePartners ? 'hover:shadow-xl transition-shadow cursor-pointer' : 'cursor-default'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-brand-blue/10 rounded-lg">
                      <svg className="w-6 h-6 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        {partner.first_name} {partner.last_name}
                      </h3>
                      {partner.company_name && (
                        <p className="text-sm text-gray-500 mt-0.5">{partner.company_name}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      partner.partner_type === 'Customer'
                        ? 'bg-green-100 text-green-700'
                        : partner.partner_type === 'Supplier'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {partner.partner_type}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {partner.phone_number && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-gray-600">{partner.phone_number}</span>
                      </div>
                    )}

                    {partner.email && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-600">{partner.email}</span>
                      </div>
                    )}

                    {partner.gst_number && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-gray-600">GST: {partner.gst_number}</span>
                      </div>
                    )}

                    {partner.city && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-600">{partner.city}{partner.state && `, ${partner.state}`}</span>
                      </div>
                    )}
                  </div>
                </div>

                {canManagePartners && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No partners yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by adding your first customer or supplier
          </p>
          {canManagePartners && (
            <Link
              href="/dashboard/partners/add"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange/90 transition-all shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Partner
            </Link>
          )}
        </div>
      )}

      {isDemo && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-amber-800 text-sm font-medium leading-relaxed">
                Demo Mode - Read Only
              </p>
              <p className="text-amber-700 text-sm leading-relaxed mt-1">
                You're viewing sample partners. To create and manage your own partners,
                <Link href="/dashboard/request-upgrade" className="underline font-medium ml-1">
                  request official access
                </Link>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
