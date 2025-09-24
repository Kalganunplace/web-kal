"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronDown, ChevronRight, Copy, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useAuthAware } from "@/hooks/use-auth-aware"
import { AuthAware } from "@/components/auth/auth-aware"
import { DatePicker } from "@/components/common/date-picker"
import { couponService, type UserCoupon } from "@/lib/coupon-service"
import { insuranceService } from "@/lib/insurance-service"
import { paymentService, type BankAccount } from "@/lib/payment-service"

interface KnifeItem {
  id: string
  name: string
  price: number
  quantity: number
  insuranceEnabled: boolean
}

const timeSlots = [
  { id: "11:00", label: "11:00" },
  { id: "12:00", label: "12:00" },
  { id: "13:00", label: "13:00" },
  { id: "14:00", label: "14:00" },
]

function PaymentConfirmationContent() {
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
        quantity: 3,
        insuranceEnabled: true,
      },
      {
        id: "2", 
        name: "정육도",
        price: 5000,
        quantity: 2,
        insuranceEnabled: false,
      }
    ]
  })

  const [bookingDate, setBookingDate] = useState<Date>(new Date(2025, 5, 6))
  const [bookingTime, setBookingTime] = useState("12:00")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("간편결제")
  
  // 무통장입금 관련 상태
  const [remitterName, setRemitterName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [incomeDeduction, setIncomeDeduction] = useState("")
  const [taxReceipt, setTaxReceipt] = useState(false)
  const [showBankInfo, setShowBankInfo] = useState(false)
  const [paymentCompleted, setPaymentCompleted] = useState(false)
  const [bankTransferStep, setBankTransferStep] = useState(1) // 1: 은행선택, 2: 계좌정보, 3: 입금자정보, 4: 완료
  const [selectedBank, setSelectedBank] = useState("대구은행")
  const [accountCopied, setAccountCopied] = useState(false)
  const [recipientCopied, setRecipientCopied] = useState(false)
  
  // DB 데이터 상태
  const [userCoupons, setUserCoupons] = useState<UserCoupon[]>([])
  const [insurancePremium, setInsurancePremium] = useState(1500)
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null)
  const [loading, setLoading] = useState(true)

  // 금액 계산
  const serviceAmount = knives.reduce((sum, knife) => sum + (knife.price * knife.quantity), 0)

  // 쿠폰 및 보험료 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        if (user?.id) {
          // 사용자 쿠폰 조회
          const availableCoupons = await couponService.getAvailableUserCoupons(
            user.id, 
            serviceAmount,
            knives.map(k => k.name)
          )
          setUserCoupons(availableCoupons)
        }

        // 보험료 조회
        const insuranceProducts = await insuranceService.getInsuranceProducts()
        const knifeInsurance = insuranceProducts.find(p => p.product_type === 'knife_damage')
        if (knifeInsurance) {
          setInsurancePremium(knifeInsurance.monthly_premium)
        }

        // 은행 계좌 정보 조회
        const defaultBankAccount = await paymentService.getDefaultBankAccount()
        setBankAccount(defaultBankAccount)
      } catch (error) {
        console.error('데이터 로드 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.id, serviceAmount, knives])

  const insuranceAmount = knives.reduce((sum, knife) => 
    sum + (knife.insuranceEnabled ? insurancePremium * knife.quantity : 0), 0
  )
  const totalBeforeDiscount = serviceAmount + insuranceAmount
  
  // 선택된 쿠폰의 할인 금액 계산
  const selectedUserCoupon = userCoupons.find(uc => uc.id === selectedCoupon)
  const discountAmount = selectedUserCoupon ? 
    couponService.calculateDiscount(selectedUserCoupon.coupon!, totalBeforeDiscount) : 0
    
  const totalAmount = Math.max(0, totalBeforeDiscount - discountAmount)
  const totalQuantity = knives.reduce((sum, knife) => sum + knife.quantity, 0)

  const handleDateTimeChange = () => {
    setShowDatePicker(!showDatePicker)
  }

  const handlePayment = async () => {
    executeWithAuth(async () => {
      try {
        if (paymentMethod === "무통장입금") {
          // 무통장입금 플로우 시작
          setShowBankInfo(true)
          setBankTransferStep(1)
        } else {
          // 간편결제 처리
          // 쿠폰 사용 처리
          if (selectedUserCoupon && user?.id) {
            const bookingId = `booking_${Date.now()}`
            await couponService.useCoupon(
              selectedUserCoupon.id,
              bookingId,
              discountAmount,
              totalBeforeDiscount
            )
          }
          
          console.log('간편결제 진행', {
            totalAmount,
            discountAmount,
            selectedCoupon: selectedUserCoupon?.coupon?.name,
            paymentMethod
          })
        }
        
      } catch (error) {
        console.error('결제 처리 오류:', error)
        alert('결제 처리 중 오류가 발생했습니다.')
      }
    })
  }

  const handleBankTransferComplete = async () => {
    try {
      // 입금자명 필수 확인
      if (!remitterName.trim()) {
        alert('송금자명을 입력해주세요.')
        return
      }

      if (!user?.id || !bankAccount) {
        alert('사용자 정보 또는 은행 계좌 정보가 없습니다.')
        return
      }

      // 결제 데이터 생성
      const bookingId = `booking_${Date.now()}`
      
      // 결제 생성
      const payment = await paymentService.createPayment(user.id, {
        booking_id: bookingId,
        amount: totalBeforeDiscount,
        discount_amount: discountAmount,
        insurance_amount: insuranceAmount,
        payment_method_type: 'bank_transfer',
        remitter_name: remitterName,
        remitter_phone: phoneNumber,
        tax_receipt_requested: taxReceipt,
        income_deduction_type: incomeDeduction as 'personal' | 'business' | undefined,
        bank_name: bankAccount.bank_name,
        account_number: bankAccount.account_number
      })

      // 쿠폰 사용 처리
      if (selectedUserCoupon) {
        await couponService.useCoupon(
          selectedUserCoupon.id,
          bookingId,
          discountAmount,
          totalBeforeDiscount
        )
      }

      console.log('무통장입금 완료', {
        paymentId: payment.id,
        totalAmount,
        discountAmount,
        remitterName,
        phoneNumber,
        incomeDeduction,
        taxReceipt
      })

      // 입금 완료 화면 표시
      setBankTransferStep(4)
      
    } catch (error) {
      console.error('무통장입금 처리 오류:', error)
      alert('입금 처리 중 오류가 발생했습니다.')
    }
  }

  const copyToClipboard = async (text: string, type: 'account' | 'recipient') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'account') {
        setAccountCopied(true)
        setTimeout(() => setAccountCopied(false), 2000)
      } else {
        setRecipientCopied(true)
        setTimeout(() => setRecipientCopied(false), 2000)
      }
    } catch (error) {
      console.error('복사 실패:', error)
    }
  }

  const nextBankTransferStep = () => {
    setBankTransferStep(prev => prev + 1)
  }

  const closeBankTransfer = () => {
    setShowBankInfo(false)
    setBankTransferStep(1)
    setRemitterName("")
    setPhoneNumber("")
    setIncomeDeduction("")
    setTaxReceipt(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-5 pt-16 pb-4 bg-white">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-9 h-9"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">결제정보 확인</h1>
        <div className="w-9" />
      </div>

      <div className="px-5 pb-32">
        {/* 상품 정보 */}
        <div className="bg-white rounded-lg p-5 mb-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">상품 정보</h2>
          
          <div className="space-y-3">
            {knives.map((knife) => (
              <div key={knife.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  {/* 칼 이미지 */}
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border">
                    🔪
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{knife.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {knife.insuranceEnabled && (
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                          칼 보험 개당 {insurancePremium.toLocaleString()}원
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 수량 */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{knife.quantity}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      {((knife.price + (knife.insuranceEnabled ? insurancePremium : 0)) * knife.quantity).toLocaleString()}원
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 총 수량 및 금액 */}
          <div className="mt-4 pt-4 border-t">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">서비스 금액</span>
                <span className="text-sm font-medium">{serviceAmount.toLocaleString()}원</span>
              </div>
              {insuranceAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">보험료</span>
                  <span className="text-sm font-medium">{insuranceAmount.toLocaleString()}원</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-orange-500">쿠폰 할인</span>
                  <span className="text-sm font-medium text-orange-500">-{discountAmount.toLocaleString()}원</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-lg font-semibold">총 수량 {totalQuantity}개</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-orange-500">총 금액: {totalAmount.toLocaleString()}원</div>
                  <div className="text-sm text-gray-500">부가세 별도</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 예약 일정 */}
        <div className="bg-white rounded-lg p-5 mb-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">예약 일정</h2>
          
          <div className="text-orange-500 font-medium mb-3">
            {bookingDate.toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit' 
            }).replace(/\. /g, '.').replace(/\.$/, '')} {bookingTime}
          </div>
          
          <div className="text-sm text-gray-600 mb-4">
            예약이 확정되면 바로 픽업이 요구됩니다:) <br />
            언제 픽업할게 주세요!
          </div>

          <Button 
            variant="outline" 
            className="w-full text-orange-500 border-orange-500 hover:bg-orange-50"
            onClick={handleDateTimeChange}
          >
            일정 변경하기
          </Button>

          {/* 날짜/시간 선택 팝업 */}
          {showDatePicker && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg">
              {/* 날짜 선택 */}
              <div className="mb-4">
                <DatePicker
                  selectedDate={bookingDate}
                  onDateSelect={(date) => date && setBookingDate(date)}
                  placeholder="날짜 선택"
                />
              </div>
              
              <div className="mt-4">
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.id}
                      variant={bookingTime === slot.id ? "primary" : "outline"}
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
        <div className="bg-white rounded-lg p-5 mb-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">쿠폰 등록</h2>
          
          <Select value={selectedCoupon} onValueChange={setSelectedCoupon}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="쿠폰 선택하기" />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <SelectItem value="loading" disabled>쿠폰 불러오는 중...</SelectItem>
              ) : userCoupons.length > 0 ? (
                userCoupons.map((userCoupon) => (
                  <SelectItem key={userCoupon.id} value={userCoupon.id}>
                    {userCoupon.coupon?.name} - {couponService.formatDiscountValue(userCoupon.coupon!)}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-coupons" disabled>사용 가능한 쿠폰이 없습니다</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* 결제 방법 */}
        <div className="bg-white rounded-lg p-5 mb-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">결제 방법</h2>
          
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-2 py-3">
              <RadioGroupItem value="간편결제" id="simple" />
              <Label htmlFor="simple" className="font-medium">간편결제</Label>
            </div>
            <div className="flex items-center space-x-2 py-3">
              <RadioGroupItem value="무통장입금" id="bank" />
              <Label htmlFor="bank" className="font-medium">무통장입금</Label>
            </div>
          </RadioGroup>
        </div>

        {/* 환불 정책 */}
        <div className="bg-white rounded-lg p-5 mb-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">환불 정책</h2>
          
          <div className="space-y-2 text-sm text-gray-600">
            <p>• 예약한 서비스는 이용 기준 24시간 전까지 전액 환불이 가능합니다.</p>
            <p>• 이용 당일 취소 또는 당일 사용 시 환불이 어렵습니다.</p>
            <p>• 칼 상태가 이미 변경된 작업, 서비스 특성상 환불이 어려우나,</p>
            <p>• 기타 환불 문의는 고객센터를 통해 접수해 주세요.</p>
          </div>
        </div>

        {/* 약관 동의 */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-600">결제 서비스 이용약관</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-600">개인정보 수집 및 이용 동의</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-medium text-gray-600">개인정보 제공 안내</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="pt-2 text-center">
            <p className="text-sm text-gray-600">
              구매 내용에 동의하시면 결제 버튼을 눌러주세요.
            </p>
          </div>
        </div>
      </div>

      {/* Bank Transfer Modal */}
      {showBankInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <button onClick={closeBankTransfer}>
                <X className="w-6 h-6 text-gray-600" />
              </button>
              <h2 className="text-lg font-bold">무통장입금</h2>
              <div className="w-6" />
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Step 1: Bank Selection */}
              {bankTransferStep === 1 && (
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-6">은행을 선택해 주세요</h3>
                  
                  <div className="space-y-3">
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer ${
                        selectedBank === "대구은행" ? "border-orange-500 bg-orange-50" : "border-gray-200"
                      }`}
                      onClick={() => setSelectedBank("대구은행")}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">대구은행</span>
                        {selectedBank === "대구은행" && <Check className="w-5 h-5 text-orange-500" />}
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-8 h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-lg"
                    onClick={nextBankTransferStep}
                  >
                    다음
                  </Button>
                </div>
              )}

              {/* Step 2: Account Info */}
              {bankTransferStep === 2 && (
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-6">계좌번호를 확인해 주세요</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-5 mb-6">
                    <div className="text-center space-y-4">
                      <div>
                        <div className="text-lg font-bold text-gray-800">
                          {bankAccount?.bank_name || "대구은행"}
                        </div>
                        <div className="text-2xl font-bold text-orange-500 mt-2">
                          {bankAccount?.account_number || "793901-04-265174"}
                        </div>
                        <button 
                          onClick={() => copyToClipboard(
                            (bankAccount?.account_number || "79390104265174").replace(/-/g, ""), 
                            'account'
                          )}
                          className="flex items-center gap-2 mx-auto mt-2 text-sm text-gray-600 hover:text-orange-500"
                        >
                          {accountCopied ? (
                            <><Check className="w-4 h-4" /> 복사됨</>
                          ) : (
                            <><Copy className="w-4 h-4" /> 계좌번호 복사</>
                          )}
                        </button>
                      </div>
                      
                      <div className="border-t pt-4">
                        <div className="text-sm text-gray-600">예금주</div>
                        <div className="text-lg font-bold text-gray-800">
                          {bankAccount?.account_holder || "(주)칼가는곳"}
                        </div>
                        <button 
                          onClick={() => copyToClipboard(
                            bankAccount?.account_holder || "(주)칼가는곳", 
                            'recipient'
                          )}
                          className="flex items-center gap-2 mx-auto mt-2 text-sm text-gray-600 hover:text-orange-500"
                        >
                          {recipientCopied ? (
                            <><Check className="w-4 h-4" /> 복사됨</>
                          ) : (
                            <><Copy className="w-4 h-4" /> 예금주 복사</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4 mb-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">입금하실 금액</div>
                      <div className="text-2xl font-bold text-orange-500 mt-1">
                        {totalAmount.toLocaleString()}원
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 space-y-2 mb-8">
                    <p>• 위 계좌로 정확한 금액을 입금해 주세요.</p>
                    <p>• 입금자명은 예약하신 분의 이름과 일치해야 합니다.</p>
                    <p>• 입금 확인 후 서비스가 예약 완료됩니다.</p>
                  </div>

                  <Button
                    className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-lg"
                    onClick={nextBankTransferStep}
                  >
                    입금자 정보 입력
                  </Button>
                </div>
              )}

              {/* Step 3: Remitter Info */}
              {bankTransferStep === 3 && (
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-6">입금자 정보를 입력해 주세요</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        송금자명 (필수)
                      </label>
                      <Input
                        value={remitterName}
                        onChange={(e) => setRemitterName(e.target.value)}
                        placeholder="입금하시는 분의 이름을 입력해 주세요"
                        className="h-12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        연락처
                      </label>
                      <Input
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="010-0000-0000"
                        className="h-12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        소득공제용 현금영수증
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="taxReceipt"
                            checked={!taxReceipt}
                            onChange={() => setTaxReceipt(false)}
                            className="mr-2"
                          />
                          신청안함
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="taxReceipt"
                            checked={taxReceipt}
                            onChange={() => setTaxReceipt(true)}
                            className="mr-2"
                          />
                          신청
                        </label>
                      </div>
                    </div>

                    {taxReceipt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          소득공제 구분
                        </label>
                        <Select value={incomeDeduction} onValueChange={setIncomeDeduction}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="선택해 주세요" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="personal">개인소득공제</SelectItem>
                            <SelectItem value="business">사업자소득공제</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-lg mt-8"
                    onClick={handleBankTransferComplete}
                    disabled={!remitterName.trim()}
                  >
                    입금 정보 저장
                  </Button>
                </div>
              )}

              {/* Step 4: Completion */}
              {bankTransferStep === 4 && (
                <div className="p-5 text-center">
                  <div className="mb-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">입금 정보가 저장되었습니다</h3>
                    <p className="text-gray-600">입금 확인 후 서비스 예약이 완료됩니다.</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-5 mb-8 text-left">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">은행</span>
                        <span className="font-medium">{bankAccount?.bank_name || "대구은행"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">계좌번호</span>
                        <span className="font-medium">{bankAccount?.account_number || "793901-04-265174"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">예금주</span>
                        <span className="font-medium">{bankAccount?.account_holder || "(주)칼가는곳"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">입금금액</span>
                        <span className="font-bold text-orange-500">{totalAmount.toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">입금자명</span>
                        <span className="font-medium">{remitterName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-lg"
                      onClick={() => {
                        closeBankTransfer()
                        router.push('/usage-history')
                      }}
                    >
                      확인
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full h-12 border-gray-300 text-gray-700"
                      onClick={() => setBankTransferStep(2)}
                    >
                      계좌정보 다시보기
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer - 고정 결제 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-5">
        <div className="max-w-sm mx-auto">
          <Button
            className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-lg"
            onClick={handlePayment}
          >
            <AuthAware fallback="로그인 후 결제하기">
              {totalAmount.toLocaleString()}원 결제하기
            </AuthAware>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function PaymentConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-600">로딩 중...</div>
    </div>}>
      <PaymentConfirmationContent />
    </Suspense>
  )
}