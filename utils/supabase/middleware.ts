import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Check user authentication
  // IMPORTANT: Do not use getSession() for server-side auth checks. Always use getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAccessingAdmin = request.nextUrl.pathname.startsWith('/admin')
  const isAccessingLogin = request.nextUrl.pathname === '/login'

  // If user is not logged in and tries to access admin, redirect to login
  if (!user && isAccessingAdmin) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is already logged in but tries to access login, redirect to admin
  if (user && isAccessingLogin) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
