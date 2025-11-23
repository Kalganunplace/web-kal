"use client"

import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import React from "react"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1 whitespace-nowrap font-nanumgothic font-extrabold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-[#E67E22] text-white shadow-[0px_5px_30px_0px_rgba(0,0,0,0)] hover:shadow-none active:shadow-none",
        secondary: "bg-[#E5C29F] text-white shadow-[0px_5px_30px_0px_rgba(0,0,0,0)] hover:shadow-none active:shadow-none",
        outline: "border-2 border-[#E67E22] text-[#E67E22] bg-transparent shadow-[0px_5px_30px_0px_rgba(0,0,0,0)] hover:shadow-none active:shadow-none",
        white: "bg-[#F2F2F2] text-[#E67E22] shadow-[0px_5px_30px_0px_rgba(0,0,0,0)] hover:shadow-none active:shadow-none",
        disabled: "bg-[#B0B0B0] text-white cursor-not-allowed",
        textButton: "bg-transparent text-[#B0B0B0] font-normal hover:underline",
        kakao: "bg-[#FEE500] text-[#171717] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.2)] hover:shadow-none active:shadow-none",
        naver: "bg-[#03C75A] text-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.2)] hover:shadow-none active:shadow-none"
      },
      size: {
        lg: "h-14 px-4 py-6 w-80 text-lg rounded-lg",
        md: "h-12 px-4 py-6 w-70 text-base rounded-md",
        sm: "h-8 px-4 py-4 w-24 text-base rounded",
        mini: "h-[34px] px-4 py-3 w-20 text-sm rounded",
        text: "h-auto p-0 w-auto"
      },
      fontSize: {
        "12": "text-xs",
        "14": "text-sm",
        "16": "text-base",
        "18": "text-lg",
        "20": "text-xl"
      },
      fontWeight: {
        regular: "font-normal",
        bold: "font-bold",
        extraBold: "font-extrabold"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fontSize: "16",
      fontWeight: "extraBold"
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fontSize, fontWeight, asChild = false, icon, iconPosition = "left", children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    // 소셜 로그인 버튼용 아이콘
    const getSocialIcon = () => {
      if (variant === "kakao") {
        return (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 1.5C4.86 1.5 1.5 4.32 1.5 7.8c0 2.22 1.44 4.14 3.6 5.28l-.72 2.64c-.06.24.18.42.36.3l3.18-2.1c.36.06.72.06 1.08.06 4.14 0 7.5-2.82 7.5-6.3S13.14 1.5 9 1.5z"
              fill="#171717"
            />
          </svg>
        )
      }
      if (variant === "naver") {
        return (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M12.16 9.72L5.84 0H0v18h5.84V8.28L12.16 18H18V0h-5.84v9.72z"
              fill="white"
            />
          </svg>
        )
      }
      return null
    }

    const socialIcon = getSocialIcon()
    const displayIcon = socialIcon || icon

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fontSize, fontWeight, className }))}
        ref={ref}
        style={{
          fontFamily: "var(--font-nanum-gothic, NanumGothic)",
          lineHeight: variant?.includes("text") ? "1em" : "0.99em"
        }}
        {...props}
      >
        {displayIcon && iconPosition === "left" && (
          <span className="w-6 h-6 flex items-center justify-center">
            {displayIcon}
          </span>
        )}
        {children}
        {displayIcon && iconPosition === "right" && (
          <span className="w-6 h-6 flex items-center justify-center">
            {displayIcon}
          </span>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
