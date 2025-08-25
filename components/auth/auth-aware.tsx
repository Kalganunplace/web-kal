"use client"

import { useAuthUser, useAuthLoading } from '@/stores/auth-store'

interface AuthAwareProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  loadingFallback?: React.ReactNode
  requireAuth?: boolean
  showPrompt?: boolean
}

/**
 * 인증 상태에 따라 다른 컴포넌트를 렌더링하는 래퍼
 */
export function AuthAware({ 
  children, 
  fallback, 
  loadingFallback,
  requireAuth = false,
  showPrompt = false 
}: AuthAwareProps) {
  const user = useAuthUser()
  const loading = useAuthLoading()

  if (loading) {
    return (
      <>
        {loadingFallback || (
          <div className="flex items-center justify-center p-4">
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </>
    )
  }

  if (!user) {
    if (requireAuth) {
      return (
        <>
          {fallback || (
            showPrompt ? (
              <LoginPrompt />
            ) : null
          )}
        </>
      )
    }
    
    return <>{fallback || children}</>
  }

  return <>{children}</>
}

/**
 * 인증된 사용자에게만 표시되는 컴포넌트
 */
export function AuthenticatedOnly({ 
  children, 
  fallback, 
  showPrompt = false 
}: Omit<AuthAwareProps, 'requireAuth'>) {
  return (
    <AuthAware requireAuth showPrompt={showPrompt} fallback={fallback}>
      {children}
    </AuthAware>
  )
}

/**
 * 게스트 사용자에게만 표시되는 컴포넌트
 */
export function GuestOnly({ children }: { children: React.ReactNode }) {
  const user = useAuthUser()
  const loading = useAuthLoading()

  if (loading || user) return null

  return <>{children}</>
}

/**
 * 로그인 프롬프트 컴포넌트
 */
function LoginPrompt() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl">🔐</span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">로그인이 필요해요</h3>
      <p className="text-gray-600 mb-6">이 기능을 사용하려면 로그인이 필요합니다.</p>
      <button
        onClick={() => {
          const currentPath = window.location.pathname
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
        }}
        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        로그인하기
      </button>
    </div>
  )
}