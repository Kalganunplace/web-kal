import { useAuthUser, useAuthLoading } from '@/stores/auth-store'
import { useRouter } from 'next/navigation'

/**
 * 인증 상태에 따라 다른 동작을 수행하는 훅
 */
export function useAuthAware() {
  const user = useAuthUser()
  const loading = useAuthLoading()
  const router = useRouter()

  /**
   * 인증 상태에 따라 다른 액션을 실행
   */
  const executeWithAuth = (
    authenticatedAction: () => void,
    guestAction?: () => void,
    promptMessage?: string
  ) => {
    if (loading) return

    if (user) {
      authenticatedAction()
    } else {
      if (guestAction) {
        guestAction()
      } else {
        // 기본 로그인 프롬프트
        const message = promptMessage || '이 기능을 사용하려면 로그인이 필요합니다.'
        const shouldLogin = confirm(`${message} 로그인하시겠습니까?`)

        if (shouldLogin) {
          const currentPath = window.location.pathname
          router.push(`/client/login?redirect=${encodeURIComponent(currentPath)}`)
        }
      }
    }
  }

  /**
   * 인증 상태에 따른 네비게이션
   */
  const navigateWithAuth = (
    authenticatedRoute: string,
    guestRoute?: string,
    forceLogin = false
  ) => {
    if (loading) return

    if (user) {
      router.push(authenticatedRoute)
    } else if (guestRoute && !forceLogin) {
      router.push(guestRoute)
    } else {
      router.push(`/client/login?redirect=${encodeURIComponent(authenticatedRoute)}`)
    }
  }

  /**
   * 조건부 렌더링을 위한 컴포넌트 반환
   */
  const renderAuthAware = <T,>(
    authenticatedComponent: T,
    guestComponent?: T,
    loadingComponent?: T
  ): T | null => {
    if (loading) {
      return loadingComponent || null
    }

    if (user) {
      return authenticatedComponent
    } else {
      return guestComponent || null
    }
  }

  /**
   * 사용자 권한 체크
   */
  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    // 추후 권한 시스템 구현시 사용
    // return user.permissions?.includes(permission) || false
    return true
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isGuest: !user && !loading,
    executeWithAuth,
    navigateWithAuth,
    renderAuthAware,
    hasPermission
  }
}