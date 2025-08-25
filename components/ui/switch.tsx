"use client"

import { cn } from "@/lib/utils"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import React from "react"

export interface SwitchProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, disabled = false, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      // Base styles
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      // Off state (default)
      "bg-[#D9D9D9]",
      // On state
      "data-[state=checked]:bg-[#E67E22]",
      className
    )}
    disabled={disabled}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        // Base thumb styles
        "pointer-events-none block h-5 w-5 rounded-full bg-white transition-transform",
        // Shadow effect from Figma
        "shadow-[0px_2px_4px_0px_rgba(39,39,39,0.1)]",
        // Off position (left)
        "translate-x-0.5",
        // On position (right) - moves 22px from left as per Figma
        "data-[state=checked]:translate-x-[22px]"
      )}
    />
  </SwitchPrimitives.Root>
))

Switch.displayName = "Switch"

export { Switch }
