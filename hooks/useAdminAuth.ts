"use client"

import { useAdminAuth as useAdminAuthStore } from '@/stores/auth-store'
import { useRouter } from 'next/navigation'

export function useAdminAuth() {
  const { user: admin, loading: isLoading, isAuthenticated, signIn, signOut, hasPermission } = useAdminAuthStore()
  const router = useRouter()

  const login = async (email: string, password: string) => {
    const result = await signIn(email, password)
    return result
  }

  const logout = async () => {
    await signOut()
    router.push('/admin/login')
  }

  const requireAuth = () => {
    if (!admin) {
      router.push('/admin/login')
      throw new Error('Authentication required')
    }
    return admin
  }

  const requirePermission = (permission: string): void => {
    if (!hasPermission(permission)) {
      throw new Error(`Permission required: ${permission}`)
    }
  }

  return {
    admin,
    isLoading,
    isAuthenticated,
    login,
    logout,
    requireAuth,
    hasPermission,
    requirePermission
  }
}
