"use client"

import { DatePicker } from "@/components/common/date-picker"
import BottomSheet from "@/components/ui/bottom-sheet"
import { Button } from "@/components/ui/button"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium } from "@/components/ui/typography"
import { format } from "date-fns"
import { PocketKnifeIcon as Knife, Minus, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { type CreateBookingData } from "@/lib/booking-service"
import { knifeService, type KnifeType } from "@/lib/knife-service"
import { useIsAuthenticated } from "@/stores/auth-store"
import { useBookingStore } from "@/stores/booking-store"

interface KnifeSelection {
  knife_type_id: string
  quantity: number
}

interface KnifeRequestProps {
  onComplete?: (bookingData: CreateBookingData) => void
  showSubmitButton?: boolean
}

export default function KnifeRequest({
  onComplete,
  showSubmitButton = true
}: KnifeRequestProps = {}) {
  const router = useRouter()
  const { user, isAuthenticated } = useIsAuthenticated()
  const { setBookingData } = useBookingStore()

  // 상태 관리
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number>(13) // 기본값 13:00
  const [knifeTypes, setKnifeTypes] = useState<KnifeType[]>([])
  const [knifeSelections, setKnifeSelections] = useState<KnifeSelection[]>([])
  const [tempKnifeSelections, setTempKnifeSelections] = useState<KnifeSelection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showKnifeBottomSheet, setShowKnifeBottomSheet] = useState(false)

  // 시간대 옵션 (9시부터 18시까지)
  const timeSlotOptions = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

  // 초기 날짜 및 시간 설정
  useEffect(() => {
    const now = new Date()
    const currentHour = now.getHours()

    // 현재 날짜를 기본값으로 설정
    setSelectedDate(now)

    // 현재 시간에 따라 가장 가까운 이후 시간으로 설정
    const nextAvailableHour = timeSlotOptions.find(hour => hour > currentHour)
    if (nextAvailableHour) {
      setSelectedTimeSlot(nextAvailableHour)
    } else {
      // 오늘 예약 가능한 시간이 없으면 다음 날 첫 시간으로 설정
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      setSelectedDate(tomorrow)
      setSelectedTimeSlot(timeSlotOptions[0]) // 9:00
    }
  }, [])

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // 칼 종류 데이터 로드
        const knifesData = await knifeService.getAllKnifeTypes()
        setKnifeTypes(knifesData)
      } catch (error) {
        console.error('데이터 로드 실패:', error)
        toast.error('데이터를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // 바텀시트 열기 (현재 선택을 임시 상태로 복사)
  const handleOpenBottomSheet = () => {
    setTempKnifeSelections([...knifeSelections])
    setShowKnifeBottomSheet(true)
  }

  // 바텀시트에서 임시 수량 업데이트
  const updateTempKnifeQuantity = (knifeTypeId: string, quantity: number) => {
    setTempKnifeSelections(prev => {
      const existing = prev.find(item => item.knife_type_id === knifeTypeId)
      if (existing) {
        if (quantity === 0) {
          return prev.filter(item => item.knife_type_id !== knifeTypeId)
        }
        return prev.map(item =>
          item.knife_type_id === knifeTypeId ? { ...item, quantity } : item
        )
      } else if (quantity > 0) {
        return [...prev, { knife_type_id: knifeTypeId, quantity }]
      }
      return prev
    })
  }

  // 바텀시트 확인 버튼 (임시 선택을 실제로 반영)
  const handleConfirmSelection = () => {
    setKnifeSelections([...tempKnifeSelections])
    setShowKnifeBottomSheet(false)
  }

  // 바텀시트 닫기 (임시 선택 취소)
  const handleCloseBottomSheet = () => {
    setShowKnifeBottomSheet(false)
  }

  // 실제 선택에서 수량 업데이트 (선택된 칼 목록에서 직접 수정할 때)
  const updateKnifeQuantity = (knifeTypeId: string, quantity: number) => {
    setKnifeSelections(prev => {
      const existing = prev.find(item => item.knife_type_id === knifeTypeId)
      if (existing) {
        if (quantity === 0) {
          return prev.filter(item => item.knife_type_id !== knifeTypeId)
        }
        return prev.map(item =>
          item.knife_type_id === knifeTypeId ? { ...item, quantity } : item
        )
      } else if (quantity > 0) {
        return [...prev, { knife_type_id: knifeTypeId, quantity }]
      }
      return prev
    })
  }

  // 총 수량 및 금액 계산
  const totalQuantity = knifeSelections.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = knifeSelections.reduce((sum, item) => {
    const knifeType = knifeTypes.find(kt => kt.id === item.knife_type_id)
    return sum + (knifeType ? knifeType.discount_price * item.quantity : 0)
  }, 0)

  // 다음 단계로 이동
  const handleSubmit = () => {
    if (!isAuthenticated || !user?.id) {
      toast.error('로그인이 필요한 서비스입니다.')
      router.push('/client/login')
      return
    }

    if (!selectedDate) {
      toast.error('날짜를 선택해주세요.')
      return
    }

    if (knifeSelections.length === 0) {
      toast.error('연마할 칼을 선택해주세요.')
      return
    }

    const bookingData: CreateBookingData = {
      booking_date: format(selectedDate, 'yyyy-MM-dd'),
      booking_time: `${selectedTimeSlot.toString().padStart(2, '0')}:00:00`,
      items: knifeSelections
    }

    // onComplete 콜백이 있으면 다음 단계로
    if (onComplete) {
      onComplete(bookingData)
      return
    }

    // booking data를 store에 저장
    setBookingData(bookingData)

    // 결제 확인 페이지로 이동
    router.push('/client/payment-confirmation')
  }

  // 로딩 중
  if (isLoading) {
    return (
      <>
        <TopBanner
          title="칼갈이 신청"
          onBackClick={() => router.back()}
        />

        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <BodyMedium color="#666666">로딩 중...</BodyMedium>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBanner
        title="칼갈이 신청"
        onBackClick={() => router.back()}
      />

      <div className="flex-1 px-5 py-6 bg-white">
        {/* 예약 섹션 */}
        <div className="mb-5">
          <h3 className="text-base font-bold text-gray-800 mb-3">예약</h3>

          {/* 날짜 선택 */}
          <DatePicker
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            placeholder="날짜를 선택해주세요"
          />

          {/* 시간대 선택 - 수평 슬라이드 */}
          <div className="mt-3 -mx-5 px-5">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {timeSlotOptions.map((hour) => (
                <button
                  key={hour}
                  onClick={() => setSelectedTimeSlot(hour)}
                  className={`flex-shrink-0 px-6 py-3 rounded-lg font-medium transition-colors ${
                    selectedTimeSlot === hour
                      ? 'bg-[#E67E22] text-white'
                      : 'bg-[#F2F2F2] text-gray-600'
                  }`}
                >
                  {hour}:00
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 연마할 칼을 추가해 주세요 */}
        <div className="mb-5">
          <h3 className="text-base font-bold text-gray-800 mb-3">연마할 칼을 추가해 주세요!</h3>

          <button
            onClick={handleOpenBottomSheet}
            className="w-full flex items-center justify-between p-4 border-2 border-[#E67E22] rounded-lg bg-white"
          >
            <div className="flex items-center gap-2">
              <Knife className="w-5 h-5 text-[#E67E22]" />
              <span className="font-medium text-gray-800">칼 추가하기</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* 선택된 칼 목록 */}
          {knifeSelections.length > 0 && (
            <div className="mt-4 space-y-3">
              {knifeSelections.map((selection) => {
                const knifeType = knifeTypes.find(kt => kt.id === selection.knife_type_id)
                if (!knifeType) return null

                return (
                  <div key={selection.knife_type_id} className="bg-[#F8F8F8] rounded-2xl p-4 flex items-center gap-4">
                    {/* 칼 이미지 */}
                    <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                      {knifeType.image_url ? (
                        <img src={knifeType.image_url} alt={knifeType.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-4xl">🔪</div>
                      )}
                    </div>

                    {/* 칼 정보 */}
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{knifeType.name}</h4>
                      <p className="text-sm text-gray-500">개당 {knifeService.formatPrice(knifeType.discount_price)}</p>
                    </div>

                    {/* 수량 조절 */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateKnifeQuantity(knifeType.id, Math.max(0, selection.quantity - 1))}
                        className="w-8 h-8 rounded-full border-2 border-[#E67E22] flex items-center justify-center text-[#E67E22]"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-lg w-6 text-center">{selection.quantity}</span>
                      <button
                        onClick={() => updateKnifeQuantity(knifeType.id, selection.quantity + 1)}
                        className="w-8 h-8 rounded-full border-2 border-[#E67E22] flex items-center justify-center text-[#E67E22]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 소계 */}
                    <div className="text-right min-w-[80px]">
                      <p className="font-bold text-gray-800">
                        {knifeService.formatPrice(knifeType.discount_price * selection.quantity)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 총 수량 및 금액 */}
        {totalQuantity > 0 && (
          <div className="mb-5 flex items-center justify-between">
            <span className="text-base font-bold text-gray-800">총 수량 {totalQuantity}개</span>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-800">총 금액: {knifeService.formatPrice(totalAmount)}</p>
              <p className="text-xs text-gray-500">쿠폰제 별도</p>
            </div>
          </div>
        )}

        {/* 바로 신청 버튼 */}
        {showSubmitButton && (
          <Button
            className="w-full bg-[#E67E22] hover:bg-[#D35400] text-white rounded-xl py-4 font-bold text-lg disabled:bg-gray-300"
            onClick={handleSubmit}
            disabled={!selectedDate || totalQuantity === 0}
          >
            바로 신청하기
          </Button>
        )}

        {/* Spacer for bottom navigation */}
        <div className="h-20" />
      </div>

      {/* 칼 선택 바텀시트 */}
      <BottomSheet isOpen={showKnifeBottomSheet} onClose={handleCloseBottomSheet}>
        <div className="flex flex-col h-full max-h-[80vh]">
          {/* 헤더 */}
          <div className="p-6 pb-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 text-center">칼 추가 옵션</h3>
          </div>

          {/* 칼 목록 */}
          <div className="flex-1 overflow-y-auto p-6 pt-4">
            <div className="space-y-3">
              {knifeTypes.map((knifeType) => {
                const currentQuantity = tempKnifeSelections.find(
                  item => item.knife_type_id === knifeType.id
                )?.quantity || 0

                return (
                  <div key={knifeType.id} className="bg-[#F8F8F8] rounded-2xl p-4 flex items-center gap-4">
                    {/* 칼 이미지 */}
                    <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                      {knifeType.image_url ? (
                        <img src={knifeType.image_url} alt={knifeType.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-4xl">🔪</div>
                      )}
                    </div>

                    {/* 칼 정보 */}
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{knifeType.name}</h4>
                      <p className="text-sm text-gray-500">개당 {knifeService.formatPrice(knifeType.discount_price)}</p>
                    </div>

                    {/* 수량 조절 */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateTempKnifeQuantity(knifeType.id, Math.max(0, currentQuantity - 1))}
                        className="w-8 h-8 rounded-full border-2 border-[#E67E22] flex items-center justify-center text-[#E67E22] disabled:border-gray-300 disabled:text-gray-300"
                        disabled={currentQuantity === 0}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-lg w-6 text-center">{currentQuantity}</span>
                      <button
                        onClick={() => updateTempKnifeQuantity(knifeType.id, currentQuantity + 1)}
                        className="w-8 h-8 rounded-full border-2 border-[#E67E22] flex items-center justify-center text-[#E67E22]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 가격 */}
                    <div className="text-right min-w-[60px]">
                      <p className="font-bold text-gray-800">
                        {currentQuantity > 0 ? knifeService.formatPrice(knifeType.discount_price * currentQuantity) : '0원'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 하단 고정 버튼 */}
          <div className="p-6 pt-4 border-t border-gray-200 bg-white">
            <Button
              onClick={handleConfirmSelection}
              className="w-full bg-[#E67E22] hover:bg-[#D35400] text-white rounded-xl py-4 font-bold text-lg"
            >
              추가하기
            </Button>
          </div>
        </div>
      </BottomSheet>
    </>
  )
}
