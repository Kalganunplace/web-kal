import { ChevronLeftIcon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import React from 'react'

export interface TopBannerProps {
  title: string
  onBackClick?: () => void
  showBackButton?: boolean
  rightIcon?: React.ReactNode
  className?: string
}

const TopBanner: React.FC<TopBannerProps> = ({
  title,
  onBackClick,
  showBackButton = true,
  rightIcon,
  className
}) => {
  return (
    <div className={cn(
      "flex justify-between items-center gap-1",
      "px-5 py-[20px]", // 60px top padding for status bar
      "w-full",
      className
    )}>
      {/* Left Icon - Back Button */}
      <div className="w-9 h-9 flex items-center justify-center">
        {showBackButton && onBackClick && (
          <button
            onClick={onBackClick}
            className="w-9 h-9 flex items-center justify-center"
          >
            <ChevronLeftIcon size={36} color="#333333" />
          </button>
        )}
      </div>

      {/* Title */}
      <div className="flex-1 flex justify-center items-center">
        <h1 className="text-[20px] font-extrabold text-[#333333] leading-none text-center">
          {title}
        </h1>
      </div>

      {/* Right Icon */}
      <div className="w-9 h-9 flex items-center justify-center">
        {rightIcon}
      </div>
    </div>
  )
}

export { TopBanner }
export default TopBanner
