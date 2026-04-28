import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/login', '/register', '/auth/callback', '/pending', '/demo']

export async function middleware(request: NextRequest) {
  // Bypass all auth logic when Supabase is not configured (local UI preview)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Allow public routes without auth
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r))

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && !isPublic) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_approved, role')
      .eq('id', user.id)
      .single()

    // Gate: unapproved members go to /pending (admins bypass)
    if (profile && !profile.is_approved && profile.role !== 'admin' && pathname !== '/pending') {
      const url = request.nextUrl.clone()
      url.pathname = '/pending'
      return NextResponse.redirect(url)
    }

    // Redirect approved users away from /pending
    if (profile?.is_approved && pathname === '/pending') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Authenticated users visiting landing page → go to dashboard
  if (user && pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|.*\\.png$).*)'],
}
