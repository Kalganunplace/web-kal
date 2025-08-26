import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AuthUser, supabase } from '@/lib/auth/supabase'
import { useMemo } from 'react'

interface AuthState {
  // State
  user: AuthUser | null
  loading: boolean
  hydrated: boolean // Zustand persist가 완료되었는지 여부
  
  // Actions
  signIn: (phone: string, verificationCode: string) => Promise<{ success: boolean; error?: string }>
  signUp: (phone: string, name: string, verificationCode: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => void
  initialize: () => void
  
  // Internal actions
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  setHydrated: (hydrated: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      loading: true,
      hydrated: false,
      
      // Initialize auth state
      initialize: () => {
        set({ loading: false })
      },
      
      // Sign in with phone verification
      signIn: async (phone: string, verificationCode: string) => {
        try {
          const response = await supabase.signIn(phone, verificationCode)
          
          if (response.success && response.data) {
            set({ user: response.data })
            // 쿠키에도 인증 상태 저장 (미들웨어에서 사용)
            document.cookie = `auth-token=${response.data.id}; path=/; max-age=${60 * 60 * 24 * 7}` // 7일
            return { success: true }
          } else {
            return { success: false, error: response.error || '로그인에 실패했습니다.' }
          }
        } catch (error) {
          console.error('로그인 오류:', error)
          return { success: false, error: '로그인 처리 중 오류가 발생했습니다.' }
        }
      },
      
      // Sign up with phone verification
      signUp: async (phone: string, name: string, verificationCode: string) => {
        try {
          const response = await supabase.signUp(phone, name, verificationCode)
          
          if (response.success && response.data) {
            set({ user: response.data })
            // 쿠키에도 인증 상태 저장
            document.cookie = `auth-token=${response.data.id}; path=/; max-age=${60 * 60 * 24 * 7}` // 7일
            return { success: true }
          } else {
            return { success: false, error: response.error || '회원가입에 실패했습니다.' }
          }
        } catch (error) {
          console.error('회원가입 오류:', error)
          return { success: false, error: '회원가입 처리 중 오류가 발생했습니다.' }
        }
      },
      
      // Sign out
      signOut: () => {
        set({ user: null })
        
        // 모든 인증 관련 쿠키 삭제
        if (typeof document !== 'undefined') {
          // auth-token 쿠키 삭제
          document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
          
          // 모든 Supabase 관련 쿠키 삭제
          const cookies = document.cookie.split(';')
          cookies.forEach(cookie => {
            const [name] = cookie.trim().split('=')
            if (name.includes('sb-') && name.includes('auth-token')) {
              document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`
              // 도메인별로도 삭제 시도
              document.cookie = `${name}=; path=/; domain=localhost; expires=Thu, 01 Jan 1970 00:00:01 GMT`
              document.cookie = `${name}=; path=/; domain=.localhost; expires=Thu, 01 Jan 1970 00:00:01 GMT`
            }
          })
        }
      },
      
      // Internal state setters
      setUser: (user: AuthUser | null) => set({ user }),
      setLoading: (loading: boolean) => set({ loading }),
      setHydrated: (hydrated: boolean) => set({ hydrated }),
    }),
    {
      name: 'auth-storage', // localStorage key
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
          state.setLoading(false)
          state.setHydrated(true)
          
          // 쿠키와 localStorage 동기화 확인
          if (state.user && typeof document !== 'undefined') {
            const cookieExists = document.cookie.includes('auth-token=')
            if (!cookieExists) {
              // 쿠키가 없으면 다시 설정
              document.cookie = `auth-token=${state.user.id}; path=/; max-age=${60 * 60 * 24 * 7}`
            }
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
  const signIn = useAuthStore((state) => state.signIn)
  const signUp = useAuthStore((state) => state.signUp)
  const signOut = useAuthStore((state) => state.signOut)
  
  return useMemo(() => ({ 
    user, loading, hydrated, signIn, signUp, signOut 
  }), [user, loading, hydrated, signIn, signUp, signOut])
}

// Individual selectors for even better performance
export const useAuthUser = () => useAuthStore((state) => state.user)
export const useAuthLoading = () => useAuthStore((state) => state.loading)
export const useAuthHydrated = () => useAuthStore((state) => state.hydrated)
export const useAuthActions = () => {
  const signIn = useAuthStore((state) => state.signIn)
  const signUp = useAuthStore((state) => state.signUp) 
  const signOut = useAuthStore((state) => state.signOut)
  
  return useMemo(() => ({
    signIn,
    signUp,
    signOut,
  }), [signIn, signUp, signOut])
}

// Helper function for auth guards
export const useIsAuthenticated = () => {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const hydrated = useAuthStore((state) => state.hydrated)
  
  return useMemo(() => ({
    isAuthenticated: !!user,
    isLoading: loading || !hydrated,
    user,
    hydrated,
  }), [user, loading, hydrated])
}