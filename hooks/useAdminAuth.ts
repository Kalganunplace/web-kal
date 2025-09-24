"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminAuth, AdminUser } from '@/lib/auth/admin'

export function useAdminAuth() {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const currentAdmin = adminAuth.getCurrentAdmin()
    setAdmin(currentAdmin)
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const result = await adminAuth.login({ email, password })
    if (result.success && result.admin) {
      setAdmin(result.admin)
    }
    return result
  }

  const logout = async () => {
    await adminAuth.logout()
    setAdmin(null)
    router.push('/admin/login')
  }

  const requireAuth = (): AdminUser => {
    if (!admin) {
      router.push('/admin/login')
      throw new Error('Authentication required')
    }
    return admin
  }

  const hasPermission = (permission: string): boolean => {
    return adminAuth.hasPermission(permission)
  }

  const requirePermission = (permission: string): void => {
    adminAuth.requirePermission(permission)
  }

  return {
    admin,
    isLoading,
    isAuthenticated: !!admin,
    login,
    logout,
    requireAuth,
    hasPermission,
    requirePermission
  }
}