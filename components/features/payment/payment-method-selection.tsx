"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Building2, Smartphone, Info, AlertCircle } from "lucide-react"
import { toast } from "sonner"

import { paymentService } from "@/lib/payment-service"

export interface PaymentMethod {
  id: string
  type: 'bank_transfer' | 'card' | 'virtual_account'
  name: string
  description: string
  icon: any
  isRecommended?: boolean
  isComingSoon?: boolean
}

interface PaymentMethodSelectionProps {
  amount: number
  onMethodSelect: (method: PaymentMethod, bankInfo?: { bankName: string, accountNumber: string, depositorName: string }) => void
  className?: string
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'bank_transfer',
    type: 'bank_transfer',
    name: '무통장입금',
    description: '본인 계좌에서 직접 입금하세요',
    icon: Building2,
    isRecommended: true
  },
  {
    id: 'card',
    type: 'card',
    name: '신용카드',
    description: '신용카드로 간편하게 결제하세요',
    icon: CreditCard,
    isComingSoon: true
  },
  {
    id: 'virtual_account',
    type: 'virtual_account',
    name: '가상계좌',
    description: '가상계좌 발급 후 입금하세요',
    icon: Smartphone,
    isComingSoon: true
  }
]

const banks = [
  '국민은행', '신한은행', '우리은행', 'KEB하나은행', '농협은행',
  '기업은행', '대구은행', '부산은행', '경남은행', '광주은행',
  '전북은행', '제주은행', '신협', '새마을금고', '우체국'
]

export default function PaymentMethodSelection({
  amount,
  onMethodSelect,
  className = ""
}: PaymentMethodSelectionProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [depositorName, setDepositorName] = useState("")


  const handleMethodSelect = (method: PaymentMethod) => {
    if (method.isComingSoon) {
      toast.info('준비 중인 결제 방법입니다.')
      return
    }
    setSelectedMethod(method)
  }

  const handleProceed = () => {
    if (!selectedMethod) {
      toast.error('결제 방법을 선택해주세요.')
      return
    }

    if (selectedMethod.type === 'bank_transfer') {
      if (!bankName.trim()) {
        toast.error('은행명을 선택해주세요.')
        return
      }
      if (!accountNumber.trim()) {
        toast.error('계좌번호를 입력해주세요.')
        return
      }
      if (!depositorName.trim()) {
        toast.error('예금주명을 입력해주세요.')
        return
      }

      onMethodSelect(selectedMethod, {
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        depositorName: depositorName.trim()
      })
    } else {
      onMethodSelect(selectedMethod)
    }
  }


  return (
    <div className={`space-y-6 ${className}`}>
      {/* 결제 금액 표시 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">결제 금액</span>
            <span className="text-xl font-bold text-orange-500">
              {paymentService.formatPrice(amount)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 결제 방법 선택 */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">결제 방법</h3>

        {paymentMethods.map((method) => {
          const Icon = method.icon
          const isSelected = selectedMethod?.id === method.id

          return (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'ring-2 ring-orange-500 bg-orange-50'
                  : 'hover:shadow-md'
              } ${method.isComingSoon ? 'opacity-60' : ''}`}
              onClick={() => handleMethodSelect(method)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isSelected ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{method.name}</h4>
                        {method.isRecommended && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                            추천
                          </Badge>
                        )}
                        {method.isComingSoon && (
                          <Badge variant="outline" className="text-xs text-gray-500">
                            준비 중
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 무통장입금 선택 시 계좌 정보 입력 */}
      {selectedMethod?.type === 'bank_transfer' && (
        <Card className="border-orange-200">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-orange-500" />
              <h4 className="font-medium text-orange-900">입금할 계좌 정보</h4>
            </div>

            <div className="space-y-4">
              {/* 은행 선택 */}
              <div className="space-y-2">
                <Label htmlFor="bank-name" className="text-sm font-medium">
                  은행명 <span className="text-red-500">*</span>
                </Label>
                <Select value={bankName} onValueChange={setBankName}>
                  <SelectTrigger>
                    <SelectValue placeholder="은행을 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank} value={bank}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 계좌번호 입력 */}
              <div className="space-y-2">
                <Label htmlFor="account-number" className="text-sm font-medium">
                  계좌번호 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="account-number"
                  placeholder="'-' 없이 숫자만 입력"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>

              {/* 예금주명 입력 */}
              <div className="space-y-2">
                <Label htmlFor="depositor-name" className="text-sm font-medium">
                  예금주명 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="depositor-name"
                  placeholder="계좌 소유자 성함"
                  value={depositorName}
                  onChange={(e) => setDepositorName(e.target.value)}
                />
              </div>

              {/* 안내 문구 */}
              <div className="bg-blue-50 p-3 rounded-lg flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">입금 안내</p>
                  <ul className="space-y-0.5">
                    <li>• 위 계좌에서 결제 금액만큼 저희 계좌로 입금해주세요</li>
                    <li>• 입금 후 자동으로 확인되어 서비스가 진행됩니다</li>
                    <li>• 정확한 금액을 입금해주시기 바랍니다</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 계속하기 버튼 */}
      {selectedMethod && (
        <Button
          onClick={handleProceed}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
          disabled={selectedMethod.type === 'bank_transfer' && (!bankName.trim() || !accountNumber.trim() || !depositorName.trim())}
        >
          {selectedMethod.type === 'bank_transfer' ? '입금 정보 확인' : '결제하기'}
        </Button>
      )}
    </div>
  )
}