"use client"

import { useAuth, useAuthLoading, useAuthUser } from '@/stores/auth-store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AccountSwitchModal } from './account-switch-modal'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  userType?: 'client' | 'admin'
  showSwitchModal?: boolean
}

export function AuthGuard({ children, fallback, userType, showSwitchModal = false }: AuthGuardProps) {
  const user = useAuthUser()
  const loading = useAuthLoading()
  const router = useRouter()
  const { signOut } = useAuth()
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // 로딩이 완료되고 사용자가 없거나 잘못된 타입인 경우
    if (!loading && user && userType && user.type !== userType) {
      if (showSwitchModal) {
        // 모달 표시
        setShowModal(true)
      } else {
        // 리다이렉트
        setShouldRedirect(true)
        if (userType === 'admin') {
          router.replace('/admin/login')
        } else {
          router.replace('/login')
        }
      }
    } else if (!loading && !user) {
      // 인증되지 않은 경우 리다이렉트
      setShouldRedirect(true)
      if (userType === 'admin') {
        router.replace('/admin/login')
      } else {
        router.replace('/login')
      }
    } else if (!loading && user && (!userType || user.type === userType)) {
      setShouldRedirect(false)
      setShowModal(false)
    }
  }, [user, loading, userType, router, showSwitchModal])

  const handleSwitchConfirm = async () => {
    await signOut()
    setShowModal(false)

    // 로그아웃 후 적절한 로그인 페이지로 이동
    if (userType === 'admin') {
      router.push('/admin/login')
    } else {
      router.push('/login')
    }
  }

  const handleSwitchCancel = () => {
    setShowModal(false)

    // 취소 시 원래 사용자 타입에 맞는 페이지로 이동
    if (user?.type === 'admin') {
      router.push('/admin')
    } else {
      router.push('/')
    }
  }

  // 로딩 중이거나 리다이렉트해야 하는 경우
  if (loading || shouldRedirect) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // 계정 전환 모달 표시
  if (showModal && user && userType && user.type !== userType) {
    return (
      <AccountSwitchModal
        currentUserName={user.name || user.email || '사용자'}
        currentUserType={user.type}
        targetType={userType}
        onConfirm={handleSwitchConfirm}
        onCancel={handleSwitchCancel}
      />
    )
  }

  // 인증되지 않은 경우 fallback 표시
  if (!user || (userType && user.type !== userType)) {
    return fallback || null
  }

  return <>{children}</>
}

// HOC version for backward compatibility
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard>
        <Component {...props} />
      </AuthGuard>
    )
  }
}
