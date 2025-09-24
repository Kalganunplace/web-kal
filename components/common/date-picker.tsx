"use client"

import { useState } from "react"
import { ChevronDown, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"

interface DatePickerProps {
  selectedDate?: Date
  onDateSelect: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({ 
  selectedDate, 
  onDateSelect, 
  placeholder = "날짜 선택",
  className = "",
  disabled = false 
}: DatePickerProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).replace(/\. /g, '.').replace(/\.$/, '')
  }

  const handlePrevMonth = () => {
    const currentDate = selectedDate || new Date()
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    onDateSelect(prevMonth)
  }

  const handleNextMonth = () => {
    const currentDate = selectedDate || new Date()
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    onDateSelect(nextMonth)
  }

  const handleDateSelect = (date: Date | undefined) => {
    onDateSelect(date)
    setShowDatePicker(false)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => !disabled && setShowDatePicker(!showDatePicker)}
        disabled={disabled}
        className={`w-full bg-white border border-orange-300 rounded-lg h-12 px-4 flex items-center justify-between text-left transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-orange-400'
        }`}
      >
        <div className="flex items-center gap-2">
          <span>📅</span>
          <span className="text-orange-600 font-medium">
            {selectedDate ? formatDate(selectedDate) : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-orange-600 transition-transform ${
          showDatePicker ? 'rotate-180' : ''
        }`} />
      </button>

      {showDatePicker && (
        <>
          {/* 오버레이 */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDatePicker(false)}
          />
          
          {/* 캘린더 팝업 */}
          <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedDate ? 
                  `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월` : 
                  `${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월`
                }
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>

            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="w-full"
              classNames={{
                day_selected: "bg-orange-500 text-white hover:bg-orange-600",
                day_today: "bg-orange-100 text-orange-600",
                nav_button: "hover:bg-gray-100",
                caption: "text-center",
                head_cell: "text-gray-500 font-normal text-sm w-10 h-8 flex items-center justify-center",
                cell: "w-10 h-10 text-center p-0",
                day: "w-10 h-10 text-sm font-normal hover:bg-gray-100 rounded-full"
              }}
            />

            <div className="mt-4">
              <Button
                onClick={() => setShowDatePicker(false)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                날짜 선택
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}