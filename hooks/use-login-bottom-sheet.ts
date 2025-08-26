"use client"

import { useState } from 'react'
import { useAuthHydration } from './use-auth-hydration'

interface LoginBottomSheetOptions {
  title?: string
  message?: string
  actionText?: string
  requireAuth?: boolean
}

/**
 * 로그인 바텀시트를 쉽게 사용할 수 있는 훅
 */
export function useLoginBottomSheet(options: LoginBottomSheetOptions = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, isReady } = useAuthHydration()

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  /**
   * 인증이 필요한 기능을 실행하기 전에 호출
   * 로그인되어 있으면 콜백 실행, 아니면 로그인 바텀시트 표시
   */
  const requireAuthAndRun = (callback: () => void) => {
    if (!isReady) return

    if (isAuthenticated) {
      callback()
    } else {
      open()
    }
  }

  /**
   * 인증 상태를 확인하고 바텀시트를 표시
   * 로그인된 사용자에게는 환영 메시지, 비로그인 사용자에게는 로그인 유도
   */
  const showAuthStatus = () => {
    if (!isReady) return
    open()
  }

  return {
    isOpen,
    open,
    close,
    requireAuthAndRun,
    showAuthStatus,
    isAuthenticated,
    isReady,
    options: {
      title: options.title,
      message: options.message,
      actionText: options.actionText,
      requireAuth: options.requireAuth ?? true,
    }
  }
}