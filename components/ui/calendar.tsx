"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import * as React from "react"
import { CaptionProps, DayPicker, useNavigation } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function CustomCaption(props: CaptionProps) {
  const { displayMonth } = props
  const { goToMonth } = useNavigation()

  const goToPreviousMonth = () => {
    const newMonth = new Date(displayMonth)
    newMonth.setMonth(newMonth.getMonth() - 1)
    goToMonth(newMonth)
  }

  const goToNextMonth = () => {
    const newMonth = new Date(displayMonth)
    newMonth.setMonth(newMonth.getMonth() + 1)
    goToMonth(newMonth)
  }

  return (
    <div className="flex justify-between items-center gap-2 pt-1 pb-3">
      <div className="text-base font-semibold">
        {displayMonth.getMonth() + 1}월 {displayMonth.getFullYear()}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={goToPreviousMonth}
          className="h-8 w-8 bg-transparent p-0 hover:bg-gray-100 border-0 rounded-full inline-flex items-center justify-center"
          type="button"
        >
          <ChevronLeft className="h-5 w-5 text-[#E67E22]" />
        </button>
        <button
          onClick={goToNextMonth}
          className="h-8 w-8 bg-transparent p-0 hover:bg-gray-100 border-0 rounded-full inline-flex items-center justify-center"
          type="button"
        >
          <ChevronRight className="h-5 w-5 text-[#E67E22]" />
        </button>
      </div>
    </div>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col",
        month: "space-y-0",
        caption: "hidden",
        caption_label: "hidden",
        nav: "hidden",
        nav_button: "hidden",
        nav_button_previous: "hidden",
        nav_button_next: "hidden",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-gray-500 font-normal text-sm flex-1 h-10 flex items-center justify-center",
        row: "flex w-full mt-2",
        cell: "flex-1 text-center p-0 relative h-10",
        day: "absolute inset-0 m-auto w-9 h-9 text-sm font-normal hover:bg-gray-100 rounded-full inline-flex items-center justify-center",
        day_range_end: "day-range-end",
        day_selected:
          "bg-orange-500 text-white hover:bg-orange-600",
        day_today: "bg-orange-100 text-orange-600",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-gray-300 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Caption: CustomCaption,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
