"use client"

import { cn } from "@/lib/utils"
import React from "react"

export interface TextButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "12" | "14" | "16" | "18" | "20"
  weight?: "regular" | "bold" | "extraBold"
  children: React.ReactNode
}

const TextButton = React.forwardRef<HTMLButtonElement, TextButtonProps>(
  ({ className, size = "14", weight = "regular", children, ...props }, ref) => {
    const sizeClasses = {
      "12": "text-xs", // 12px
      "14": "text-sm", // 14px
      "16": "text-base", // 16px
      "18": "text-lg", // 18px
      "20": "text-xl", // 20px
    }

    const weightClasses = {
      regular: "font-normal",
      bold: "font-bold",
      extraBold: "font-extrabold",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "bg-transparent text-[#B0B0B0] hover:underline transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          sizeClasses[size],
          weightClasses[weight],
          className
        )}
        style={{
          fontFamily: "var(--font-nanum-gothic, NanumGothic)",
          lineHeight: "1em",
        }}
        {...props}
      >
        {children}
      </button>
    )
  }
)

TextButton.displayName = "TextButton"

export { TextButton }
