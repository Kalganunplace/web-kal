"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BodyMedium, Heading2 } from '@/components/ui/typography'

interface LoginPromptProps {
  title?: string
  message?: string
  actionText?: string
  showCancel?: boolean
  onCancel?: () => void
  className?: string
}

/**
 * 로그인 유도 프롬프트 컴포넌트
 */
export function LoginPrompt({
  title = "로그인이 필요해요",
  message = "이 기능을 사용하려면 로그인이 필요합니다.",
  actionText = "로그인하기",
  showCancel = false,
  onCancel,
  className = ""
}: LoginPromptProps) {
  const router = useRouter()

  const handleLogin = () => {
    const currentPath = window.location.pathname
    router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
  }

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
        <span className="text-2xl">🛡️</span>
      </div>
      
      <Heading2 color="#333333" className="font-bold mb-4">
        {title}
      </Heading2>
      
      <BodyMedium color="#666666" className="mb-8 leading-relaxed">
        {message}
      </BodyMedium>
      
      <div className="flex flex-col w-full max-w-xs gap-3">
        <Button
          onClick={handleLogin}
          className="w-full h-12 bg-[#E67E22] hover:bg-[#D35400] text-white font-bold rounded-xl"
        >
          {actionText}
        </Button>
        
        {showCancel && onCancel && (
          <button
            onClick={onCancel}
            className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            취소
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * 모달 형태의 로그인 프롬프트
 */
export function LoginPromptModal({
  isOpen,
  onClose,
  ...props
}: LoginPromptProps & {
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm">
        <LoginPrompt
          {...props}
          showCancel
          onCancel={onClose}
          className="p-6"
        />
      </div>
    </div>
  )
}

/**
 * 인라인 로그인 유도 카드
 */
export function LoginCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6 ${className}`}>
      <LoginPrompt
        title="더 많은 기능을 이용해보세요"
        message="로그인하고 칼가는곳의 다양한 서비스를 경험해보세요!"
        actionText="로그인 · 회원가입"
        className="p-0"
      />
    </div>
  )
}