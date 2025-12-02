"use client"

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { BodyMedium, Heading2 } from '@/components/ui/typography'
import { useAuthHydration } from '@/hooks/use-auth-hydration'
import { useRouter } from 'next/navigation'
import { Icon04 } from '../icons'

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
    router.push(`/client/login?redirect=${encodeURIComponent(currentPath)}`)
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
          className="w-full h-12 bg-[#E67E22]  text-white font-bold rounded-xl"
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
 * 바텀시트 형태의 로그인 프롬프트
 * 로그인 상태에 따라 다른 메시지를 표시
 */
export function LoginBottomSheet({
  isOpen,
  onClose,
  title,
  message,
  actionText,
  requireAuth = true, // 인증이 필요한 기능인지 여부
}: LoginPromptProps & {
  isOpen: boolean
  onClose: () => void
  requireAuth?: boolean
}) {
  const router = useRouter()
  const { isAuthenticated, isReady, user } = useAuthHydration()

  const handleLogin = () => {
    const currentPath = window.location.pathname
    router.push(`/client/login?redirect=${encodeURIComponent(currentPath)}`)
    onClose()
  }

  const handleSignup = () => {
    const currentPath = window.location.pathname
    router.push(`/client/signup?redirect=${encodeURIComponent(currentPath)}`)
    onClose()
  }

  if (!isReady) {
    return null
  }

  // 로그인된 사용자일 때의 메시지
  if (isAuthenticated && user) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="max-w-[500px] mx-auto">
          <SheetHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">✅</span>
            </div>
            <SheetTitle className="text-xl font-bold">
              안녕하세요, {user.name}님! 👋
            </SheetTitle>
            <SheetDescription className="text-gray-600 leading-relaxed">
              로그인이 완료되어 모든 기능을 이용하실 수 있습니다.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={onClose}
              className="w-full h-12 bg-[#E67E22]  text-white font-bold rounded-xl"
            >
              확인
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  // 로그인되지 않은 사용자일 때의 메시지
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="max-w-[500px] mx-auto">
        <SheetHeader className="text-center pb-4">
          <SheetTitle className="text-xl font-bold">
            {/* {title || "로그인이 필요해요"} */}
            {"로그인이 필요해요"}
          </SheetTitle>
          <div className='flex justify-center'>
            <Icon04 size={70} color="#E67E22"/>
          </div>
          <SheetDescription className="text-[#333] text-base font-bold">
            {/* {message || "이 기능을 사용하려면 로그인이 필요합니다."} */}
            <p>간편하게 로그인하고</p>
            <p>칼가는곳의 다양한 서비스를 이용해보세요!</p>
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={handleLogin}
            className="w-full h-12 bg-[#E67E22]  text-white font-bold rounded-[8px]"
          >
            {actionText || "로그인하기"}
          </Button>

          <Button
            onClick={handleSignup}
            variant="outline"
            className="w-full h-12 border-orange-200 text-orange-600 font-bold rounded-[8px]"
          >
            회원가입하기
          </Button>

          <button
            onClick={onClose}
            className="w-full py-3 bg-[#F2F2F2] text-[#E67E22] rounded-[8px] font-bold transition-colors"
          >
            나중에 하기
          </button>
        </div>
      </SheetContent>
    </Sheet>
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
