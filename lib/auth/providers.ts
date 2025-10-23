import { createClient } from '@/lib/supabase/client'

/**
 * Sign in with Google OAuth
 * @param redirectTo - URL to redirect to after authentication (defaults to /dashboard)
 */
export async function signInWithGoogle(redirectTo: string = '/dashboard') {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Sign up with Email OTP
 * @param email - User's email address
 */
export async function signUpWithEmailOTP(email: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Sign in with Email OTP
 * @param email - User's email address
 */
export async function signInWithEmailOTP(email: string) {
  const supabase = createClient()

  const { data, error} = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // Don't create user on login
    },
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Verify OTP code
 * @param email - User's email address
 * @param token - OTP code
 */
export async function verifyOTP(email: string, token: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

/**
 * Get the current user session
 */
export async function getSession() {
  const supabase = createClient()

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return data.session
}
