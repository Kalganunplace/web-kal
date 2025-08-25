import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 인증이 필요한 라우트 정의
const PROTECTED_ROUTES = [
  '/profile',
  '/member-info',
  '/subscription', 
  '/coupons',
  '/usage-history',
  '/address-settings',
  '/app-settings'
]

// 로그인된 사용자가 접근하면 안되는 라우트
const AUTH_ROUTES = [
  '/login',
  '/signup'
]

// 게스트도 접근 가능하지만 로그인 시 다른 경험을 제공하는 라우트
const HYBRID_ROUTES = [
  '/',
  '/knife-request'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 정적 파일과 API 라우트 제외
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // 파일 확장자가 있는 경우
  ) {
    return NextResponse.next()
  }

  // localStorage에서 인증 상태 확인 (클라이언트에서 처리해야 함)
  // 미들웨어에서는 쿠키나 헤더로 인증 상태를 확인해야 함
  const authCookie = request.cookies.get('auth-token')
  const isAuthenticated = !!authCookie?.value

  // 보호된 라우트에 인증되지 않은 사용자가 접근하는 경우
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 인증된 사용자가 로그인/회원가입 페이지에 접근하는 경우
  if (AUTH_ROUTES.includes(pathname) && isAuthenticated) {
    const redirectTo = request.nextUrl.searchParams.get('redirect') || '/'
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  // 하이브리드 라우트의 경우 헤더에 인증 상태 전달
  if (HYBRID_ROUTES.includes(pathname)) {
    const response = NextResponse.next()
    response.headers.set('x-user-authenticated', isAuthenticated ? '1' : '0')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|.*\\..*|api).*)',
  ],
}