import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CompanySettingsForm from './CompanySettingsForm'

export default async function SettingsPage() {
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
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Company not found. Please contact support.</p>
        </div>
      </div>
    )
  }

  // Fetch company details using Supabase auto-generated API
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('id', userData.company_id)
    .single()

  if (companyError || !company) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load company details.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-blue mb-2">Company Settings</h1>
        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
          Manage your company profile and business information
        </p>
      </div>

      {/* Form Card */}
      <CompanySettingsForm company={company} userRole={userData.role} />
    </div>
  )
}
