"use client"

import BottomNavigation from '@/components/common/bottom-navigation'
import { useAuthStore } from '@/stores/auth-store'
import { usePathname } from 'next/navigation'
import React, { createContext, ReactNode, useContext, useState } from 'react'

// Layout context
interface LayoutContextType {
  showNavigation: boolean
  setShowNavigation: (show: boolean) => void
  hasNotification: boolean
  setHasNotification: (has: boolean) => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export const useLayout = () => {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}

// Layout provider component
interface LayoutProviderProps {
  children: ReactNode
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const pathname = usePathname()
  const [hasNotification, setHasNotification] = useState(true)

  // Initialize auth store - only once on mount
  React.useEffect(() => {
    console.log('[Layout Provider] Calling auth initialize')
    const initialize = useAuthStore.getState().initialize
    initialize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  // Determine which pages should show navigation
  const mainPages = ['/client', '/client/profile', '/client/notifications', '/client/usage-history']
  const shouldShowNavigation = mainPages.includes(pathname)

  const [showNavigation, setShowNavigation] = useState(shouldShowNavigation)

  // Auto-update navigation visibility based on route
  React.useEffect(() => {
    setShowNavigation(shouldShowNavigation)
  }, [shouldShowNavigation])

  // Admin pages don't need max-width restriction
  const isAdminPage = pathname.startsWith('/admin')

  return (
    <LayoutContext.Provider
      value={{
        showNavigation,
        setShowNavigation,
        hasNotification,
        setHasNotification,
      }}
    >
      {isAdminPage ? (
        // Admin layout - full width
        children
      ) : (
        // Client layout - mobile constrained
        <div className="min-h-screen bg-white">
          <div className="max-w-[500px] mx-auto bg-white min-h-screen flex flex-col shadow-lg relative">
            {/* Main content */}
            <div className={`flex-1 ${showNavigation ? 'pb-[80px]' : ''}`}>
              {children}
            </div>

            {/* Bottom Navigation - only show on main pages */}
            {showNavigation && (
              <BottomNavigation hasNotification={hasNotification} />
            )}
          </div>
        </div>
      )}
    </LayoutContext.Provider>
  )
}
