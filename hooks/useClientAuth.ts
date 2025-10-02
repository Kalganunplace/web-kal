"use client"

import { useClientAuth as useClientAuthStore } from '@/stores/auth-store'
import { useRouter } from 'next/navigation'

export function useClientAuth() {
  const { user, loading, isAuthenticated, signIn, signUp, signOut } = useClientAuthStore()
  const router = useRouter()

  const login = async (phone: string, verificationCode: string) => {
    const result = await signIn(phone, verificationCode)
    return result
  }

  const register = async (phone: string, name: string, verificationCode: string) => {
    const result = await signUp(phone, name, verificationCode)
    return result
  }

  const logout = async () => {
    await signOut()
    router.push('/')
  }

  const requireAuth = () => {
    if (!user) {
      router.push('/client/login')
      throw new Error('Authentication required')
    }
    return user
  }

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    requireAuth
  }
}
