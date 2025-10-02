export type RouteType = 'public' | 'protected' | 'hybrid' | 'auth-only'

export interface RouteConfig {
  path: string
  type: RouteType
  title: string
  description?: string
  requiredPermissions?: string[]
  redirectOnAuth?: string // 로그인된 사용자가 접근시 리다이렉트할 경로
  guestFallback?: string // 비로그인 사용자 대체 경로
}

export const ROUTE_CONFIG: Record<string, RouteConfig> = {
  // 공개 페이지 - 누구나 접근 가능
  '/': {
    path: '/',
    type: 'hybrid',
    title: '홈',
    description: '로그인 여부에 따라 개인화된 홈페이지'
  },
  '/price-list': {
    path: '/price-list',
    type: 'public',
    title: '가격표'
  },
  '/guide': {
    path: '/guide',
    type: 'public',
    title: '이용 가이드'
  },
  '/notices': {
    path: '/notices',
    type: 'public',
    title: '공지사항'
  },
  '/customer-service': {
    path: '/customer-service',
    type: 'public',
    title: '고객센터'
  },

  // 인증 전용 페이지 - 로그인된 사용자만 리다이렉트
  '/client/login': {
    path: '/client/login',
    type: 'auth-only',
    title: '로그인',
    redirectOnAuth: '/'
  },
  '/client/signup': {
    path: '/client/signup',
    type: 'auth-only',
    title: '회원가입',
    redirectOnAuth: '/'
  },

  // 보호된 페이지 - 로그인 필수 (클라이언트)
  '/client/profile': {
    path: '/client/profile',
    type: 'protected',
    title: '내 정보',
    guestFallback: '/client/login'
  },
  '/client/member-info': {
    path: '/client/member-info',
    type: 'protected',
    title: '회원 정보',
    guestFallback: '/client/login'
  },
  '/client/subscription': {
    path: '/client/subscription',
    type: 'protected',
    title: '구독 관리',
    guestFallback: '/client/login'
  },
  '/client/coupons': {
    path: '/client/coupons',
    type: 'protected',
    title: '내 쿠폰',
    guestFallback: '/client/login'
  },
  '/client/usage-history': {
    path: '/client/usage-history',
    type: 'protected',
    title: '이용 내역',
    guestFallback: '/client/login'
  },
  '/client/address-settings': {
    path: '/client/address-settings',
    type: 'protected',
    title: '주소 설정',
    guestFallback: '/client/login'
  },
  '/client/app-settings': {
    path: '/client/app-settings',
    type: 'protected',
    title: '앱 설정',
    guestFallback: '/client/login'
  },

  // 하이브리드 페이지 - 로그인 여부에 따라 다른 UX
  '/client/knife-request': {
    path: '/client/knife-request',
    type: 'hybrid',
    title: '칼갈이 신청',
    description: '게스트도 신청 가능, 결제시 로그인 유도'
  },
  '/client/notifications': {
    path: '/client/notifications',
    type: 'hybrid',
    title: '알림',
    description: '로그인시 개인 알림, 비로그인시 일반 공지'
  }
}

export const getRouteConfig = (path: string): RouteConfig | undefined => {
  return ROUTE_CONFIG[path]
}

export const isProtectedRoute = (path: string): boolean => {
  const config = getRouteConfig(path)
  return config?.type === 'protected'
}

export const isAuthOnlyRoute = (path: string): boolean => {
  const config = getRouteConfig(path)
  return config?.type === 'auth-only'
}

export const isHybridRoute = (path: string): boolean => {
  const config = getRouteConfig(path)
  return config?.type === 'hybrid'
}

export const getGuestFallback = (path: string): string => {
  const config = getRouteConfig(path)
  return config?.guestFallback || '/client/login'
}

export const getAuthRedirect = (path: string): string => {
  const config = getRouteConfig(path)
  return config?.redirectOnAuth || '/'
}