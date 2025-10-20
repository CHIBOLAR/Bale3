'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Automatically sign in to demo account without OTP
 */
export async function signInToDemo() {
  try {
    console.log('🔐 Starting demo login...')

    const supabase = await createClient()

    // Verify Supabase client was created successfully
    if (!supabase) {
      console.error('❌ Failed to create Supabase client')
      return { error: 'Failed to initialize authentication' }
    }

    // Demo account credentials (separate from superadmin)
    const DEMO_EMAIL = 'demo@bale.inventory'
    const DEMO_PASSWORD = 'demo1234'

    console.log('🔐 Attempting sign in for:', DEMO_EMAIL)

    // Sign in with password (no OTP needed)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    })

    if (error) {
      console.error('❌ Demo login error:', {
        message: error.message,
        status: error.status,
        name: error.name,
      })

      // Provide more specific error messages
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'Demo account credentials are invalid. Please contact support.' }
      }
      if (error.message.includes('Email not confirmed')) {
        return { error: 'Demo account email not confirmed. Please contact support.' }
      }

      return { error: `Authentication failed: ${error.message}` }
    }

    if (!data.user) {
      console.error('❌ No user data returned after sign in')
      return { error: 'Failed to sign in to demo account' }
    }

    if (!data.session) {
      console.error('❌ No session created after sign in')
      return { error: 'Failed to create session' }
    }

    console.log('✅ Demo login successful:', {
      userId: data.user.id,
      email: data.user.email,
      hasSession: !!data.session,
    })

    // Redirect will happen after this function returns
    return { success: true }

  } catch (error: any) {
    console.error('❌ Critical error in demo login:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })
    return { error: `System error: ${error.message || 'Unknown error occurred'}` }
  }
}
