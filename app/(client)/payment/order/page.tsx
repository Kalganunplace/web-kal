"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { toast } from "sonner"

import KnifeRequest from "@/components/features/knife/knife-request"
import PaymentMethodSelection, { type PaymentMethod } from "@/components/features/payment/payment-method-selection"
import { paymentService, type CreatePaymentData } from "@/lib/payment-service"
import { bookingService, type CreateBookingData } from "@/lib/booking-service"
import { useAuthStore } from "@/stores/auth-store"

type OrderStep = 'booking' | 'payment' | 'complete'

interface OrderData {
  booking: CreateBookingData | null
  payment: {
    method: PaymentMethod | null
    bankInfo?: { bankName: string, accountNumber: string, depositorName: string }
  }
}

export default function OrderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuthStore()

  const [currentStep, setCurrentStep] = useState<OrderStep>('booking')
  const [orderData, setOrderData] = useState<OrderData>({
    booking: null,
    payment: {
      method: null,
      bankInfo: undefined
    }
  })
  const [isProcessing, setIsProcessing] = useState(false)

  // 단계별 진행률
  const getProgress = () => {
    switch (currentStep) {
      case 'booking': return 33
      case 'payment': return 66
      case 'complete': return 100
      default: return 0
    }
  }

  // 단계별 제목
  const getStepTitle = () => {
    switch (currentStep) {
      case 'booking': return '칼갈이 신청'
      case 'payment': return '결제 방법 선택'
      case 'complete': return '주문 완료'
      default: return ''
    }
  }

  // 예약 데이터 처리
  const handleBookingComplete = (bookingData: CreateBookingData) => {
    setOrderData({
      ...orderData,
      booking: bookingData
    })
    setCurrentStep('payment')
  }

  // 결제 방법 선택 처리
  const handlePaymentMethodSelect = (method: PaymentMethod, bankInfo?: { bankName: string, accountNumber: string, depositorName: string }) => {
    setOrderData({
      ...orderData,
      payment: {
        method,
        bankInfo
      }
    })
    processOrder(method, bankInfo)
  }

  // 주문 처리
  const processOrder = async (paymentMethod: PaymentMethod, bankInfo?: { bankName: string, accountNumber: string, depositorName: string }) => {
    if (!orderData.booking || !user?.id || !isAuthenticated) {
      toast.error('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    try {
      setIsProcessing(true)

      // 1. 예약 생성
      const booking = await bookingService.createBooking(user.id, orderData.booking)

      // 2. 결제 생성
      const paymentData: CreatePaymentData = {
        booking_id: booking.id,
        payment_method: paymentMethod.type,
        amount: booking.total_amount,
        customer_bank_name: bankInfo?.bankName,
        customer_account_number: bankInfo?.accountNumber,
        depositor_name: bankInfo?.depositorName,
        payment_note: `칼갈이 서비스 결제 - ${booking.total_quantity}개`
      }

      const payment = await paymentService.createPayment(user.id, paymentData)

      toast.success('주문이 완료되었습니다!')

      // 3. 결제 방법에 따른 리다이렉트
      if (paymentMethod.type === 'bank_transfer') {
        router.push(`/payment/bank-transfer?payment_id=${payment.id}`)
      } else {
        router.push(`/payment/confirmation?payment_id=${payment.id}`)
      }

    } catch (error) {
      console.error('주문 처리 실패:', error)
      toast.error('주문 처리 중 오류가 발생했습니다.')
    } finally {
      setIsProcessing(false)
    }
  }

  // 뒤로 가기
  const handleBack = () => {
    if (currentStep === 'booking') {
      router.back()
    } else if (currentStep === 'payment') {
      setCurrentStep('booking')
    }
  }

  // 인증 확인
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={isProcessing}
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </Button>
            <h1 className="text-lg font-medium">{getStepTitle()}</h1>
            <div className="w-6" />
          </div>

          {/* 진행률 표시 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span className={currentStep === 'booking' ? 'text-orange-600 font-medium' : ''}>
                신청
              </span>
              <span className={currentStep === 'payment' ? 'text-orange-600 font-medium' : ''}>
                결제
              </span>
              <span className={currentStep === 'complete' ? 'text-orange-600 font-medium' : ''}>
                완료
              </span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          {isProcessing && (
            <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">주문을 처리하고 있습니다...</p>
              </div>
            </div>
          )}

          {/* 예약 신청 단계 */}
          {currentStep === 'booking' && (
            <div className="p-4">
              <KnifeRequestForm onComplete={handleBookingComplete} />
            </div>
          )}

          {/* 결제 방법 선택 단계 */}
          {currentStep === 'payment' && orderData.booking && (
            <div className="p-4">
              <PaymentMethodSelection
                amount={orderData.booking.items.reduce((sum, item) => {
                  // 임시로 계산, 실제로는 knifeService에서 가격 정보를 가져와야 함
                  return sum + (item.quantity * 15000) // 기본 가격 15,000원으로 가정
                }, 0)}
                onMethodSelect={handlePaymentMethodSelect}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 칼 주문 폼 컴포넌트
function KnifeRequestForm({ onComplete }: { onComplete: (data: CreateBookingData) => void }) {
  return (
    <KnifeRequest
      onComplete={onComplete}
      showSubmitButton={true}
    />
  )
}