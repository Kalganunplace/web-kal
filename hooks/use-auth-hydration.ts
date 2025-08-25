"use client"

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Zustand persist hydration을 안전하게 처리하는 훅
 * SSR 환경에서 hydration mismatch를 방지합니다
 */
export function useAuthHydration() {
  const [hasHydrated, setHasHydrated] = useState(false)
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const hydrated = useAuthStore((state) => state.hydrated)

  useEffect(() => {
    // 클라이언트에서만 실행
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true)
    })

    // 이미 hydration이 완료된 경우
    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true)
    }

    return unsubscribe
  }, [])

  // SSR과 CSR 사이의 hydration mismatch 방지
  if (typeof window === 'undefined') {
    return {
      user: null,
      loading: true,
      isAuthenticated: false,
      isReady: false
    }
  }

  const isReady = hasHydrated && hydrated && !loading

  return {
    user: isReady ? user : null,
    loading: !isReady,
    isAuthenticated: isReady && !!user,
    isReady,
    hasHydrated
  }
}