import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthUser, useAuthLoading } from '@/stores/auth-store'

interface UseRequireAuthOptions {
  redirectTo?: string
  redirectDelay?: number
  showLoginPrompt?: boolean
}

/**
 * 인증이 필요한 페이지/컴포넌트에서 사용하는 훅
 * 비로그인 시 자동 리다이렉트 또는 로그인 프롬프트 표시
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const {
    redirectTo = '/login',
    redirectDelay = 0,
    showLoginPrompt = false
  } = options

  const router = useRouter()
  const user = useAuthUser()
  const loading = useAuthLoading()

  useEffect(() => {
    if (!loading && !user && !showLoginPrompt) {
      const currentPath = window.location.pathname
      const targetUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`
      
      if (redirectDelay > 0) {
        setTimeout(() => {
          router.push(targetUrl)
        }, redirectDelay)
      } else {
        router.push(targetUrl)
      }
    }
  }, [user, loading, redirectTo, redirectDelay, showLoginPrompt, router])

  return {
    user,
    loading,
    isAuthenticated: !!user,
    requiresAuth: !user && !loading
  }
}

/**
 * 로그인 프롬프트를 표시할지 결정하는 훅
 */
export function useLoginPrompt() {
  const user = useAuthUser()
  const loading = useAuthLoading()

  const showPrompt = (action: string, callback?: () => void) => {
    if (!user && !loading) {
      const shouldLogin = confirm(`${action}을 위해 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?`)
      if (shouldLogin) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
      }
      return false
    }
    
    if (callback) callback()
    return true
  }

  return {
    user,
    loading,
    showPrompt,
    isAuthenticated: !!user
  }
}