"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { ChevronDown, ChevronLeft } from "lucide-react"
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
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '.').replace(/\.$/, '')
  }

  const handlePrevMonth = () => {
    const currentDate = tempSelectedDate || selectedDate || new Date()
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    setTempSelectedDate(prevMonth)
  }

  const handleNextMonth = () => {
    const currentDate = tempSelectedDate || selectedDate || new Date()
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    setTempSelectedDate(nextMonth)
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

  // 드롭다운 열기
  const handleOpenPicker = () => {
    setTempSelectedDate(selectedDate)
    setShowDatePicker(true)
  }

  // 오늘 날짜 (시간 정보 제거)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => !disabled && handleOpenPicker()}
        disabled={disabled}
        className={`w-full bg-white border border-orange-300 rounded-lg h-12 px-4 flex items-center justify-between text-left transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-orange-400'
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
                {tempSelectedDate ?
                  `${tempSelectedDate.getFullYear()}년 ${tempSelectedDate.getMonth() + 1}월` :
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
              selected={tempSelectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => {
                // 과거 날짜 선택 불가
                const dateWithoutTime = new Date(date)
                dateWithoutTime.setHours(0, 0, 0, 0)
                return dateWithoutTime < today
              }}
              className="w-full"
              classNames={{
                day_selected: "bg-orange-500 text-white hover:bg-orange-600",
                day_today: "bg-orange-100 text-orange-600",
                day_disabled: "text-gray-300 cursor-not-allowed",
                nav_button: "hover:bg-gray-100",
                caption: "text-center",
                head_cell: "text-gray-500 font-normal text-sm flex-1 h-10 flex items-center justify-center",
                cell: "flex-1 h-12 text-center p-0",
                day: "w-full h-full text-sm font-normal hover:bg-gray-100 rounded-full flex items-center justify-center"
              }}
            />

            <div className="mt-4">
              <Button
                onClick={handleConfirmDate}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!tempSelectedDate}
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
