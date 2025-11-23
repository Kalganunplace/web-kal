"use client"

import { Button } from "@/components/ui/button"
import TopBanner from "@/components/ui/top-banner"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import AddressSelectionBottomSheet from "@/components/common/address-selection-bottom-sheet"
import { DatePicker } from "@/components/common/date-picker"
import { addressService, type Address } from "@/lib/address-service"
import { bookingService } from "@/lib/booking-service"
import { couponService, type UserCoupon } from "@/lib/coupon-service"
import { knifeService, type KnifeType } from "@/lib/knife-service"
import { paymentSettingsService, type PaymentSettings } from "@/lib/payment-settings-service"
import { useIsAuthenticated } from "@/stores/auth-store"
import { useBookingStore } from "@/stores/booking-store"
import PaymentBottomSheet from "./payment-bottom-sheet"

export default function PaymentConfirmation() {
  const router = useRouter()
  const { user, isAuthenticated } = useIsAuthenticated()
  const { bookingData, clearBooking, setBookingData } = useBookingStore()

  const [knifeTypes, setKnifeTypes] = useState<KnifeType[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [userAddresses, setUserAddresses] = useState<Address[]>([])
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null)
  const [availableCoupons, setAvailableCoupons] = useState<UserCoupon[]>([])
  const [selectedCoupon, setSelectedCoupon] = useState<UserCoupon | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPaymentBottomSheet, setShowPaymentBottomSheet] = useState(false)
  const [showAddressSelectionSheet, setShowAddressSelectionSheet] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'simple' | 'deposit'>('deposit')
  const [isEditingSchedule, setIsEditingSchedule] = useState(false)
  const [tempDate, setTempDate] = useState<Date>()
  const [tempTimeSlot, setTempTimeSlot] = useState<number>(13)

  // 데이터 검증 및 로드
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated || !user?.id) {
        toast.error('로그인이 필요한 서비스입니다.')
        router.push('/client/login')
        return
      }

      // 제출 중일 때는 리다이렉트하지 않음 (페이지 이동 처리 중)
      if (!bookingData && !isSubmitting) {
        toast.error('예약 정보가 없습니다.')
        router.push('/client/knife-request')
        return
      }

      if (!bookingData) {
        return
      }

      try {
        setIsLoading(true)

        // 칼 종류 데이터 로드
        const knifesData = await knifeService.getAllKnifeTypes()
        setKnifeTypes(knifesData)

        // 결제 설정 데이터 로드
        const settings = await paymentSettingsService.getPaymentSettings()
        setPaymentSettings(settings)

        // 사용자 주소 로드
        try {
          const addresses = await addressService.getUserAddresses(user.id)
          setUserAddresses(addresses)
          const defaultAddr = addresses.find(addr => addr.is_default) || addresses[0]
          if (defaultAddr) {
            setSelectedAddress(defaultAddr)
          }
        } catch (error) {
          console.error('주소 로드 실패:', error)
        }

        // 사용 가능한 쿠폰 로드 (선택적)
        try {
          const knifeTypeIds = bookingData.items.map(item => item.knife_type_id)
          const totalAmt = bookingData.items.reduce((sum, item) => {
            const kt = knifesData.find(k => k.id === item.knife_type_id)
            return sum + (kt ? kt.discount_price * item.quantity : 0)
          }, 0)
          const coupons = await couponService.getAvailableUserCoupons(user.id, totalAmt, knifeTypeIds)
          setAvailableCoupons(coupons)
        } catch (error) {
          console.error('쿠폰 로드 실패 (선택 기능):', error)
          // 쿠폰이 없어도 계속 진행
          setAvailableCoupons([])
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error)
        toast.error('데이터를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [isAuthenticated, user?.id, bookingData, isSubmitting, router])

  if (!bookingData) {
    return null
  }

  // 총 수량 및 금액 계산
  const totalQuantity = bookingData.items.reduce((sum, item) => sum + item.quantity, 0)
  const originalAmount = bookingData.items.reduce((sum, item) => {
    const knifeType = knifeTypes.find(kt => kt.id === item.knife_type_id)
    return sum + (knifeType ? knifeType.discount_price * item.quantity : 0)
  }, 0)

  // 쿠폰 할인 금액 계산
  const couponDiscount = selectedCoupon && selectedCoupon.coupon
    ? couponService.calculateDiscount(selectedCoupon.coupon, originalAmount)
    : 0

  const totalAmount = originalAmount - couponDiscount

  // 시간대 옵션 (9시부터 18시까지)
  const timeSlotOptions = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

  // 예약 날짜 포맷
  const formattedDate = format(new Date(bookingData.booking_date), 'yyyy.MM.dd', { locale: ko })
  const formattedTime = bookingData.booking_time.substring(0, 5) // "13:00:00" -> "13:00"
  const timeOfDay = parseInt(formattedTime) >= 12 ? '오후' : '오전'
  const hour = parseInt(formattedTime) > 12 ? parseInt(formattedTime) - 12 : parseInt(formattedTime)

  // 일정 변경 시작
  const handleStartEditingSchedule = () => {
    setTempDate(new Date(bookingData.booking_date))
    const currentHour = parseInt(formattedTime)
    setTempTimeSlot(currentHour)
    setIsEditingSchedule(true)
  }

  // 일정 변경 확인
  const handleConfirmScheduleChange = () => {
    if (!tempDate) {
      toast.error('날짜를 선택해주세요.')
      return
    }

    const newBookingData = {
      ...bookingData,
      booking_date: format(tempDate, 'yyyy-MM-dd'),
      booking_time: `${tempTimeSlot.toString().padStart(2, '0')}:00:00`
    }

    setBookingData(newBookingData)
    setIsEditingSchedule(false)
    toast.success('일정이 변경되었습니다.')
  }

  // 일정 변경 취소
  const handleCancelScheduleChange = () => {
    setIsEditingSchedule(false)
    setTempDate(undefined)
    setTempTimeSlot(13)
  }

  // 결제하기 버튼 클릭 (바텀시트 오픈)
  const handlePayment = () => {
    if (!user?.id) return

    if (!selectedAddress) {
      toast.error('배송 주소를 등록해주세요.')
      return
    }

    if (paymentMethod === 'simple') {
      toast.info('간편결제는 준비 중입니다.')
      return
    }

    // 무통장입금 바텀시트 오픈
    setShowPaymentBottomSheet(true)
  }

  // 입금하기 (실제 예약 생성)
  const handleDeposit = async (depositorName: string) => {
    if (!user?.id) return

    try {
      setIsSubmitting(true)

      // TODO: depositorName을 예약에 포함
      await bookingService.createBooking(user.id, bookingData)

      toast.success('예약이 성공적으로 접수되었습니다!')

      // 페이지 이동 전에 상태 정리
      clearBooking()
      setShowPaymentBottomSheet(false)

      // replace를 사용하여 뒤로가기 방지 및 확실한 페이지 이동
      router.replace('/client/usage-history')
    } catch (error) {
      console.error('예약 생성 실패:', error)
      toast.error('예약 접수 중 오류가 발생했습니다.')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#E67E22] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <TopBanner
        title="결제정보 확인"
        onBackClick={() => router.back()}
      />

      <div className="flex-1 pb-6 bg-[#F5F5F5] overflow-y-auto">
        {/* 상품 정보 */}
        <section className="mb-4 bg-white p-5 shadow-md">
          <h3 className="text-base font-bold text-[#333333] mb-3">상품 정보</h3>

          <div className="space-y-3">
            {bookingData.items.map((item) => {
              const knifeType = knifeTypes.find(kt => kt.id === item.knife_type_id)
              if (!knifeType) return null

              return (
                <div key={item.knife_type_id} className="bg-[#F2F2F2] rounded-xl p-4 flex items-center gap-3">
                  {/* 칼 이미지 */}
                  <div className="w-[80px] h-[80px] bg-white rounded-2xl flex items-center justify-center flex-shrink-0 p-2">
                    {knifeType.image_url ? (
                      <img src={knifeType.image_url} alt={knifeType.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-4xl">🔪</div>
                    )}
                  </div>

                  {/* 칼 정보와 수량 */}
                  <div className="flex-1 flex flex-col gap-1">
                    <h4 className="font-bold text-[#333333]">{knifeType.name}</h4>
                    <p className="text-xs text-[#999999]">개당 {knifeService.formatPrice(knifeType.discount_price)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-6 h-6 rounded-full border-2 border-[#CCCCCC] bg-[#F5F5F5] flex items-center justify-center cursor-not-allowed">
                        <span className="text-xs text-[#CCCCCC]">-</span>
                      </div>
                      <span className="text-base font-bold text-[#333333] w-6 text-center">{item.quantity}</span>
                      <div className="w-6 h-6 rounded-full border-2 border-[#CCCCCC] bg-[#F5F5F5] flex items-center justify-center cursor-not-allowed">
                        <span className="text-xs text-[#CCCCCC]">+</span>
                      </div>
                    </div>
                  </div>

                  {/* 가격 */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#333333]">
                      {knifeService.formatPrice(knifeType.discount_price * item.quantity)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="w-full border-t border-[#CCCCCC] my-4"></div>

          {/* 총 수량 및 금액 */}
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-[#333333]">
              총 수량 <span className="text-[#F97316]">{totalQuantity}</span>개
            </span>
            <div className="text-right">
              {couponDiscount > 0 ? (
                <>
                  <p className="text-sm text-[#999999] line-through">{knifeService.formatPrice(originalAmount)}</p>
                  <p className="text-xl font-bold text-[#E67E22]">
                    총 금액: {knifeService.formatPrice(totalAmount)}
                  </p>
                </>
              ) : (
                <p className="text-xl font-bold text-[#E67E22]">총 금액: {knifeService.formatPrice(totalAmount)}</p>
              )}
            </div>
          </div>
          <div className="text-right mt-1">
            {couponDiscount > 0 ? (
              <p className="text-xs text-[#999999]">{knifeService.formatPrice(couponDiscount)} 할인 적용</p>
            ) : (
              <p className="text-xs text-[#999999]">부가세 별도</p>
            )}
          </div>
        </section>

        {/* 주소 상세 */}
        <section className="mb-4 bg-white p-5 shadow-md">
          <h3 className="text-base font-bold text-[#333333] mb-3">주소 상세</h3>

          {selectedAddress ? (
            <>
              <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4">
                <p className="text-[#333333] font-medium mb-1">
                  {selectedAddress.address}
                </p>
                <p className="text-sm text-[#999999]">
                  {selectedAddress.detail_address}
                </p>
              </div>

              <button
                onClick={() => setShowAddressSelectionSheet(true)}
                className="w-full mt-3 h-14 bg-[#F2F2F2] text-[#E67E22] rounded-2xl font-bold text-sm"
              >
                주소 변경하기
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push('/client/address-settings')}
              className="w-full py-4 bg-[#E67E22] h-14 text-[#ffffff] rounded-lg font-black text-sm"
            >
              주소를 등록하기
            </button>
          )}
        </section>

        {/* 예약 일정 */}
        <section className="mb-4 bg-white p-5 shadow-md">
          <h3 className="text-base font-bold text-[#333333] mb-3">예약 일정</h3>

          {!isEditingSchedule ? (
            <>
              <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4">
                <p className="text-lg font-bold text-[#E67E22]">
                  {formattedDate} {timeOfDay} {hour}시
                </p>
                <p className="text-xs text-[#999999] mt-1">
                  예약이 확정되면 바로 알림 드릴게요 :)<br />
                  앱을 확인해주세요!
                </p>
              </div>

              <button
                onClick={handleStartEditingSchedule}
                className="w-full mt-3 h-14 bg-[#F2F2F2] text-[#E67E22] rounded-lg font-black text-sm"
              >
                일정 변경하기
              </button>
            </>
          ) : (
            <div className="space-y-4">
              {/* 날짜 선택 */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">날짜 선택</label>
                <DatePicker
                  selectedDate={tempDate}
                  onDateSelect={setTempDate}
                  placeholder="날짜를 선택해주세요"
                />
              </div>

              {/* 시간대 선택 */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">시간 선택</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {timeSlotOptions.map((hourOption) => (
                    <button
                      key={hourOption}
                      onClick={() => setTempTimeSlot(hourOption)}
                      className={`flex-shrink-0 px-6 py-3 rounded-lg font-medium transition-colors ${
                        tempTimeSlot === hourOption
                          ? 'bg-[#E67E22] text-white'
                          : 'bg-[#F2F2F2] text-gray-600'
                      }`}
                    >
                      {hourOption}:00
                    </button>
                  ))}
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                <Button
                  onClick={handleCancelScheduleChange}
                  variant="outline"
                  className="flex-1 h-12 rounded-lg text-sm font-medium"
                >
                  취소
                </Button>
                <Button
                  onClick={handleConfirmScheduleChange}
                  disabled={!tempDate}
                  className={`flex-1 h-12 rounded-lg text-sm font-bold transition-colors ${
                    !tempDate
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-[#E67E22] hover:bg-[#D35400] text-white'
                  }`}
                >
                  확인
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* 쿠폰 등록 */}
        <section className="mb-4 bg-white  p-5 shadow-md">
          <h3 className="text-base font-bold text-[#333333] mb-3">쿠폰 등록</h3>

          <div className="relative group">
            <select
              value={selectedCoupon?.id || ""}
              onChange={(e) => {
                const coupon = availableCoupons.find(c => c.id === e.target.value)
                setSelectedCoupon(coupon || null)
              }}
              disabled={availableCoupons.length === 0}
              className="w-full h-12 px-4 pr-10 border-2 border-[#CCCCCC] rounded-lg focus:border-[#F97316] focus:outline-none appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed text-[#333333]"
            >
              <option value="">
                {availableCoupons.length === 0 ? '사용 가능한 쿠폰이 없습니다' : '쿠폰 선택하기'}
              </option>
              {availableCoupons.map((userCoupon) => (
                <option key={userCoupon.id} value={userCoupon.id}>
                  {userCoupon.coupon?.name} - {couponService.formatDiscountValue(userCoupon.coupon!)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#CCCCCC] group-focus-within:text-[#F97316] pointer-events-none transition-colors" />
          </div>

          {/* 선택된 쿠폰 할인 표시 */}
          {selectedCoupon && couponDiscount > 0 && (
            <div className="mt-3 p-3 bg-[#FFF7ED] rounded-2xl flex items-center justify-between">
              <span className="text-sm text-[#333333]">쿠폰 할인</span>
              <span className="text-lg font-bold text-[#E67E22]">
                - {knifeService.formatPrice(couponDiscount)}
              </span>
            </div>
          )}
        </section>

        {/* 결제 방법 */}
        <section className="mb-4 bg-white p-5 shadow-md">
          <h3 className="text-base font-bold text-[#333333] mb-3">결제 방법</h3>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPaymentMethod('deposit')}
              className="flex items-center gap-2"
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === 'deposit' ? 'border-[#CCCCCC]' : 'border-[#CCCCCC]'
              }`}>
                {paymentMethod === 'deposit' && (
                  <div className="w-3 h-3 rounded-full bg-[#E67E22]"></div>
                )}
              </div>
              <span className="text-sm text-[#333333]">계좌이체</span>
            </button>

            <button
              onClick={() => setPaymentMethod('simple')}
              className="flex items-center gap-2"
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === 'simple' ? 'border-[#CCCCCC]' : 'border-[#CCCCCC]'
              }`}>
                {paymentMethod === 'simple' && (
                  <div className="w-3 h-3 rounded-full bg-[#E67E22]"></div>
                )}
              </div>
              <span className="text-sm text-[#333333]">간편결제</span>
            </button>
          </div>
        </section>

        {/* 환불 정책 */}
        <section className="mb-4 bg-white  p-5 shadow-md">
          <h3 className="text-base font-bold text-[#333333] mb-3">환불 정책</h3>

          <div className="bg-[#F2F2F2] rounded-2xl p-4 space-y-2">
            <p className="text-xs text-[#666666] leading-relaxed">
              • 예약된 서비스는 이용일 기준 24시간 전까지 취소 시 전액 환불됩니다.
            </p>
            <p className="text-xs text-[#666666] leading-relaxed">
              • 이용일 당일 취소 또는 무단 취소 시 환불이 불가합니다.
            </p>
            <p className="text-xs text-[#666666] leading-relaxed">
              • 연마 작업이 이미 진행된 경우, 서비스 특성상 환불이 어렵습니다.
            </p>
            <p className="text-xs text-[#666666] leading-relaxed">
              • 정기 구독 상품의 경우, 사용 내역을 기준으로 환불 금액이 산정됩니다.
            </p>
            <p className="text-xs text-[#666666] leading-relaxed">
              • 기타 환불 관련 문의는 고객센터를 통해 접수해 주세요.
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <button
              onClick={() => router.push('/client/terms-detail?type=payment')}
              className="w-full flex items-center justify-between py-3 px-4 bg-white "
            >
              <span className="text-sm text-[#333333]">결제 서비스 이용약관</span>
              <ChevronRight className="w-4 h-4 text-[#000000]" />
            </button>
            <button
              onClick={() => router.push('/client/terms-detail?type=privacy')}
              className="w-full flex items-center justify-between py-3 px-4 bg-white "
            >
              <span className="text-sm text-[#333333]">개인정보 수집 및 이용 동의</span>
              <ChevronRight className="w-4 h-4 text-[#000000]" />
            </button>
            <button
              onClick={() => router.push('/client/terms-detail?type=provision')}
              className="w-full flex items-center justify-between py-3 px-4 bg-white "
            >
              <span className="text-sm text-[#333333]">개인정보 제공 안내</span>
              <ChevronRight className="w-4 h-4 text-[#000000]" />
            </button>
          </div>

          <p className="text-xs pl-4 text-[#999999] mt-4 text-start">
            구매 내용이 동의하시면 결제 버튼을 눌러주세요.
          </p>
        </section>

        {/* 결제하기 버튼 */}
        <div className="flex justify-center items-center px-5">
          <Button
            className="w-full h-14 bg-[#E67E22] hover:bg-[#D35400] text-white rounded-lg font-bold text-lg disabled:bg-[#B0B0B0] disabled:text-white"
            onClick={handlePayment}
            disabled={!selectedAddress}
          >
            결제하기
          </Button>
        </div>
        {/* Spacer for bottom navigation */}
        <div className="h-20" />
      </div>

      {/* 주소 선택 바텀시트 */}
      <AddressSelectionBottomSheet
        isOpen={showAddressSelectionSheet}
        onClose={() => setShowAddressSelectionSheet(false)}
        addresses={userAddresses}
        selectedAddressId={selectedAddress?.id}
        onSelect={(address) => setSelectedAddress(address)}
      />

      {/* 결제 바텀시트 */}
      {paymentSettings && (
        <PaymentBottomSheet
          isOpen={showPaymentBottomSheet}
          onClose={() => setShowPaymentBottomSheet(false)}
          totalAmount={totalAmount}
          paymentSettings={paymentSettings}
          onSubmit={handleDeposit}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  )
}
