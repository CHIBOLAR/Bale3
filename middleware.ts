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

  // Redirect authenticated users away from auth pages
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Add security headers
  const headers = new Headers(response.headers)

  // Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self' data:;
    connect-src 'self' https://*.supabase.co https://vercel.live wss://*.supabase.co https://vitals.vercel-insights.com;
    frame-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim()

  headers.set('Content-Security-Policy', cspHeader)

  // HTTP Strict Transport Security (HSTS)
  headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  )

  // X-Frame-Options (clickjacking protection)
  headers.set('X-Frame-Options', 'DENY')

  // X-Content-Type-Options (MIME sniffing protection)
  headers.set('X-Content-Type-Options', 'nosniff')

  // Referrer Policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions Policy
  headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  // Cross-Origin-Opener-Policy
  headers.set('Cross-Origin-Opener-Policy', 'same-origin')

  // Cross-Origin-Resource-Policy
  headers.set('Cross-Origin-Resource-Policy', 'same-origin')

  // Optimize cache headers for bfcache (back/forward cache)
  const pathname = request.nextUrl.pathname
  const isApiRoute = pathname.startsWith('/api/')
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup')

  if (!isApiRoute && !isAuthRoute) {
    // Use no-cache instead of no-store to enable bfcache
    headers.set('Cache-Control', 'private, no-cache, must-revalidate')
  } else if (isApiRoute || isAuthRoute) {
    // Only use no-store for sensitive routes
    headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate, max-age=0')
  }

  return NextResponse.next({
    request: {
      headers: request.headers,
    },
    headers
  })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
