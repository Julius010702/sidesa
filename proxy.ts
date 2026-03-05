import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)

const ADMIN_ROLES = ['ADMIN_DESA', 'SEKDES', 'KASI_PELAYANAN', 'KAUR_UMUM', 'RT_RW']
const WARGA_ROUTES = ['/dashboard', '/surat', '/pengaduan', '/bansos', '/profil', '/chat']
const ADMIN_ROUTES = ['/admin']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('sidesaa_token')?.value

  const isWargaRoute = WARGA_ROUTES.some((route) => pathname.startsWith(route))
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route))

  if (!isWargaRoute && !isAdminRoute) {
    return NextResponse.next()
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const role = payload.role as string

    if (isAdminRoute && !ADMIN_ROLES.includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (isWargaRoute && ADMIN_ROLES.includes(role)) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    return NextResponse.next()
  } catch {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('sidesaa_token')
    return response
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/surat/:path*',
    '/pengaduan/:path*',
    '/bansos/:path*',
    '/profil/:path*',
    '/chat/:path*',
    '/admin/:path*',
  ],
}