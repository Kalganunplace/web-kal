"use client"

import { HomeIcon, NotificationBadgeIcon, NotificationIcon, ProfileIcon, ReceiptIcon } from '@/components/ui/icon'
import { usePathname, useRouter } from "next/navigation"

interface BottomNavigationProps {
  hasNotification?: boolean
}

export default function BottomNavigation({ hasNotification = false }: BottomNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    { icon: "home", label: "홈", path: "/" },
    { icon: "notification", label: "알림", path: "/notifications", hasNotification },
    { icon: "receipt", label: "이용내역", path: "/usage-history" },
    { icon: "profile", label: "내정보", path: "/profile" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 max-w-[500px] mx-auto">
      <div className="bg-white rounded-t-[30px] h-[80px] shadow-[0_-4px_4px_0_rgba(0,0,0,0.05)] border-t border-gray-100">
        <div className="flex justify-between items-center px-10 py-1 h-full">
          {navItems.map((item) => {
            const isActive = pathname === item.path

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="flex flex-col items-center py-1 relative"
                style={{ width: "36px", height: "40px" }}
              >
                <div className="relative flex items-center justify-center" style={{ width: "24px", height: "24px" }}>
                  {item.hasNotification && item.path === "/notifications" ? (
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
                <span
                  className={`text-[12px] font-bold leading-[0.99] text-center mt-1 ${
                    isActive ? "text-[#E67E22]" : "text-[#767676]"
                  }`}
                                    style={{
                    fontFamily: "var(--font-nanum-gothic, NanumGothic)",
                    ...(item.label === "이용내역" ? { width: "48px" } : {})
                  }}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div
                    className="absolute bottom-0 bg-[#E67E22]"
                    style={{
                      width: "24px",
                      height: "3px",
                      borderRadius: "1.5px"
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
