"use client"

import type React from "react"
import BottomNavigation from "./bottom-navigation"
import { useIsAuthenticated } from "@/stores/auth-store"
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications"
import { useUnreadNotificationCount } from "@/hooks/queries/use-notification"

interface MainLayoutProps {
  children: React.ReactNode
  hasNotification?: boolean
}

export default function MainLayout({ children, hasNotification = false }: MainLayoutProps) {
  const { user } = useIsAuthenticated()
  const { hasUnread } = useUnreadNotificationCount()

  // Supabase Realtime으로 실시간 알림 구독
  useRealtimeNotifications(user?.id)

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-[500px] mx-auto bg-white min-h-screen flex flex-col shadow-lg relative">
        {/* Main content with bottom padding for fixed navigation */}
        <div className="flex-1 pb-20">{children}</div>

        {/* Bottom Navigation */}
        <BottomNavigation hasNotification={hasUnread} />
      </div>
    </div>
  )
}
