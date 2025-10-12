import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface AuthUser {
  id: string
  type: 'client' | 'admin'
  // 클라이언트 필드
  phone?: string
  name?: string
  // 관리자 필드
  email?: string
  role?: string
  permissions?: string[]
}

interface AuthState {
  // State
  user: AuthUser | null
  loading: boolean
  hydrated: boolean

  // Actions
  signInClient: (phone: string, verificationCode: string) => Promise<{ success: boolean; error?: string }>
  signUpClient: (phone: string, name: string, verificationCode: string) => Promise<{ success: boolean; error?: string }>
  signInAdmin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<{ success: boolean }>
  initialize: () => Promise<void>
  refreshUser: () => Promise<void>

  // Internal actions
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  setHydrated: (hydrated: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      loading: true,
      hydrated: false,

      // Initialize auth state
      initialize: async () => {
        console.log('[Auth Store] Initialize called')

        // 서버 사이드에서는 아무것도 하지 않음
        if (typeof window === 'undefined') {
          console.log('[Auth Store] Server side - skipping initialization')
          set({ loading: false, hydrated: true })
          return
        }

        // 🔍 Check current state before doing anything
        const currentState = useAuthStore.getState()
        console.log('[Auth Store] Current user before initialize:', currentState.user?.id || 'null')

        // ⚠️ HttpOnly 쿠키는 document.cookie로 읽을 수 없음!
        // localStorage에 user가 있으면 서버에 검증 요청, 없으면 그냥 종료
        if (!currentState.user) {
          console.log('[Auth Store] No user in localStorage - skipping authentication check')
          set({ loading: false, hydrated: true })
          return
        }

        // localStorage에 user가 있으면 서버에서 검증
        try {
          console.log('[Auth Store] User found in localStorage - validating with server')
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store'
          })

          console.log('[Auth Store] /api/auth/me response status:', response.status)

          if (response.ok) {
            const data = await response.json()
            console.log('[Auth Store] Server response:', data)

            if (data.success && data.user) {
              // 서버에서 최신 사용자 정보로 업데이트
              set({ user: data.user, loading: false, hydrated: true })
              console.log('[Auth Store] User authenticated and updated:', data.user.id)
            } else {
              // 응답은 성공했지만 user가 없는 경우 - localStorage user 유지
              console.warn('[Auth Store] Server returned success but no user - keeping localStorage user')
              set({ loading: false, hydrated: true })
            }
          } else if (response.status === 401) {
            // 명확한 인증 실패 - localStorage 정리
            console.log('[Auth Store] Auth failed with 401 - clearing state')
            set({ user: null, loading: false, hydrated: true })
            localStorage.removeItem('auth-storage-v2')
          } else {
            // 기타 에러 (500 등) - localStorage user 유지
            console.warn('[Auth Store] Server error:', response.status, '- keeping localStorage user')
            set({ loading: false, hydrated: true })
          }
        } catch (error) {
          // 네트워크 에러 등 - localStorage user 유지
          console.error('[Auth Store] Initialization error:', error, '- keeping localStorage user')
          set({ loading: false, hydrated: true })
        }
      },

      // 클라이언트 로그인
      signInClient: async (phone: string, verificationCode: string) => {
        try {
          console.log('[Auth Store] signInClient called')
          const response = await fetch('/api/auth/client/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ phone, verificationCode })
          })

          const data = await response.json()
          console.log('[Auth Store] Login response:', data)

          if (data.success && data.user) {
            console.log('[Auth Store] Setting user in store:', data.user.id)
            set({ user: data.user })

            // 🔍 Verify localStorage write
            setTimeout(() => {
              const stored = localStorage.getItem('auth-storage-v2')
              console.log('[Auth Store] localStorage after set:', stored ? 'exists' : 'null', stored?.substring(0, 50))
            }, 100)

            return { success: true }
          } else {
            return { success: false, error: data.error || '로그인에 실패했습니다.' }
          }
        } catch (error) {
          console.error('Client login error:', error)
          return { success: false, error: '로그인 처리 중 오류가 발생했습니다.' }
        }
      },

      // 클라이언트 회원가입
      signUpClient: async (phone: string, name: string, verificationCode: string) => {
        try {
          const response = await fetch('/api/auth/client/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ phone, name, verificationCode })
          })

          const data = await response.json()

          if (data.success && data.user) {
            set({ user: data.user })
            return { success: true }
          } else {
            return { success: false, error: data.error || '회원가입에 실패했습니다.' }
          }
        } catch (error) {
          console.error('Client signup error:', error)
          return { success: false, error: '회원가입 처리 중 오류가 발생했습니다.' }
        }
      },

      // 관리자 로그인
      signInAdmin: async (username: string, password: string) => {
        try {
          const response = await fetch('/api/auth/admin/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
          })

          const data = await response.json()

          if (data.success && data.user) {
            set({ user: data.user })
            return { success: true }
          } else {
            return { success: false, error: data.error || '로그인에 실패했습니다.' }
          }
        } catch (error) {
          console.error('Admin login error:', error)
          return { success: false, error: '로그인 처리 중 오류가 발생했습니다.' }
        }
      },

      // 로그아웃
      signOut: async () => {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
          })

          // Zustand 상태 초기화
          set({ user: null })

          // localStorage 명시적 삭제
          localStorage.removeItem('auth-storage-v2')

          return { success: true }
        } catch (error) {
          console.error('Logout error:', error)
          // 에러가 발생해도 로컬 상태는 초기화
          set({ user: null })
          localStorage.removeItem('auth-storage-v2')
          return { success: false }
        }
      },

      // 사용자 정보 새로고침
      refreshUser: async () => {
        try {
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include'
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.user) {
              set({ user: data.user })
            } else {
              set({ user: null })
            }
          } else {
            set({ user: null })
          }
        } catch (error) {
          console.error('Refresh user error:', error)
          set({ user: null })
        }
      },

      // Internal state setters
      setUser: (user: AuthUser | null) => set({ user }),
      setLoading: (loading: boolean) => set({ loading }),
      setHydrated: (hydrated: boolean) => set({ hydrated }),
    }),
    {
      name: 'auth-storage-v2', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist user data, not loading state
      partialize: (state) => ({ user: state.user }),
      // Rehydrate callback
      onRehydrateStorage: () => {
        console.log('[Auth Store] onRehydrateStorage - starting rehydration')

        // Check localStorage directly
        const stored = localStorage.getItem('auth-storage-v2')
        console.log('[Auth Store] localStorage raw value:', stored)

        return (state, error) => {
          if (error) {
            console.error('[Auth Store] Rehydration error:', error)
            return
          }

          if (state) {
            console.log('[Auth Store] Rehydration completed - user:', state.user?.id || 'null')
            console.log('[Auth Store] Rehydration completed - full state:', JSON.stringify(state.user))
            state.setHydrated(true)
          } else {
            console.log('[Auth Store] Rehydration completed - no state')
          }
        }
      },
    }
  )
)

// Selectors for optimized subscriptions
export const useAuth = () => {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const hydrated = useAuthStore((state) => state.hydrated)
  const signInClient = useAuthStore((state) => state.signInClient)
  const signUpClient = useAuthStore((state) => state.signUpClient)
  const signInAdmin = useAuthStore((state) => state.signInAdmin)
  const signOut = useAuthStore((state) => state.signOut)
  const refreshUser = useAuthStore((state) => state.refreshUser)

  return {
    user,
    loading,
    hydrated,
    signInClient,
    signUpClient,
    signInAdmin,
    signOut,
    refreshUser
  }
}

// Individual selectors for even better performance
export const useAuthUser = () => useAuthStore((state) => state.user)
export const useAuthLoading = () => useAuthStore((state) => state.loading)
export const useAuthHydrated = () => useAuthStore((state) => state.hydrated)
export const useAuthActions = () => {
  const signInClient = useAuthStore((state) => state.signInClient)
  const signUpClient = useAuthStore((state) => state.signUpClient)
  const signInAdmin = useAuthStore((state) => state.signInAdmin)
  const signOut = useAuthStore((state) => state.signOut)

  return {
    signInClient,
    signUpClient,
    signInAdmin,
    signOut
  }
}

// Helper function for auth guards
export const useIsAuthenticated = () => {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const hydrated = useAuthStore((state) => state.hydrated)

  return {
    isAuthenticated: !!user,
    isLoading: loading || !hydrated,
    user,
    hydrated,
    userType: user?.type
  }
}

// 클라이언트 전용 훅
export const useClientAuth = () => {
  const { user, loading, hydrated, signInClient, signUpClient, signOut } = useAuth()

  return {
    user: user?.type === 'client' ? user : null,
    loading,
    hydrated,
    isAuthenticated: user?.type === 'client',
    signIn: signInClient,
    signUp: signUpClient,
    signOut
  }
}

// 관리자 전용 훅
export const useAdminAuth = () => {
  const { user, loading, hydrated, signInAdmin, signOut } = useAuth()

  return {
    user: user?.type === 'admin' ? user : null,
    loading,
    hydrated,
    isAuthenticated: user?.type === 'admin',
    signIn: signInAdmin,
    signOut,
    hasPermission: (permission: string) => {
      if (!user || user.type !== 'admin') return false
      if (user.role === 'super_admin') return true
      if (user.permissions?.includes('*')) return true
      return user.permissions?.includes(permission) || false
    }
  }
}
