"use client"

import type React from "react"
import BottomNavigation from "./bottom-navigation"

interface MainLayoutProps {
  children: React.ReactNode
  hasNotification?: boolean
}

export default function MainLayout({ children, hasNotification = false }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-[500px] mx-auto bg-white min-h-screen flex flex-col shadow-lg relative">
        {/* Main content with bottom padding for fixed navigation */}
        <div className="flex-1 pb-20">{children}</div>

        {/* Bottom Navigation */}
        <BottomNavigation hasNotification={hasNotification} />
      </div>
    </div>
  )
}
