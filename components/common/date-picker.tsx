"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { ko } from "date-fns/locale"
import { ChevronDown } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

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
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | undefined>(selectedDate)

  const formatDate = (date: Date) => {
    // 오늘 날짜인지 확인
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)

    if (compareDate.getTime() === today.getTime()) {
      return '오늘'
    }

    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '.').replace(/\.$/, '')
  }

  // 임시 날짜 선택 (드롭다운은 닫지 않음)
  const handleDateSelect = (date: Date | undefined) => {
    setTempSelectedDate(date)
  }

  // 날짜 선택 확정 버튼
  const handleConfirmDate = () => {
    if (tempSelectedDate) {
      onDateSelect(tempSelectedDate)
    }
    setShowDatePicker(false)
  }

  // 드롭다운 토글
  const handleTogglePicker = () => {
    if (!showDatePicker) {
      setTempSelectedDate(selectedDate)
    }
    setShowDatePicker(!showDatePicker)
  }

  // 오늘 날짜 (시간 정보 제거)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => !disabled && handleTogglePicker()}
        disabled={disabled}
        className={`w-full bg-white border-2 rounded-lg h-12 px-4 flex items-center justify-between text-left transition-colors ${
          showDatePicker
            ? 'border-orange-500'
            : disabled
              ? 'border-gray-300 opacity-50 cursor-not-allowed'
              : 'border-gray-300 '
        }`}
      >
        <div className="flex items-center gap-2">
          <Image
            src="/svg/Icon_calendar.svg"
            alt="Calendar"
            width={18}
            height={18}
          />
          <span className="text-gray-800 font-medium">
            {selectedDate ? formatDate(selectedDate) : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 transition-all ${
          showDatePicker ? 'text-orange-600 rotate-180' : 'text-gray-400'
        }`} />
      </button>

      {showDatePicker && (
        <div className="mt-2 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
          <Calendar
            mode="single"
            selected={tempSelectedDate}
            onSelect={handleDateSelect}
            month={tempSelectedDate || selectedDate}
            onMonthChange={setTempSelectedDate}
            locale={ko}
            formatters={{
              formatWeekdayName: (date: Date) => {
                const days = ['일', '월', '화', '수', '목', '금', '토']
                return days[date.getDay()]
              }
            }}
            disabled={(date) => {
              // 과거 날짜 선택 불가
              const dateWithoutTime = new Date(date)
              dateWithoutTime.setHours(0, 0, 0, 0)
              return dateWithoutTime < today
            }}
            className="w-full"
          />

          <div className="mt-4">
            <Button
              onClick={handleConfirmDate}
              className="w-full h-[56px] bg-orange-500 hover:bg-orange-600 text-white"
              disabled={!tempSelectedDate}
            >
              날짜 선택
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
