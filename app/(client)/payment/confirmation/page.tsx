"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle2,
  ChevronLeft,
  Clock,
  AlertTriangle,
  ArrowRight,
  Calendar,
  MapPin,
  CreditCard,
  FileText
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

import { paymentService, type Payment } from "@/lib/payment-service"
import { bookingService, type Booking } from "@/lib/booking-service"
import { useAuthStore } from "@/stores/auth-store"

export default function PaymentConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuthStore()

  const paymentId = searchParams.get('payment_id')
  const bookingId = searchParams.get('booking_id')

  const [payment, setPayment] = useState<Payment | null>(null)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated || !user?.id) {
        router.push('/login')
        return
      }

      if (!paymentId && !bookingId) {
        toast.error('잘못된 접근입니다.')
        router.push('/usage-history')
        return
      }

      try {
        setIsLoading(true)

        let paymentData: Payment | null = null
        let bookingData: Booking | null = null

        // 결제 정보 조회
        if (paymentId) {
          paymentData = await paymentService.getPaymentById(paymentId, user.id)
        } else if (bookingId) {
          paymentData = await paymentService.getPaymentByBookingId(bookingId, user.id)
        }

        if (!paymentData) {
          toast.error('결제 정보를 찾을 수 없습니다.')
          router.push('/usage-history')
          return
        }

        setPayment(paymentData)

        // 예약 정보 조회
        bookingData = await bookingService.getBookingById(paymentData.booking_id, user.id)
        setBooking(bookingData)

      } catch (error) {
        console.error('데이터 로드 실패:', error)
        toast.error('정보를 불러오는 중 오류가 발생했습니다.')
        router.push('/usage-history')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [paymentId, bookingId, isAuthenticated, user?.id, router])

  // 상태별 표시 정보
  const getStatusInfo = () => {
    if (!payment) return null

    switch (payment.payment_status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: '입금 대기 중',
          description: '입금 확인 후 서비스가 시작됩니다.',
          action: '입금 정보 확인'
        }
      case 'confirmed':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: '결제 완료',
          description: '결제가 완료되었습니다. 서비스를 진행하겠습니다.',
          action: '이용내역 확인'
        }
      case 'failed':
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: '결제 실패',
          description: '결제 처리 중 문제가 발생했습니다.',
          action: '고객센터 문의'
        }
      case 'cancelled':
        return {
          icon: AlertTriangle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: '결제 취소',
          description: '결제가 취소되었습니다.',
          action: '다시 주문하기'
        }
      default:
        return null
    }
  }

  const statusInfo = getStatusInfo()

  // 액션 버튼 핸들러
  const handleAction = () => {
    if (!payment || !statusInfo) return

    switch (payment.payment_status) {
      case 'pending':
        router.push(`/payment/bank-transfer?payment_id=${payment.id}`)
        break
      case 'confirmed':
      case 'failed':
      case 'cancelled':
        router.push('/usage-history')
        break
      default:
        router.push('/usage-history')
    }
  }

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

  if (!payment || !booking || !statusInfo) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="sm" onClick={() => router.push('/usage-history')}>
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <h1 className="text-lg font-medium">결제 확인</h1>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="p-4 pb-20 max-h-[80vh] overflow-y-auto space-y-4">
          {/* 결제 상태 */}
          <Card className={`${statusInfo.borderColor} ${statusInfo.bgColor}`}>
            <CardContent className="p-6 text-center">
              <statusInfo.icon className={`w-12 h-12 ${statusInfo.color} mx-auto mb-3`} />
              <h2 className={`text-xl font-bold ${statusInfo.color} mb-2`}>
                {statusInfo.title}
              </h2>
              <p className={`text-sm ${statusInfo.color.replace('600', '700')}`}>
                {statusInfo.description}
              </p>
            </CardContent>
          </Card>

          {/* 주문 정보 */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">주문 정보</h3>

              <div className="space-y-3">
                {/* 예약 날짜/시간 */}
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">수거 일정</p>
                    <p className="font-medium">
                      {format(new Date(booking.booking_date), 'M월 d일 (E)', { locale: ko })} {booking.booking_time}
                    </p>
                  </div>
                </div>

                {/* 수거 주소 */}
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">수거 주소</p>
                    <p className="font-medium text-sm">
                      {/* 주소는 booking에서 가져와야 하는데, 스키마에 따라 조정 */}
                      서울시 강남구 테헤란로 123
                    </p>
                  </div>
                </div>

                {/* 주문 수량 */}
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">주문 수량</p>
                    <p className="font-medium">
                      칼갈이 {booking.total_quantity}개
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 결제 정보 */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">결제 정보</h3>

              <div className="space-y-3">
                {/* 결제 방법 */}
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">결제 방법</p>
                    <p className="font-medium">
                      {paymentService.getPaymentMethodText(payment.payment_method)}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* 결제 금액 */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">칼갈이 비용</span>
                  <span className="font-medium">
                    {paymentService.formatPrice(payment.amount)}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-medium">총 결제 금액</span>
                  <span className="text-xl font-bold text-orange-500">
                    {paymentService.formatPrice(payment.amount)}
                  </span>
                </div>

                {/* 입금자명 (무통장입금인 경우) */}
                {payment.payment_method === 'bank_transfer' && payment.depositor_name && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">입금자명</span>
                      <span className="font-medium text-sm">{payment.depositor_name}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 결제 상태 정보 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">결제 상태</span>
                <Badge className={statusInfo.color.replace('text-', 'bg-').replace('600', '100') + ' ' + statusInfo.color}>
                  {paymentService.getPaymentStatusText(payment.payment_status)}
                </Badge>
              </div>

              {payment.confirmation_note && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>관리자 메모:</strong> {payment.confirmation_note}
                  </p>
                </div>
              )}

              {payment.confirmed_at && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    확인 시간: {paymentService.formatDate(payment.confirmed_at)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 특별 요청사항 */}
          {booking.special_instructions && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 mb-2">특별 요청사항</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {booking.special_instructions}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 액션 버튼 */}
          <Button
            onClick={handleAction}
            className={`w-full py-3 ${
              payment.payment_status === 'confirmed'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-orange-500 hover:bg-orange-600'
            } text-white flex items-center justify-center gap-2`}
          >
            {statusInfo.action}
            <ArrowRight className="w-4 h-4" />
          </Button>

          {/* 고객센터 안내 */}
          <Card className="border-gray-200">
            <CardContent className="p-4 text-center">
              <h4 className="font-medium text-gray-900 mb-1">문의사항이 있으신가요?</h4>
              <p className="text-sm text-gray-600 mb-3">
                결제나 서비스 관련 문의는 고객센터로 연락해 주세요.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/customer-service')}
              >
                고객센터 바로가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}