"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Calendar } from "@/components/ui/calendar"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { format } from "date-fns"
// import { ko } from "date-fns/locale"
import { useAuthAware } from "@/hooks/use-auth-aware"
import { AuthAware } from "@/components/auth/auth-aware"

interface KnifeItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  quantity: number
  insuranceEnabled: boolean
  insurancePremium: number
}

const timeSlots = [
  { id: "11:00", label: "11:00" },
  { id: "12:00", label: "12:00" },
  { id: "13:00", label: "13:00" },
  { id: "14:00", label: "14:00" },
]

const refundPolicies = [
  "예약된 서비스는 이용일 기준 24시간 전까지 취소 시 전액 환불됩니다.",
  "이용일 당일 취소 또는 무단 취소 시 환불이 불가합니다.",
  "연마 작업이 이미 진행된 경우, 서비스 특성상 환불이 어렵습니다.",
  "정기 구독 상품의 경우, 사용 내역을 기준으로 환불 금액이 산정됩니다.",
  "기타 환불 관련 문의는 고객센터를 통해 접수해 주세요."
]

const termsLinks = [
  { title: "결제 서비스 이용약관", href: "/terms/payment" },
  { title: "개인정보 수집 및 이용 동의", href: "/terms/privacy" },
  { title: "개인정보 제공 안내", href: "/terms/data-sharing" }
]

export default function PaymentConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, executeWithAuth } = useAuthAware()

  // URL 파라미터에서 데이터 파싱
  const [knives] = useState<KnifeItem[]>(() => {
    try {
      const knivesParam = searchParams.get('knives')
      if (knivesParam) {
        return JSON.parse(knivesParam)
      }
    } catch (error) {
      console.error('Error parsing knives data:', error)
    }
    // 기본값
    return [
      {
        id: "1",
        name: "일반 식도류",
        price: 4000,
        originalPrice: 5000,
        quantity: 3,
        insuranceEnabled: true,
        insurancePremium: 1500
      },
      {
        id: "2", 
        name: "정육도",
        price: 5000,
        quantity: 2,
        insuranceEnabled: true,
        insurancePremium: 1500
      }
    ]
  })

  const [bookingDate, setBookingDate] = useState<Date>(new Date("2025-06-06"))
  const [bookingTime, setBookingTime] = useState("13:00")
  const [selectedCoupon, setSelectedCoupon] = useState("신규 유저 1+1 웰컴 쿠폰")
  const [paymentMethod, setPaymentMethod] = useState("simple")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimeSlots, setShowTimeSlots] = useState(false)

  // 금액 계산
  const serviceAmount = knives.reduce((sum, knife) => sum + (knife.price * knife.quantity), 0)
  const insuranceAmount = knives.reduce((sum, knife) => 
    sum + (knife.insuranceEnabled ? knife.insurancePremium * knife.quantity : 0), 0
  )
  const totalBeforeDiscount = serviceAmount + insuranceAmount
  const discountAmount = 9000 // 쿠폰 할인
  const finalAmount = totalBeforeDiscount - discountAmount

  const handleDateTimeChange = () => {
    setShowDatePicker(!showDatePicker)
    setShowTimeSlots(false)
  }

  const handlePayment = () => {
    executeWithAuth(
      () => {
        alert(`${finalAmount.toLocaleString()}원 결제를 진행합니다.`)
        router.push("/usage-history")
      },
      () => {
        const shouldLogin = confirm(
          "결제를 위해 로그인이 필요합니다. 로그인하시겠습니까?"
        )
        if (shouldLogin) {
          router.push("/login?redirect=/payment-confirmation")
        }
      },
      "결제 진행을 위해 로그인이 필요합니다."
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-5 pt-16 pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-9 h-9"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">결제정보 확인</h1>
        <div className="w-9" />
      </div>

      <div className="px-5 pb-24 space-y-5">
        {/* 상품 정보 */}
        <div className="bg-white shadow-sm rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">상품 정보</h2>
          
          <div className="space-y-4">
            {knives.map((knife) => (
              <div key={knife.id} className="bg-gray-100 border border-gray-200 rounded-[30px] p-4">
                <div className="flex items-center gap-4">
                  {/* 칼 이미지 */}
                  <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center">
                    <div className="w-12 h-12 bg-gray-300 rounded"></div>
                  </div>
                  
                  {/* 칼 정보 */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">{knife.name}</h3>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">
                          {knife.price.toLocaleString()}원
                        </p>
                        {knife.originalPrice && (
                          <p className="text-sm text-gray-400 line-through">
                            {knife.originalPrice.toLocaleString()}원
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center">
                            <span className="text-xs">-</span>
                          </button>
                          <span className="font-medium">{knife.quantity}</span>
                          <button className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center">
                            <span className="text-xs">+</span>
                          </button>
                        </div>
                      </div>
                      <span className="font-bold text-gray-800">
                        {(knife.price * knife.quantity).toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* 보험 옵션 */}
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        checked={knife.insuranceEnabled}
                        className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                      />
                      <span className="text-sm font-medium">칼 보험</span>
                      <span className="text-sm text-gray-600">개당 {knife.insurancePremium.toLocaleString()}원</span>
                    </div>
                    <span className="font-bold text-orange-500">
                      {knife.insuranceEnabled ? (knife.insurancePremium * knife.quantity).toLocaleString() : 0}원
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 총 금액 */}
          <div className="mt-4 pt-4 border-t border-gray-300">
            <div className="text-center">
              <div className="text-lg font-semibold mb-1">
                총 수량 {knives.reduce((sum, knife) => sum + knife.quantity, 0)}개
              </div>
              <div className="text-xl font-bold text-orange-500">
                총 금액: {totalBeforeDiscount.toLocaleString()}원 → {finalAmount.toLocaleString()}원
              </div>
              <p className="text-sm text-gray-500 mt-1">부가세 별도</p>
            </div>
          </div>
        </div>

        {/* 예약 일정 */}
        <div className="bg-white shadow-sm rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">예약 일정</h2>
          
          <div className="mb-4">
            <p className="text-lg font-semibold text-orange-500">
              {bookingDate.toLocaleDateString('ko-KR')} {bookingTime === "13:00" ? "오후 1시" : `${bookingTime}`}
            </p>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            예약이 확정되면 바로 알림 드릴게요 :)<br/>
            앱을 확인해 주세요!
          </p>
          
          <Button 
            variant="outline" 
            className="w-full border-gray-300"
            onClick={handleDateTimeChange}
          >
            일정 변경하기
          </Button>

          {/* 날짜/시간 선택 팝업 */}
          {showDatePicker && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg">
              {/* 간단한 날짜 선택 */}
              <div className="mb-4">
                <input
                  type="date"
                  value={bookingDate.toISOString().split('T')[0]}
                  onChange={(e) => setBookingDate(new Date(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div className="mt-4">
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.id}
                      variant={bookingTime === slot.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBookingTime(slot.id)}
                      className={bookingTime === slot.id ? "bg-orange-500 hover:bg-orange-600" : ""}
                    >
                      {slot.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Button 
                className="w-full mt-4 bg-orange-500 hover:bg-orange-600"
                onClick={() => setShowDatePicker(false)}
              >
                날짜 선택
              </Button>
            </div>
          )}
        </div>

        {/* 쿠폰 등록 */}
        <div className="bg-white shadow-sm rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">쿠폰 등록</h2>
          
          <Select value={selectedCoupon} onValueChange={setSelectedCoupon}>
            <SelectTrigger className="w-full bg-white border border-gray-300 rounded-lg">
              <SelectValue placeholder="쿠폰을 선택해주세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="신규 유저 1+1 웰컴 쿠폰">신규 유저 1+1 웰컴 쿠폰</SelectItem>
              <SelectItem value="친구 추천 할인 쿠폰">친구 추천 할인 쿠폰</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 결제 방법 */}
        <div className="bg-white shadow-sm rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">결제 방법</h2>
          
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
            <div className="flex items-center space-x-3">
              <RadioGroupItem 
                value="simple" 
                id="simple"
                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <Label htmlFor="simple" className="text-sm font-medium">간편결제</Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <RadioGroupItem 
                value="bank" 
                id="bank"
                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <Label htmlFor="bank" className="text-sm font-medium">무통장입금</Label>
            </div>
          </RadioGroup>
        </div>

        {/* 환불 정책 */}
        <div className="bg-white shadow-sm rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">환불 정책</h2>
          
          <div className="space-y-3">
            {refundPolicies.map((policy, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-sm text-gray-600 mt-1">•</span>
                <p className="text-sm text-gray-600 leading-relaxed">{policy}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 약관 동의 */}
        <div className="bg-white shadow-sm rounded-lg p-5">
          <div className="space-y-3">
            {termsLinks.map((term) => (
              <div key={term.href} className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-600">{term.title}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
            
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                구매 내용에 동의하시면 결제 버튼을 눌러주세요.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - 고정 결제 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-5">
        <div className="max-w-sm mx-auto">
          <Button
            className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-lg"
            onClick={handlePayment}
          >
            <AuthAware fallback="로그인 후 결제하기">
              {finalAmount.toLocaleString()}원 결제하기
            </AuthAware>
          </Button>
        </div>
      </div>
    </div>
  )
}