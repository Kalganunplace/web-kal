"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Plus, Minus, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/common/date-picker"

// 칼 종류 데이터
const knifeTypes = [
  { id: "chef", name: "일반 식도류", price: 4000 },
  { id: "cleaver", name: "정육도", price: 5000 },
  { id: "paring", name: "과도", price: 3000 },
  { id: "scissors", name: "회칼", price: 6000 },
  { id: "utility", name: "일반가위", price: 2000 },
]

const timeSlots = [
  { id: "11:00", label: "11:00", available: true },
  { id: "12:00", label: "12:00", available: true },
  { id: "13:00", label: "13:00", available: true },
  { id: "14:00", label: "14:00", available: true },
]

interface SelectedKnife {
  id: string
  type: string
  name: string
  price: number
  quantity: number
  insuranceEnabled: boolean
}

export default function KnifeRequestPage() {
  const router = useRouter()
  
  // 예약 정보
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2025, 5, 6))
  const [selectedTime, setSelectedTime] = useState("12:00")
  const [showKnifeSelector, setShowKnifeSelector] = useState(false)
  
  // 칼 선택
  const [selectedKnives, setSelectedKnives] = useState<SelectedKnife[]>([])
  const [selectedKnifeType, setSelectedKnifeType] = useState("")
  
  // 보험 대화상자
  const [showInsuranceDialog, setShowInsuranceDialog] = useState(false)

  // 칼 추가
  const handleAddKnife = () => {
    const knifeType = knifeTypes.find(type => type.id === selectedKnifeType)
    if (knifeType) {
      const newKnife: SelectedKnife = {
        id: Date.now().toString(),
        type: knifeType.id,
        name: knifeType.name,
        price: knifeType.price,
        quantity: 1,
        insuranceEnabled: false
      }
      setSelectedKnives([...selectedKnives, newKnife])
      setSelectedKnifeType("")
      setShowKnifeSelector(false)
    }
  }

  // 수량 조절
  const updateKnifeQuantity = (id: string, change: number) => {
    setSelectedKnives(knives => 
      knives.map(knife => 
        knife.id === id 
          ? { ...knife, quantity: Math.max(0, knife.quantity + change) }
          : knife
      ).filter(knife => knife.quantity > 0)
    )
  }

  // 보험 토글
  const toggleInsurance = (id: string, enabled: boolean) => {
    setSelectedKnives(knives =>
      knives.map(knife =>
        knife.id === id
          ? { ...knife, insuranceEnabled: enabled }
          : knife
      )
    )
  }

  // 총 금액 계산
  const totalAmount = selectedKnives.reduce((sum, knife) => {
    const knifeAmount = knife.price * knife.quantity
    const insuranceAmount = knife.insuranceEnabled ? 1500 * knife.quantity : 0
    return sum + knifeAmount + insuranceAmount
  }, 0)

  const totalQuantity = selectedKnives.reduce((sum, knife) => sum + knife.quantity, 0)

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
        <h1 className="text-xl font-bold text-gray-800">칼갈이 신청</h1>
        <div className="w-9" />
      </div>

      <div className="px-5 pb-32">
        {/* 예약 섹션 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">예약</h2>
          
          {/* 날짜 선택 */}
          <div className="mb-4">
            <DatePicker
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              placeholder="날짜 선택"
            />
          </div>

          {/* 시간 선택 */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {timeSlots.map((slot) => (
              <Button
                key={slot.id}
                variant={selectedTime === slot.id ? "primary" : "outline"}
                size="sm"
                onClick={() => setSelectedTime(slot.id)}
                disabled={!slot.available}
                className={`h-10 ${
                  selectedTime === slot.id 
                    ? "bg-orange-500 hover:bg-orange-600 text-white" 
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {slot.label}
              </Button>
            ))}
          </div>

          <p className="text-sm text-gray-600">
            연마할 칼을 추가해 주세요!
          </p>
        </div>

        {/* 칼 추가하기 드롭다운 */}
        <div className="mb-6">
          <Select 
            value={selectedKnifeType} 
            onValueChange={setSelectedKnifeType}
            open={showKnifeSelector}
            onOpenChange={setShowKnifeSelector}
          >
            <SelectTrigger className="w-full bg-white border border-orange-300 rounded-lg h-12 text-orange-600">
              <div className="flex items-center gap-2">
                <span>🔪</span>
                <SelectValue placeholder="칼 추가하기" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {knifeTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{type.name}</span>
                    <span className="ml-4 text-gray-500">{type.price.toLocaleString()}원</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedKnifeType && (
            <div className="mt-2">
              <Button
                onClick={handleAddKnife}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                추가하기
              </Button>
            </div>
          )}
        </div>

        {/* 선택된 칼 목록 */}
        {selectedKnives.length > 0 && (
          <div className="space-y-4 mb-6">
            {selectedKnives.map((knife) => (
              <div key={knife.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-4 mb-3">
                  {/* 칼 아이콘 */}
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                    🔪
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{knife.name}</h3>
                    <p className="text-sm text-gray-600">개당 {knife.price.toLocaleString()}원</p>
                  </div>

                  {/* 수량 조절 */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateKnifeQuantity(knife.id, -1)}
                      className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{knife.quantity}</span>
                    <button
                      onClick={() => updateKnifeQuantity(knife.id, 1)}
                      className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      {(knife.price * knife.quantity).toLocaleString()}원
                    </p>
                  </div>
                </div>

                {/* 보험 옵션 */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={knife.insuranceEnabled}
                      onCheckedChange={(checked) => toggleInsurance(knife.id, !!checked)}
                      className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    />
                    <span className="text-sm font-medium">칼 보험</span>
                    <span className="text-sm text-gray-600">
                      연마 중 손상, 파손 시 칼값을 무료로 보상해 드립니다 (개당 1,500원)
                    </span>
                    
                    <Dialog open={showInsuranceDialog} onOpenChange={setShowInsuranceDialog}>
                      <DialogTrigger asChild>
                        <button className="text-orange-500 underline text-sm ml-1">
                          자세히
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-sm mx-4">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-orange-500" />
                            칼가는곳 칼 보험 약관
                          </DialogTitle>
                        </DialogHeader>
                        <DialogDescription className="space-y-4 text-sm">
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">제1조 (목적)</h4>
                            <p className="text-gray-600 leading-relaxed">
                              이 약관은 주식회사 칼가는곳이 제공하는 칼("청약자")이 제공하는 칼갈이 중개 서비스 등과 관련하여 회사와 회원, 칼과 회원 및 칼 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">제2조 (서비스)</h4>
                            <p className="text-gray-600 leading-relaxed">
                              1. "서비스"라 함사가 운영하는 웹사이트 및 모바일 앱을 통해 제공하는 서비스를 의미합니다.<br/>
                              2. 회사가 승인 과정을 거쳐 칼 손상이 발생된 칼에 대해서는 서비스 특성상 보상이 어려우나,<br/>
                              3. 제각기 수리가 아닌 신규 칼 체 칼을 통해서 칼송 및 이송에저허여 발송된 정보서 손성화될 수 있습니다.
                            </p>
                          </div>
                          
                          <div className="bg-orange-50 p-3 rounded-lg">
                            <p className="text-sm text-orange-800 font-medium">
                              보험료: 개당 1,500원<br/>
                              보상한도: 칼 구매가격 한도 내<br/>
                              보험기간: 서비스 시작부터 완료까지
                            </p>
                          </div>
                        </DialogDescription>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {knife.insuranceEnabled && (
                    <span className="font-bold text-orange-500">
                      {(1500 * knife.quantity).toLocaleString()}원
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 총 합계 */}
        {selectedKnives.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold">총 수량 {totalQuantity}개</span>
              <span className="text-xl font-bold text-orange-600">
                총 금액: {totalAmount.toLocaleString()}원
              </span>
            </div>
            <p className="text-sm text-gray-600 text-center">부가세 별도</p>
          </div>
        )}
      </div>

      {/* Footer - 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-5">
        <div className="max-w-sm mx-auto">
          <Button
            className={`w-full h-14 font-bold text-lg rounded-lg ${
              selectedKnives.length > 0
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={selectedKnives.length === 0}
            onClick={() => {
              if (selectedKnives.length > 0 && selectedDate) {
                // 결제 확인 페이지로 이동
                const params = new URLSearchParams({
                  knives: JSON.stringify(selectedKnives),
                  selectedDate: selectedDate.toLocaleDateString('ko-KR', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit' 
                  }).replace(/\. /g, '.').replace(/\.$/, ''),
                  selectedTime,
                  totalAmount: totalAmount.toString(),
                  totalQuantity: totalQuantity.toString()
                })
                router.push(`/payment-confirmation?${params.toString()}`)
              }
            }}
          >
            바로 신청
          </Button>
        </div>
      </div>

      {/* 칼 보험으로 안심하세요 팝업 (마지막 화면) */}
      {selectedKnives.some(knife => knife.insuranceEnabled) && (
        <Dialog>
          <DialogContent className="max-w-sm mx-4">
            <DialogHeader>
              <DialogTitle className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-orange-500" />
                </div>
                칼 보험으로 안심하세요
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-center space-y-4">
              <p className="text-gray-600">
                연마 중 칼 손상 발생 시,<br/>
                동일 가격대 새 칼을 무상제공 드립니다
              </p>
              
              <div className="space-y-2">
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  칼 보험 가입하기
                </Button>
                <Button variant="outline" className="w-full">
                  나중에 가입
                </Button>
              </div>
            </DialogDescription>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}