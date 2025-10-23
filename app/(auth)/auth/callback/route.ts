import { createClient } from '@/lib/supabase/server'
import { setupNewUser } from '@/app/actions/auth/setup-new-user'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
      }

      if (!data.user) {
        return NextResponse.redirect(`${origin}/login?error=no_user_data`)
      }

      // Setup user (creates company, user record, warehouse if first time)
      const setupResult = await setupNewUser()

      if (!setupResult.success && !setupResult.alreadyExists) {
        console.error('Setup failed:', setupResult.error)
        return NextResponse.redirect(`${origin}/login?error=setup_failed`)
      }

      // Redirect to dashboard
      return NextResponse.redirect(`${origin}${next}`)
    } catch (error) {
      console.error('Unexpected error in OAuth callback:', error)
      return NextResponse.redirect(`${origin}/login?error=unexpected_error`)
    }
  }

  // If no code present, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=no_code_provided`)
}
