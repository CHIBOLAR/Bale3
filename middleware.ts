import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Check if there are any Supabase auth cookies before attempting to get user
  const authCookies = request.cookies.getAll().filter(cookie =>
    cookie.name.startsWith('sb-') &&
    (cookie.name.includes('auth-token') || cookie.name.includes('access-token'))
  )

  let user = null

  if (authCookies.length > 0) {
    // Only attempt to get user if auth cookies exist
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser
  }

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check onboarding status for authenticated users
  if (user && !request.nextUrl.pathname.startsWith('/onboarding')) {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('auth_user_id', user.id)
        .single()

      // Redirect to onboarding if not completed
      if (userData && !userData.onboarding_completed) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    } catch (error) {
      // If user record doesn't exist, redirect to onboarding
      if (!request.nextUrl.pathname.startsWith('/onboarding')) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }
  }

  // Redirect authenticated users away from auth pages
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && user) {
    // Check if they've completed onboarding
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('auth_user_id', user.id)
        .single()

      if (userData && !userData.onboarding_completed) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    } catch (error) {
      // If user record doesn't exist, redirect to onboarding
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
