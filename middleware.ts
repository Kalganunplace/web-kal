import { JWTService } from '@/lib/auth/jwt'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// 클라이언트 인증이 필요한 라우트 정의
const CLIENT_PROTECTED_ROUTES = [
  '/client/profile',
  '/client/member-info',
  '/client/subscription',
  '/client/coupons',
  '/client/usage-history',
  '/client/address-settings',
  '/client/app-settings'
]

// 관리자 인증이 필요한 라우트 정의
const ADMIN_PROTECTED_ROUTES = [
  '/admin'
]

// 로그인된 사용자가 접근하면 안되는 라우트
const AUTH_ROUTES = [
  '/client/login',
  '/client/signup',
  '/admin/login'
]

// 게스트도 접근 가능하지만 로그인 시 다른 경험을 제공하는 라우트
const HYBRID_ROUTES = [
  '/client',
  '/client/knife-request'
]

export async function middleware(request: NextRequest) {
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

  // JWT 토큰 검증
  const authCookie = request.cookies.get('auth-token')
  let userInfo = null

  if (authCookie?.value) {
    try {
      userInfo = await JWTService.verifyToken(authCookie.value)
      if (!userInfo) {
        console.log('JWT token verification failed - token is invalid')
      }
    } catch (error) {
      console.error('JWT verification failed in middleware:', error)
    }
  }

  const isAuthenticated = !!userInfo
  const userType = userInfo?.userType

  // 무효한 토큰이 있으면 쿠키 삭제
  const response = NextResponse.next()
  if (authCookie?.value && !userInfo) {
    console.log('Clearing invalid JWT token cookie')
    response.cookies.delete('auth-token')
  }

  // 클라이언트 보호된 라우트 접근 제어
  if (CLIENT_PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    console.log(`[Middleware] Client protected route: ${pathname}`, {
      isAuthenticated,
      userType,
      hasToken: !!authCookie?.value
    })
    

    if (!isAuthenticated) {
      // 인증되지 않은 사용자 → 로그인 페이지
      console.log(`[Middleware] Not authenticated, redirecting to /client/login`)
      const loginUrl = new URL('/client/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    } else if (userType !== 'client') {
      // 관리자가 클라이언트 페이지 접근 시도 → 통과시켜서 페이지에서 모달 처리
      console.log(`[Middleware] User is ${userType}, passing through for modal`)
      return response // 명시적 반환
    }
    // 클라이언트 인증됨 - 계속 진행
    console.log(`[Middleware] Client authenticated, allowing access`)
  }

  // 관리자 보호된 라우트 접근 제어
  if (ADMIN_PROTECTED_ROUTES.some(route => pathname.startsWith(route)) && pathname !== '/admin/login') {
    if (!isAuthenticated) {
      // 인증되지 않은 사용자 → 관리자 로그인 페이지
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    } else if (userType !== 'admin') {
      // 클라이언트가 관리자 페이지 접근 시도 → 통과시켜서 페이지에서 모달 처리
      return response // 명시적 반환
    }
    // 관리자 인증됨 - 계속 진행
  }

  // 인증된 사용자가 로그인/회원가입 페이지에 접근하는 경우
  if (AUTH_ROUTES.includes(pathname) && isAuthenticated) {
    const redirectTo = request.nextUrl.searchParams.get('redirect') || '/client'

    // 관리자 로그인 페이지
    if (pathname === '/admin/login') {
      if (userType === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      } else {
        // 클라이언트가 관리자 로그인 페이지 접근 → 통과시켜서 페이지에서 모달 처리
        return response
      }
    }

    // 클라이언트 로그인/회원가입 페이지
    if (pathname === '/client/login' || pathname === '/client/signup') {
      if (userType === 'client') {
        return NextResponse.redirect(new URL(redirectTo, request.url))
      } else {
        // 관리자가 클라이언트 로그인 페이지 접근 → 통과시켜서 페이지에서 모달 처리
        return response
      }
    }
  }

  // 하이브리드 라우트의 경우 헤더에 인증 상태 전달
  if (HYBRID_ROUTES.includes(pathname)) {
    response.headers.set('x-user-authenticated', isAuthenticated ? '1' : '0')
    response.headers.set('x-user-type', userType || 'guest')
    return response
  }

  return response
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
