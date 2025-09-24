"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { toast } from 'sonner'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { admin, isLoading, isAuthenticated, logout } = useAdminAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [isLoading, isAuthenticated, pathname, router])

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('로그아웃되었습니다.')
    } catch (error) {
      toast.error('로그아웃 중 오류가 발생했습니다.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated && pathname === '/admin/login') {
    return <>{children}</>
  }
  
  if (!isAuthenticated) {
    return null // 인증되지 않은 경우 아무것도 렌더링하지 않음 (리다이렉트가 처리됨)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-2 rounded">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{admin?.name}</p>
                <p className="text-sm text-gray-500">
                  {admin?.role === 'super_admin' ? '최고관리자' : 
                   admin?.role === 'admin' ? '관리자' : '직원'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}