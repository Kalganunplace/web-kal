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

        // 쿠키 확인
        const hasCookie = document.cookie.includes('auth-token')
        console.log('[Auth Store] Cookie exists:', hasCookie)

        if (!hasCookie) {
          // 쿠키가 없으면 localStorage 정리하고 종료
          console.log('[Auth Store] No cookie - clearing state')
          set({ user: null, loading: false, hydrated: true })
          localStorage.removeItem('auth-storage-v2')
          return
        }

        // 쿠키가 있으면 서버에서 사용자 정보 가져오기
        try {
          console.log('[Auth Store] Fetching user from /api/auth/me')
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store'
          })

          if (response.ok) {
            const data = await response.json()
            console.log('[Auth Store] Server response:', data)

            if (data.success && data.user) {
              set({ user: data.user, loading: false, hydrated: true })
              console.log('[Auth Store] User authenticated:', data.user.id)
            } else {
              // 응답은 성공했지만 user가 없는 경우
              console.log('[Auth Store] No user in response - clearing state')
              set({ user: null, loading: false, hydrated: true })
              localStorage.removeItem('auth-storage-v2')
            }
          } else {
            // 401 등 인증 실패한 경우 - localStorage 정리
            console.log('[Auth Store] Auth failed with status:', response.status)
            set({ user: null, loading: false, hydrated: true })
            localStorage.removeItem('auth-storage-v2')
          }
        } catch (error) {
          console.error('[Auth Store] Initialization error:', error)
          set({ user: null, loading: false, hydrated: true })
          localStorage.removeItem('auth-storage-v2')
        }
      },

      // 클라이언트 로그인
      signInClient: async (phone: string, verificationCode: string) => {
        try {
          const response = await fetch('/api/auth/client/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ phone, verificationCode })
          })

          const data = await response.json()

          if (data.success && data.user) {
            set({ user: data.user })
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
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Auth rehydration error:', error)
          return
        }

        if (state) {
          console.log('Auth rehydration completed:', state.user)
          state.setHydrated(true)
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
