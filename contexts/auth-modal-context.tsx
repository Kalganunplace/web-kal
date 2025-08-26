"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface AuthModalContextType {
  showLoginSheet: boolean
  setShowLoginSheet: (show: boolean) => void
  openLoginSheet: () => void
  closeLoginSheet: () => void
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined)

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [showLoginSheet, setShowLoginSheet] = useState(false)

  const openLoginSheet = () => setShowLoginSheet(true)
  const closeLoginSheet = () => setShowLoginSheet(false)

  return (
    <AuthModalContext.Provider
      value={{
        showLoginSheet,
        setShowLoginSheet,
        openLoginSheet,
        closeLoginSheet
      }}
    >
      {children}
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  const context = useContext(AuthModalContext)
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider')
  }
  return context
}