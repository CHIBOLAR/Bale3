/**
 * Setup Demo User Account
 *
 * This script creates the demo@bale.inventory user in Supabase Auth
 * and links it to the demo company.
 *
 * Run with: npx tsx scripts/setup-demo-user.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const DEMO_EMAIL = 'demo@bale.inventory'
const DEMO_PASSWORD = 'demo1234'
const DEMO_COMPANY_ID = '1ea3bca1-fc04-46ac-8d0e-0c246fa608e9'

async function setupDemoUser() {
  // Create admin client with service role
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log('🚀 Setting up demo user account...')
  console.log('Email:', DEMO_EMAIL)

  // Check if user already exists
  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error('❌ Error listing users:', listError)
    process.exit(1)
  }

  const existingUser = existingUsers.users.find(u => u.email === DEMO_EMAIL)

  let authUserId: string

  if (existingUser) {
    console.log('✅ Demo user already exists in auth')
    authUserId = existingUser.id

    // Update password to ensure it's correct
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      authUserId,
      { password: DEMO_PASSWORD }
    )

    if (updateError) {
      console.error('❌ Error updating password:', updateError)
    } else {
      console.log('✅ Password updated')
    }
  } else {
    // Create new auth user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: {
        is_demo: true,
      },
    })

    if (createError) {
      console.error('❌ Error creating user:', createError)
      process.exit(1)
    }

    if (!newUser.user) {
      console.error('❌ User creation failed')
      process.exit(1)
    }

    authUserId = newUser.user.id
    console.log('✅ Auth user created:', authUserId)
  }

  // Link user to demo company in users table
  const { error: upsertError } = await supabase
    .from('users')
    .upsert({
      auth_user_id: authUserId,
      company_id: DEMO_COMPANY_ID,
      email: DEMO_EMAIL,
      first_name: 'Demo',
      last_name: 'User',
      phone_number: '+919999999999', // Demo phone number
      role: 'admin',
      is_active: true,
      is_demo: true,
    }, {
      onConflict: 'auth_user_id',
    })

  if (upsertError) {
    console.error('❌ Error linking user to company:', upsertError)
    process.exit(1)
  }

  console.log('✅ User linked to demo company')
  console.log('\n🎉 Demo user setup complete!')
  console.log('\nDemo Login Credentials:')
  console.log('  Email:', DEMO_EMAIL)
  console.log('  Password:', DEMO_PASSWORD)
  console.log('\nYou can now use the "Try Demo" button on the homepage.')
}

setupDemoUser().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
