'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Automatically sign in to demo account without OTP
 */
export async function signInToDemo() {
  try {
    const supabase = await createClient()

    // Demo account credentials (separate from superadmin)
    const DEMO_EMAIL = 'demo@bale.inventory'
    const DEMO_PASSWORD = 'demo1234' // This should be configured in Supabase

    // Sign in with password (no OTP needed)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    })

    if (error) {
      console.error('Demo login error:', error)
      return { error: error.message }
    }

    if (!data.user) {
      return { error: 'Failed to sign in to demo account' }
    }

    console.log('✅ Demo login successful')

    // Redirect will happen after this function returns
    return { success: true }

  } catch (error: any) {
    console.error('Error in demo login:', error)
    return { error: error.message }
  }
}
