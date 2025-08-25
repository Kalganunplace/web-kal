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
  '/login': {
    path: '/login',
    type: 'auth-only',
    title: '로그인',
    redirectOnAuth: '/'
  },
  '/signup': {
    path: '/signup',
    type: 'auth-only',
    title: '회원가입',
    redirectOnAuth: '/'
  },

  // 보호된 페이지 - 로그인 필수
  '/profile': {
    path: '/profile',
    type: 'protected',
    title: '내 정보',
    guestFallback: '/login'
  },
  '/member-info': {
    path: '/member-info',
    type: 'protected',
    title: '회원 정보',
    guestFallback: '/login'
  },
  '/subscription': {
    path: '/subscription',
    type: 'protected',
    title: '구독 관리',
    guestFallback: '/login'
  },
  '/coupons': {
    path: '/coupons',
    type: 'protected',
    title: '내 쿠폰',
    guestFallback: '/login'
  },
  '/usage-history': {
    path: '/usage-history',
    type: 'protected',
    title: '이용 내역',
    guestFallback: '/login'
  },
  '/address-settings': {
    path: '/address-settings',
    type: 'protected',
    title: '주소 설정',
    guestFallback: '/login'
  },
  '/app-settings': {
    path: '/app-settings',
    type: 'protected',
    title: '앱 설정',
    guestFallback: '/login'
  },

  // 하이브리드 페이지 - 로그인 여부에 따라 다른 UX
  '/knife-request': {
    path: '/knife-request',
    type: 'hybrid',
    title: '칼갈이 신청',
    description: '게스트도 신청 가능, 결제시 로그인 유도'
  },
  '/notifications': {
    path: '/notifications',
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
  return config?.guestFallback || '/login'
}

export const getAuthRedirect = (path: string): string => {
  const config = getRouteConfig(path)
  return config?.redirectOnAuth || '/'
}