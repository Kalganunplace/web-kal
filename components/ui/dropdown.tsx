"use client"

import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"

export interface DropDownOption {
  id: string
  label: string
  value: string
  icon?: React.ReactNode
}

export interface DropDownProps {
  options: DropDownOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  title?: string
  variant?: "default" | "title" | "icon"
  disabled?: boolean
  className?: string
  showUnderBar?: boolean
}

const DropDown = React.forwardRef<HTMLDivElement, DropDownProps>(
  (
    {
      options = [],
      value,
      onChange,
      placeholder = "선택해주세요",
      title,
      variant = "default",
      disabled = false,
      className,
      showUnderBar = true,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedValue, setSelectedValue] = useState(value || "")
    const containerRef = useRef<HTMLDivElement>(null)

    // 외부 클릭 감지
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // 선택된 옵션 찾기
    const selectedOption = options.find(option => option.value === selectedValue)

    const handleToggle = () => {
      if (!disabled) {
        setIsOpen(!isOpen)
      }
    }

    const handleSelect = (option: DropDownOption) => {
      setSelectedValue(option.value)
      onChange?.(option.value)
      setIsOpen(false)
    }

    // 메인 버튼 렌더링
    const renderMainButton = () => (
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "flex items-center justify-between w-full h-[48px] px-5 rounded-[10px] border-2 bg-white transition-colors",
          isOpen
            ? "border-[#E67E22]"
            : "border-[#D9D9D9]",
          disabled && "bg-[#D9D9D9] cursor-not-allowed",
          "hover:border-[#E67E22]"
        )}
      >
        <div className="flex items-center gap-2">
          {variant === "icon" && selectedOption?.icon && (
            <div className="w-[18px] h-[18px] flex items-center justify-center">
              {selectedOption.icon}
            </div>
          )}
          <span
            className={cn(
              "text-[14px] font-bold leading-[0.99] text-left",
              selectedOption ? "text-[#333333]" : "text-[#333333]"
            )}
            style={{
              fontFamily: "var(--font-nanum-gothic, NanumGothic)"
            }}
          >
            {selectedOption?.label || placeholder}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-6 h-6 text-[#767676]" strokeWidth={2} />
        ) : (
          <ChevronDown className="w-6 h-6 text-[#767676]" strokeWidth={2} />
        )}
      </button>
    )

    // 옵션 아이템 렌더링
    const renderOption = (option: DropDownOption, index: number) => {
      const isSelected = option.value === selectedValue
      const isLast = index === options.length - 1

      return (
        <button
          key={option.id}
          type="button"
          onClick={() => handleSelect(option)}
          className={cn(
            "flex items-center gap-2 w-full px-5 py-[15px] text-left transition-colors",
            isSelected
              ? "bg-[#D9D9D9]"
              : "bg-white hover:bg-gray-50",
            !isLast && showUnderBar && "border-b border-[#767676]/20"
          )}
        >
          {variant === "icon" && option.icon && (
            <div className="w-[18px] h-[18px] flex items-center justify-center">
              {option.icon}
            </div>
          )}
          <span
            className="text-[14px] font-bold leading-[0.99] text-[#333333]"
            style={{
              fontFamily: "var(--font-nanum-gothic, NanumGothic)"
            }}
          >
            {option.label}
          </span>
        </button>
      )
    }

    // 드롭다운 리스트 렌더링
    const renderDropdownList = () => {
      if (!isOpen || options.length === 0) return null

      return (
                <div
          className="absolute top-full left-0 right-0 mt-[10px] bg-white rounded-[10px] shadow-[0px_5px_30px_0px_rgba(0,0,0,0.1)] border border-gray-100 z-[100] overflow-hidden"
        >
          {options.map((option, index) => renderOption(option, index))}
        </div>
      )
    }

    const dropdownContent = (
      <div className="relative">
        {renderMainButton()}
        {renderDropdownList()}
      </div>
    )

    // variant에 따른 최종 렌더링
    if (variant === "title" && title) {
      return (
        <div
          ref={containerRef}
          className={cn("flex flex-col gap-[6px] w-[330px]", className)}
          {...props}
        >
          <span
            className="text-[12px] font-bold leading-[0.99] text-[#333333]"
            style={{
              fontFamily: "var(--font-nanum-gothic, NanumGothic)"
            }}
          >
            {title}
          </span>
          {dropdownContent}
        </div>
      )
    }

        return (
      <div
        ref={containerRef}
        className={cn("relative", className || "w-[330px]")}
        {...props}
      >
        {dropdownContent}
      </div>
    )
  }
)

DropDown.displayName = "DropDown"

export { DropDown }
