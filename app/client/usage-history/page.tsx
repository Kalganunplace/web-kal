"use client"

import BottomSheet from "@/components/ui/bottom-sheet"
import { ChevronDownIcon, ChevronRightIcon } from "@/components/ui/icon"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, BodySmall, CaptionLarge } from "@/components/ui/typography"
import { useUserBookings } from '@/hooks/queries/use-booking'
import { createClient } from '@/lib/auth/supabase'
import { type Booking } from '@/lib/booking-service'
import { paymentService } from '@/lib/payment-service'
import { useIsAuthenticated } from '@/stores/auth-store'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function UsageHistoryPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useIsAuthenticated()

  const [selectedItem, setSelectedItem] = useState<Booking | null>(null)
  const [showLoginSheet, setShowLoginSheet] = useState(false)

  // React Query 훅 사용
  const { data: bookings = [], isLoading } = useUserBookings()

  // 모든 예약의 결제 정보 가져오기
  const { data: payments = new Map() } = useQuery({
    queryKey: ['payments', 'bookings', bookings.map(b => b.id)],
    queryFn: async () => {
      if (!user?.id || bookings.length === 0) return new Map()

      const paymentMap = new Map()
      await Promise.all(
        bookings.map(async (booking) => {
          const payment = await paymentService.getPaymentByBookingId(booking.id, user.id)
          if (payment) {
            paymentMap.set(booking.id, payment)
          }
        })
      )
      return paymentMap
    },
    enabled: !!user?.id && bookings.length > 0,
  })

  // 모든 예약의 쿠폰 정보 가져오기
  const { data: usedCoupons = new Map() } = useQuery({
    queryKey: ['used-coupons', 'bookings', bookings.map(b => b.id)],
    queryFn: async () => {
      if (!user?.id || bookings.length === 0) return new Map()

      try {
        const supabase = createClient()
        const couponMap = new Map()

        // 사용된 쿠폰 조회 (booking_id로 필터링)
        const { data: userCoupons, error } = await supabase
          .from('user_coupons')
          .select(`
            *,
            coupon:coupons(*)
          `)
          .eq('user_id', user.id)
          .eq('is_used', true)
          .in('booking_id', bookings.map(b => b.id))

        if (error) {
          console.error('쿠폰 조회 오류 (무시됨):', error)
          return couponMap // 빈 Map 반환
        }

        if (userCoupons) {
          userCoupons.forEach(uc => {
            if (uc.booking_id) {
              couponMap.set(uc.booking_id, uc)
            }
          })
        }

        return couponMap
      } catch (error) {
        console.error('쿠폰 로드 실패 (무시됨):', error)
        return new Map()
      }
    },
    enabled: !!user?.id && bookings.length > 0,
  })

  // 현재 진행 중인 서비스 (완료/취소가 아닌 모든 상태)
  const currentService = bookings.find(b =>
    b.status !== 'completed' && b.status !== 'cancelled'
  )
  const hasCurrentService = !!currentService

  // 완료된 서비스
  const completedBookings = bookings.filter(b =>
    b.status === 'completed' || b.status === 'cancelled'
  )
  const hasHistory = completedBookings.length > 0

  // 연간 통계 계산
  const currentYear = new Date().getFullYear()
  const yearlyBookings = bookings.filter(b =>
    new Date(b.booking_date).getFullYear() === currentYear
  )
  const yearlyStats = {
    year: currentYear,
    sharpening_count: yearlyBookings.length,
    total_amount: yearlyBookings.reduce((sum, b) => sum + b.total_amount, 0).toLocaleString() + '원'
  }

  // 로그인 상태
  const userStatus = isAuthenticated ? "logged_in" : "logged_out"

  // 데이터 로드

  // 상태별 표시 매핑
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { text: string; icon: string; description: string }> = {
      'pending': {
        text: '영수증',
        icon: '✏️',
        description: '칼갈이 신청이 접수되었어요!\n이제 결제를 진행해 주시면 됩니다'
      },
      'payment_pending': {
        text: '영수증',
        icon: '💳',
        description: '결제 진행 중입니다\n결제해주시면 예약이 마무리 됩니다'
      },
      'confirmed': {
        text: '영수증',
        icon: '📅',
        description: '방문 예약 확정 중입니다\n장인분과 일정을 조율 중이에요 :)'
      },
      'ready_for_pickup': {
        text: '영수증',
        icon: '📦',
        description: '칼을 준비해주세요!\n저희가 곧 픽업하러 갈게요'
      },
      'in_progress': {
        text: '영수증',
        icon: '🔨',
        description: '장인이 칼을 연마하고 있어요\n열심히도 달구시는 모습이 있어요'
      },
      'shipping': {
        text: '영수증',
        icon: '🚚',
        description: '칼이 배송중입니다!\n날카롭게 다듬어진 칼이 빠르게 이동 중이에요 :)'
      },
      'completed': {
        text: '영수증',
        icon: '✅',
        description: '칼갈이 완료!\n날이 무뎌질때 바로 찾아 주세요!'
      },
      'cancelled': {
        text: '영수증',
        icon: '❌',
        description: '예약이 취소되었습니다'
      }
    }
    return statusMap[status] || { text: '영수증', icon: '🔪', description: status }
  }

  // 예약 데이터를 히스토리 아이템으로 변환
  const formatBookingDate = (booking: Booking) => {
    return format(new Date(booking.booking_date), 'M월 d일', { locale: ko })
  }

  const formatBookingItems = (booking: Booking) => {
    if (!booking.booking_items || booking.booking_items.length === 0) {
      return `칼갈이 ${booking.total_quantity}개`
    }
    return booking.booking_items.map(item =>
      `${item.knife_type?.name || '칼'} ${item.quantity}개`
    ).join(', ')
  }

  const handleItemClick = (booking: Booking) => {
    setSelectedItem(booking)
  }

  const handleCloseDetailView = () => {
    setSelectedItem(null)
  }

  const handleLoginClick = () => {
    setShowLoginSheet(false)
    router.push("/client/login")
  }

  const handleSignupClick = () => {
    setShowLoginSheet(false)
    router.push("/client/signup")
  }

  const handleShowLogin = () => {
    setShowLoginSheet(true)
  }

  const handleCloseLogin = () => {
    setShowLoginSheet(false)
  }

  // 영수증 상세 뷰
  if (selectedItem) {
    const payment = payments.get(selectedItem.id)
    const usedCoupon = usedCoupons.get(selectedItem.id)

    // 할인 및 세금 계산
    const discountAmount = usedCoupon?.discount_amount || 0
    const originalAmount = usedCoupon?.original_order_amount || selectedItem.total_amount
    const finalAmount = selectedItem.total_amount
    const taxAmount = Math.floor(finalAmount * 0.1) // 10% 부가세

    return (
      <>
        <TopBanner
          title="이용내역"
          onBackClick={handleCloseDetailView}
        />

        <div className="flex flex-col items-center gap-5 px-5">
          {/* Date Header */}
          <div className="w-full mt-5">
            <div className="flex items-center">
              <BodyMedium color="#333333">{formatBookingDate(selectedItem)}</BodyMedium>
            </div>
          </div>

          {/* Receipt Card */}
          <div className="w-full bg-white rounded-[15px] shadow-[0px_5px_30px_0px_rgba(0,0,0,0.1)] py-[30px]">
            <div className="flex flex-col">
              {/* Receipt Header */}
              <div className="flex flex-col items-center gap-2 px-[30px] pb-[20px]">
                <div className="text-2xl">🧾</div>
                <BodyMedium color="#333333">영수증</BodyMedium>
                <BodyMedium color="#E67E22" className="text-xl font-bold">
                  {selectedItem.total_amount.toLocaleString()}원
                </BodyMedium>
              </div>

              {/* Orange Divider */}
              <div className="w-full h-[2px] bg-[#E67E22] mb-[20px]" />

              {/* Order Details */}
              <div className="px-[30px] space-y-4">
                {/* Order Info */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <CaptionLarge color="#767676">주문번호</CaptionLarge>
                    <CaptionLarge color="#333333">{selectedItem.id.slice(0, 8).toUpperCase()}</CaptionLarge>
                  </div>
                  <div className="flex justify-between">
                    <CaptionLarge color="#767676">주문시간</CaptionLarge>
                    <CaptionLarge color="#333333">{selectedItem.booking_time}</CaptionLarge>
                  </div>
                </div>

                {/* Order Type */}
                <div className="bg-[#FFF9F0] rounded-[10px] p-3">
                  <CaptionLarge color="#E67E22" className="font-bold">칼갈이 서비스</CaptionLarge>
                </div>

                {/* Order Items */}
                <div className="space-y-2">
                  <CaptionLarge color="#E67E22" className="font-bold">일반 주문</CaptionLarge>
                  {selectedItem.booking_items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <CaptionLarge color="#333333">
                        {item.knife_type?.name || '칼'} × {item.quantity}
                      </CaptionLarge>
                      <CaptionLarge color="#333333">{item.total_price.toLocaleString()}원</CaptionLarge>
                    </div>
                  )) || (
                    <div className="flex justify-between items-center">
                      <CaptionLarge color="#333333">칼갈이 × {selectedItem.total_quantity}</CaptionLarge>
                      <CaptionLarge color="#333333">{selectedItem.total_amount.toLocaleString()}원</CaptionLarge>
                    </div>
                  )}
                </div>

                {/* White Divider */}
                <div className="w-full h-[1px] bg-[#F0F0F0]" />

                {/* Additional Info */}
                <div className="bg-[#F8F8F8] rounded-[10px] p-3">
                  <CaptionLarge color="#767676" className="font-bold mb-2">기타 정보</CaptionLarge>
                  <div className="space-y-1">
                    {/* 할인이 있는 경우에만 표시 */}
                    {discountAmount > 0 && (
                      <>
                        <div className="flex justify-between">
                          <CaptionLarge color="#767676">할인</CaptionLarge>
                          <CaptionLarge color="#E67E22">-{discountAmount.toLocaleString()}원</CaptionLarge>
                        </div>
                        {usedCoupon?.coupon && (
                          <div className="flex justify-between">
                            <CaptionLarge color="#767676">{usedCoupon.coupon.name}</CaptionLarge>
                            <CaptionLarge color="#333333"></CaptionLarge>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex justify-between">
                      <CaptionLarge color="#767676">부가세</CaptionLarge>
                      <CaptionLarge color="#333333">{taxAmount.toLocaleString()}원</CaptionLarge>
                    </div>
                    <div className="flex justify-between">
                      <CaptionLarge color="#767676">결제 수단</CaptionLarge>
                      <CaptionLarge color="#333333">
                        {payment ? paymentService.getPaymentMethodText(payment.payment_method) : '무통장입금'}
                      </CaptionLarge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Safe Area */}
        <div className="h-20" />
      </>
    )
  }

  // 로그인하지 않은 상태
  if (userStatus === "logged_out") {
    return (
      <>
        {/* Background */}
        <div className="min-h-screen bg-gradient-to-b from-orange-500 to-orange-400">
          {/* Logo Section */}
          <div className="flex justify-center pt-16 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 text-white text-2xl">📍</div>
              <span className="text-white text-sm font-medium">대구</span>
            </div>
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="text-white text-3xl font-bold">칼가는곳</div>
          </div>

          {/* Main Banner */}
          <div className="mx-5 mb-5 bg-white/10 backdrop-blur-sm rounded-[30px] p-5 h-[360px] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-[30px]" />
            <div className="relative z-10 flex flex-col justify-end h-full">
              <div className="mb-6">
                <h2 className="text-white text-2xl font-bold mb-2 leading-tight">
                  더이상 칼로<br />
                  으깨지 마세요.<br />
                  썰어야죠...
                </h2>
              </div>
              <button
                onClick={() => router.push("/client/knife-request")}
                className="bg-white text-orange-500 rounded-lg py-3 px-6 font-medium"
              >
                첫 칼갈이 신청하기
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mx-5 mb-5 flex gap-5">
            <button
              onClick={() => router.push("/client/price-list")}
              className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between"
            >
              <span className="text-white font-medium">가격표</span>
              <span className="text-white text-xl">💰</span>
            </button>
            <button
              onClick={() => router.push("/client/guide")}
              className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between"
            >
              <span className="text-white font-medium">가이드</span>
              <span className="text-white text-xl">ℹ️</span>
            </button>
          </div>

          {/* Promotional Cards */}
          <div className="mx-5 space-y-4 mb-20">
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-[30px] p-6 text-white">
              <div className="text-xs mb-2 opacity-90">신규고객 전용 1+1 이벤트</div>
              <div className="flex items-center gap-2 text-2xl font-bold">
                <span>하나갈면</span>
                <span className="text-sm">+</span>
                <span className="text-yellow-300">하나무료</span>
              </div>
            </div>
            <div className="bg-orange-100 rounded-[30px] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-orange-600 text-2xl font-bold mb-1">
                    이제 칼갈이도<br />구독으로!
                  </div>
                </div>
                <div className="text-4xl">🔪</div>
              </div>
            </div>
          </div>

          {/* Fixed Login Button */}
          <div className="fixed bottom-5 left-5 right-5">
            <button
              onClick={handleShowLogin}
              className="w-full bg-white text-orange-500 rounded-[30px] py-4 font-bold text-lg shadow-lg"
            >
              로그인하고 이용내역 보기
            </button>
          </div>
        </div>

        {/* Login Bottom Sheet */}
        <BottomSheet
          isOpen={showLoginSheet}
          onClose={handleCloseLogin}
          className="max-h-[400px]"
        >
          <div className="flex flex-col gap-6 p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🛡️</span>
              </div>
              <h3 className="text-xl font-bold mb-2">로그인이 필요해요</h3>
              <p className="text-gray-600 text-sm">
                간편하게 로그인하고<br />
                칼가는곳의 다양한 서비스를 이용해보세요!
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleLoginClick}
                className="w-full bg-orange-500 text-white rounded-lg py-4 font-medium"
              >
                로그인 · 회원가입
              </button>
              <button
                onClick={handleCloseLogin}
                className="w-full bg-gray-100 text-gray-600 rounded-lg py-4 font-medium"
              >
                나중에 가입
              </button>
            </div>
          </div>
        </BottomSheet>
      </>
    )
  }

  // 로딩 상태 (인증 로딩 또는 데이터 로딩)
  if (authLoading || isLoading) {
    return (
      <>
        <TopBanner
          title="이용내역"
          onBackClick={() => router.back()}
        />
        <div className="flex flex-col items-center justify-center h-96">
          <div className="w-12 h-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500 mb-4"></div>
          <BodyMedium color="#767676">로딩 중...</BodyMedium>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Top Banner */}
      <TopBanner
        title="이용내역"
        onBackClick={() => router.back()}
      />

      <div className="flex flex-col items-center gap-5 px-0">
        {/* Current Service Section */}
        {hasCurrentService && currentService && (
          <div className="w-full px-5">
            <div className="flex justify-between items-center gap-5 mb-5">
              <BodyMedium color="#333333">현재 진행 중인 서비스</BodyMedium>
            </div>
            <div className="bg-white rounded-[30px] shadow-[0px_6px_12px_-6px_rgba(24,39,75,0.12),_0px_8px_24px_-4px_rgba(24,39,75,0.08)] p-6 flex flex-col items-center gap-3">
              <div className="text-5xl">{getStatusDisplay(currentService.status).icon}</div>
              <div className="text-center">
                <BodyMedium color="#333333" className="font-bold whitespace-pre-line">
                  {getStatusDisplay(currentService.status).description}
                </BodyMedium>
              </div>
            </div>
          </div>
        )}

        {/* No Current Service */}
        {!hasCurrentService && (
          <div className="w-full px-5">
            <div className="flex justify-between items-center gap-5 mb-5">
              <BodyMedium color="#333333">현재 진행 중인 서비스</BodyMedium>
            </div>
            <div className="bg-white rounded-[30px] shadow-[0px_6px_12px_-6px_rgba(24,39,75,0.12),_0px_8px_24px_-4px_rgba(24,39,75,0.08)] p-6 flex flex-col items-center gap-3">
              <div className="text-5xl">✏️</div>
              <div className="text-center">
                <BodyMedium color="#333333" className="font-bold whitespace-pre-line">
                  현재 진행 중인 서비스가 없습니다{'\n'}
                  칼갈이, 지금 바로 신청해보세요!
                </BodyMedium>
              </div>
              <button
                onClick={() => router.push('/client/knife-request')}
                className="mt-2 bg-[#E67E22] text-white px-6 py-2.5 rounded-lg font-medium text-sm"
              >
                칼갈이 신청하기
              </button>
            </div>
          </div>
        )}

        {/* Year Selection & Stats */}
        <div className="w-full  px-5 space-y-5">
          {/* Year Selector */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BodyMedium color="#333333">{yearlyStats.year}</BodyMedium>
              <ChevronDownIcon size={20} className="text-[#767676]" />
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-between items-center">
            <div>
              <BodySmall color="#767676">올해 연마 횟수</BodySmall>
              <BodyMedium color="#333333">{yearlyStats.sharpening_count}회</BodyMedium>
            </div>
            <div className="text-right">
              <BodySmall color="#767676">총 이용 금액</BodySmall>
              <BodyMedium color="#E67E22">{yearlyStats.total_amount}</BodyMedium>
            </div>
          </div>
        </div>

        {/* History Items or Empty State */}
        {bookings.length > 0 ? (
          <div className="w-full  px-5 space-y-5">
            {bookings.map((booking, index) => (
              <div key={booking.id} className="space-y-3">
                {/* Date Header */}
                <div className="flex items-center">
                  <BodyMedium color="#333333">{formatBookingDate(booking)}</BodyMedium>
                </div>

                {/* History Item */}
                <div
                  className="bg-white p-4 flex items-center gap-4 cursor-pointer"
                  onClick={() => handleItemClick(booking)}
                >
                  <div className="text-xl">{getStatusDisplay(booking.status).icon}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <BodyMedium color="#333333">{booking.total_amount.toLocaleString()}원</BodyMedium>
                      <ChevronRightIcon size={20} className="text-[#767676]" />
                    </div>
                    <BodySmall color="#767676">{formatBookingItems(booking)}</BodySmall>
                  </div>
                </div>

                {/* Separator */}
                {index < bookings.length - 1 && (
                  <div className="w-full h-px bg-[#F0F0F0]" />
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Empty History State */
          <div className="w-full px-5">
            <div className="bg-white rounded-[30px] shadow-[0px_6px_12px_-6px_rgba(24,39,75,0.12),_0px_8px_24px_-4px_rgba(24,39,75,0.08)] p-6 flex flex-col items-center gap-3">
              <div className="text-5xl">📋</div>
              <div className="text-center">
                <BodyMedium color="#333333" className="font-bold whitespace-pre-line">
                  이용 내역이 없습니다{'\n'}
                  칼갈이, 지금 바로 신청해보세요!
                </BodyMedium>
              </div>
              <button
                onClick={() => router.push("/client/knife-request")}
                className="mt-2 bg-[#E67E22] text-white px-6 py-2.5 rounded-lg font-medium text-sm"
              >
                칼갈이 신청하기
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Safe Area */}
      <div className="h-20" />
    </>
  )
}
