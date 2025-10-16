import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PartnerForm from '../PartnerForm'

export default async function AddPartnerPage() {
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
    .select('company_id, is_demo')
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

  // Check if demo user
  if (userData.is_demo) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-amber-800 text-sm font-medium leading-relaxed">
                Demo Mode - Read Only
              </p>
              <p className="text-amber-700 text-sm leading-relaxed mt-1">
                You cannot create partners in demo mode.
                <Link href="/dashboard/request-upgrade" className="underline font-medium ml-1">
                  Request official access
                </Link> to create and manage partners.
              </p>
            </div>
          </div>
        </div>
        <Link
          href="/dashboard/partners"
          className="inline-flex items-center gap-2 text-brand-blue hover:text-brand-blue/80"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Partners
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <Link
          href="/dashboard/partners"
          className="inline-flex items-center gap-2 text-brand-blue hover:text-brand-blue/80 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Partners
        </Link>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-blue mb-2">
          Add New Partner
        </h1>
        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
          Add a new customer or supplier to your partner list
        </p>
      </div>

      {/* Form */}
      <PartnerForm mode="create" />
    </div>
  )
}
