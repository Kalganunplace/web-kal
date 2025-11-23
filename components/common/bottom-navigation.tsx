"use client"

import { LoginBottomSheet } from '@/components/auth/login-prompt'
import { HomeIcon, NotificationBadgeIcon, NotificationIcon, ProfileIcon, ReceiptIcon } from '@/components/ui/icon'
import { useAuthHydration } from '@/hooks/use-auth-hydration'
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

interface BottomNavigationProps {
  hasNotification?: boolean
}

export default function BottomNavigation({ hasNotification = false }: BottomNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuthHydration()
  const [showLoginSheet, setShowLoginSheet] = useState(false)
  const [loginSheetConfig, setLoginSheetConfig] = useState({
    title: "로그인이 필요해요",
    message: "이 기능을 사용하려면 로그인이 필요합니다."
  })

  const navItems = [
    { icon: "home", label: "홈", path: "/client" },
    { icon: "notification", label: "알림", path: "/client/notifications", hasNotification },
    { icon: "receipt", label: "이용내역", path: "/client/usage-history" },
    { icon: "profile", label: "내정보", path: "/client/profile" },
  ]

  const handleNavClick = (item: typeof navItems[0]) => {
    // 로그인이 필요한 탭들 체크
    const authRequiredPaths = ["/client/profile", "/client/notifications", "/client/usage-history"]

    if (authRequiredPaths.includes(item.path)) {
      if (!loading && !user) {
        // 각 탭별로 다른 메시지 설정
        let title = "로그인이 필요해요"
        let message = "이 기능을 사용하려면 로그인이 필요합니다."

        switch (item.path) {
          case "/client/profile":
            title = "내정보 확인하기"
            message = "프로필 정보를 보려면 로그인이 필요합니다."
            break
          case "/client/notifications":
            title = "알림 확인하기"
            message = "개인 알림을 확인하려면 로그인이 필요합니다."
            break
          case "/client/usage-history":
            title = "이용내역 확인하기"
            message = "주문 내역을 보려면 로그인이 필요합니다."
            break
        }

        setLoginSheetConfig({ title, message })
        setShowLoginSheet(true)
        return
      }
    }
    router.push(item.path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 max-w-[500px] mx-auto rounded-t-[30px] overflow-hidden">
      <div className="bg-white h-[80px] shadow-[0_-4px_4px_0_rgba(0,0,0,0.05)] border-t border-gray-100">
        <div className="flex justify-between items-center px-10 py-1 h-full">
          {navItems.map((item) => {
            const isActive = pathname === item.path

            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item)}
                className="flex flex-col items-center py-1 relative"
                style={{ width: "36px", height: "40px" }}
              >
                <div className="relative flex items-center justify-center" style={{ width: "24px", height: "24px" }}>
                  {item.hasNotification && item.path === "/client/notifications" ? (
                    <NotificationBadgeIcon
                      size={24}
                      color={isActive ? "#E67E22" : "#767676"}
                    />
                  ) : item.icon === "home" ? (
                    <HomeIcon
                      size={24}
                      color={isActive ? "#E67E22" : "#767676"}
                    />
                  ) : item.icon === "notification" ? (
                    <NotificationIcon
                      size={24}
                      color={isActive ? "#E67E22" : "#767676"}
                    />
                  ) : item.icon === "receipt" ? (
                    <ReceiptIcon
                      size={24}
                      color={isActive ? "#E67E22" : "#767676"}
                    />
                  ) : item.icon === "profile" ? (
                    <ProfileIcon
                      size={24}
                      color={isActive ? "#E67E22" : "#767676"}
                    />
                  ) : null}
                </div>

                {/* 선택된 탭: 언더라인 / 선택 안된 탭: 텍스트 */}
                {isActive ? (
                  <div
                    className="absolute bottom-0 bg-[#E67E22] rounded-full"
                    style={{
                      width: "24px",
                      height: "3px"
                    }}
                  />
                ) : (
                  <span
                    className="text-[11px] font-normal leading-tight text-center mt-1.5 text-[#767676]"
                    style={{
                      fontFamily: "var(--font-nanum-gothic, NanumGothic)",
                      ...(item.label === "이용내역" ? { width: "48px" } : {})
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 로그인 바텀시트 */}
      <LoginBottomSheet
        isOpen={showLoginSheet}
        onClose={() => setShowLoginSheet(false)}
        title={loginSheetConfig.title}
        message={loginSheetConfig.message}
      />
    </div>
  )
}
