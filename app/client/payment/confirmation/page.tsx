"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, CheckCircle2, Home, ClipboardList } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

import { paymentService, type Payment } from "@/lib/payment-service"
import { bookingService, type Booking } from "@/lib/booking-service"
import { useAuthStore } from "@/stores/auth-store"

function PaymentConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuthStore()

  const paymentId = searchParams.get('payment_id')

  const [payment, setPayment] = useState<Payment | null>(null)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated || !user?.id || !paymentId) {
        router.push('/client/login')
        return
      }

      try {
        setIsLoading(true)

        // 결제 정보 조회
        const paymentData = await paymentService.getPaymentById(paymentId, user.id)
        if (!paymentData) {
          router.push('/client/usage-history')
          return
        }

        setPayment(paymentData)

        // 예약 정보 조회
        if (paymentData.booking_id) {
          const bookingData = await bookingService.getBookingById(paymentData.booking_id, user.id)
          if (bookingData) {
            setBooking(bookingData)
          }
        }

      } catch (error) {
        console.error('데이터 로드 실패:', error)
        router.push('/client/usage-history')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [paymentId, isAuthenticated, user?.id, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        </div>
      </div>
    )
  }

  if (!payment || !booking) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <h1 className="text-lg font-medium">결제 완료</h1>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Success Icon */}
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              결제가 완료되었습니다!
            </h2>
            <p className="text-gray-600">
              {payment.payment_method === 'bank_transfer' 
                ? '무통장입금 안내를 확인해주세요' 
                : '결제가 성공적으로 처리되었습니다'}
            </p>
          </div>

          {/* Order Summary */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">주문 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">주문번호</span>
                  <span className="font-medium">{payment.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">예약일시</span>
                  <span className="font-medium">
                    {format(new Date(booking.booking_date), 'M월 d일', { locale: ko })} {booking.booking_time.slice(0, 5)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">칼 개수</span>
                  <span className="font-medium">{booking.total_quantity}개</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">결제 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">결제 방법</span>
                  <span className="font-medium">
                    {paymentService.getPaymentMethodText(payment.payment_method)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">결제 금액</span>
                  <span className="font-bold text-orange-500">
                    {paymentService.formatPrice(payment.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">결제 상태</span>
                  <span className={`font-medium ${
                    payment.payment_status === 'confirmed' ? 'text-green-600' :
                    payment.payment_status === 'pending' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>
                    {paymentService.getPaymentStatusText(payment.payment_status)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <h4 className="font-medium text-orange-900 mb-2">다음 단계</h4>
              <ul className="text-sm text-orange-800 space-y-1">
                {payment.payment_method === 'bank_transfer' ? (
                  <>
                    <li>• 안내된 계좌로 입금해주세요</li>
                    <li>• 입금 확인 후 예약이 확정됩니다</li>
                    <li>• 24시간 이내 입금 부탁드립니다</li>
                  </>
                ) : (
                  <>
                    <li>• 예약이 확정되었습니다</li>
                    <li>• 예약일에 칼을 준비해주세요</li>
                    <li>• 변경사항은 고객센터로 문의해주세요</li>
                  </>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            {payment.payment_method === 'bank_transfer' && (
              <Button
                onClick={() => router.push(`/payment/bank-transfer?payment_id=${payment.id}`)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                입금 정보 확인
              </Button>
            )}
            
            <Button
              onClick={() => router.push('/client/usage-history')}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <ClipboardList className="w-4 h-4" />
              주문내역 보기
            </Button>

            <Button
              onClick={() => router.push('/')}
              variant="ghost"
              className="w-full flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              홈으로 이동
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
          ⏳
        </div>
      </div>
    }>
      <PaymentConfirmationContent />
    </Suspense>
  )
}