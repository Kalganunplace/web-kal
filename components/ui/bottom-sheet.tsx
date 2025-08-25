"use client"

import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import React, { ReactNode, useEffect } from 'react'

export interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  className
}) => {
  // ESC 키로 닫기 및 스크롤 방지
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      // 스크롤 방지
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              duration: 0.4,
              ease: [0.32, 0.72, 0, 1] // custom easing for smooth feel
            }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50",
              "bg-white rounded-t-[30px]",
              "shadow-2xl",
              "max-w-[500px] mx-auto",
              "max-h-[90vh] overflow-hidden",
              className
            )}
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-24px)]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default BottomSheet
