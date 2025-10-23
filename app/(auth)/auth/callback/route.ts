import { createClient } from '@/lib/supabase/server'
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

      // Check if user has completed onboarding
      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', data.user.id)
          .single()

        if (userError) {
          console.error('Error fetching user data:', userError)
        }

        // If user hasn't completed onboarding, redirect to onboarding
        if (!userData?.onboarding_completed) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }

      // Redirect to the next URL or dashboard
      return NextResponse.redirect(`${origin}${next}`)
    } catch (error) {
      console.error('Unexpected error in OAuth callback:', error)
      return NextResponse.redirect(`${origin}/login?error=unexpected_error`)
    }
  }

  // If no code present, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=no_code_provided`)
}
