"use client"

import { cn } from "@/lib/utils"
import React from "react"

export interface TextBoxProps {
  state?: "default" | "focus" | "alert" | "locked"
  size?: "md" | "lg"
  information?: "none" | "top" | "bottom"
  informationText?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  disabled?: boolean
  className?: string
  icon?: React.ReactNode
}

const TextBox = React.forwardRef<HTMLInputElement, TextBoxProps>(
  (
    {
      state = "default",
      size = "md",
      information = "none",
      informationText = "",
      placeholder = "Content",
      value,
      onChange,
      onFocus,
      onBlur,
      disabled = false,
      className,
      icon,
      ...props
    },
    ref
  ) => {
    const [internalState, setInternalState] = React.useState(state)
    const [isFocused, setIsFocused] = React.useState(false)

    // 상태별 스타일 정의
    const stateStyles = {
      default: {
        border: "border-[#D9D9D9]",
        background: "bg-white",
        textColor: "text-[#B0B0B0]",
        informationColor: "text-[#333333]"
      },
      focus: {
        border: "border-[#E67E22]",
        background: "bg-white",
        textColor: "text-[#333333]",
        informationColor: "text-[#E67E22]"
      },
      alert: {
        border: "border-[#FF4500]",
        background: "bg-white",
        textColor: "text-[#333333]",
        informationColor: "text-[#FF4500]"
      },
      locked: {
        border: "border-transparent",
        background: "bg-[#D9D9D9]",
        textColor: "text-[#333333]",
        informationColor: "text-[#333333]"
      }
    }

    // 크기별 스타일 정의
    const sizeStyles = {
      md: "w-[240px] h-[48px]",
      lg: "w-[330px] h-[48px]"
    }

    // 현재 적용할 스타일 결정
    const currentState = disabled ? "locked" : (isFocused ? "focus" : internalState)
    const currentStyles = stateStyles[currentState]

    const handleFocus = () => {
      if (!disabled) {
        setIsFocused(true)
        onFocus?.()
      }
    }

    const handleBlur = () => {
      if (!disabled) {
        setIsFocused(false)
        onBlur?.()
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled) {
        onChange?.(e.target.value)
      }
    }

    // Information 텍스트 컴포넌트
    const InformationText = ({ text, position }: { text: string; position: "top" | "bottom" }) => (
      <span
        className={cn(
          "text-[12px] font-bold leading-[0.99]",
          currentStyles.informationColor
        )}
        style={{
          fontFamily: "var(--font-nanum-gothic, NanumGothic)"
        }}
      >
        {text}
      </span>
    )

    const inputElement = (
      <div
        className={cn(
          "relative flex items-center justify-between rounded-[10px] border-2 px-5",
          sizeStyles[size],
          currentStyles.border,
          currentStyles.background,
          className
        )}
      >
        <input
          ref={ref}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={cn(
            "flex-1 bg-transparent text-[14px] font-bold leading-[0.99] outline-none placeholder:text-current",
            currentStyles.textColor
          )}
          style={{
            fontFamily: "var(--font-nanum-gothic, NanumGothic)"
          }}
          {...props}
        />
        {icon && (
          <div className="ml-1 flex h-6 w-6 items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    )

    if (information === "none") {
      return inputElement
    }

    return (
      <div className="flex flex-col gap-[6px]">
        {information === "top" && informationText && (
          <InformationText text={informationText} position="top" />
        )}
        {inputElement}
        {information === "bottom" && informationText && (
          <InformationText text={informationText} position="bottom" />
        )}
      </div>
    )
  }
)

TextBox.displayName = "TextBox"

export { TextBox }
