import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthUser, useAuthLoading } from '@/stores/auth-store'
import { getRouteConfig, isProtectedRoute, isAuthOnlyRoute } from '@/lib/route-config'

/**
 * 인증 상태에 따른 자동 리다이렉트를 처리하는 훅
 */
export function useAuthRedirect() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const user = useAuthUser()
  const loading = useAuthLoading()

  useEffect(() => {
    if (loading) return // 로딩 중에는 리다이렉트하지 않음

    const config = getRouteConfig(pathname)
    
    // 보호된 라우트에 비로그인 사용자가 접근한 경우
    if (isProtectedRoute(pathname) && !user) {
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
      router.push(loginUrl)
      return
    }

    // 인증 전용 라우트에 로그인된 사용자가 접근한 경우
    if (isAuthOnlyRoute(pathname) && user) {
      const redirect = searchParams.get('redirect')
      const targetUrl = redirect && redirect !== pathname ? redirect : config?.redirectOnAuth || '/'
      router.push(targetUrl)
      return
    }
  }, [user, loading, pathname, router, searchParams])

  return { user, loading }
}

/**
 * 특정 조건에서만 리다이렉트하는 훅
 */
export function useConditionalRedirect(condition: boolean, redirectTo: string, delay = 0) {
  const router = useRouter()

  useEffect(() => {
    if (condition) {
      if (delay > 0) {
        const timer = setTimeout(() => {
          router.push(redirectTo)
        }, delay)
        return () => clearTimeout(timer)
      } else {
        router.push(redirectTo)
      }
    }
  }, [condition, redirectTo, delay, router])
}