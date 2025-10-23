'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Auto-setup a new user: creates company, user record, and warehouse
 * Called after successful authentication (Google OAuth or Email OTP)
 */
export async function setupNewUser() {
  const supabase = await createClient()

  // Get current authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('❌ No authenticated user found')
    return { success: false, error: 'Not authenticated' }
  }

  // Check if user already has a record
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (existingUser) {
    console.log('✅ User already set up')
    return { success: true, alreadyExists: true }
  }

  console.log('🔧 Setting up new user:', user.email)

  try {
    // Extract user name from metadata or email
    const userName = user.user_metadata?.full_name
      || user.user_metadata?.name
      || user.email?.split('@')[0]
      || 'User'

    const companyName = `${userName.split(' ')[0]}'s Company`

    // Create company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: companyName,
      })
      .select()
      .single()

    if (companyError || !company) {
      console.error('❌ Error creating company:', companyError)
      return { success: false, error: 'Failed to create company' }
    }

    console.log('✅ Company created:', company.id)

    // Create user record
    const { error: userError } = await supabase
      .from('users')
      .insert({
        auth_user_id: user.id,
        email: user.email!,
        first_name: userName.split(' ')[0],
        last_name: userName.split(' ')[1] || '',
        company_id: company.id,
        role: 'admin',
        onboarding_completed: true,
      })

    if (userError) {
      console.error('❌ Error creating user:', userError)
      return { success: false, error: 'Failed to create user record' }
    }

    console.log('✅ User record created')

    // Create default warehouse
    const { error: warehouseError } = await supabase
      .from('warehouses')
      .insert({
        name: 'Main Warehouse',
        company_id: company.id,
        created_by: user.id,
      })

    if (warehouseError) {
      console.error('⚠️ Error creating warehouse:', warehouseError)
      // Don't fail if warehouse creation fails
    } else {
      console.log('✅ Warehouse created')
    }

    console.log('🎉 User setup complete!')
    return { success: true, companyId: company.id }
  } catch (error: any) {
    console.error('❌ Unexpected error in setupNewUser:', error)
    return { success: false, error: error.message || 'Setup failed' }
  }
}
