"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Zap,
  Check,
  Info,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

import { paymentService, type PaymentMethod } from "@/lib/payment-service"

interface PaymentMethodSelectorProps {
  selectedMethodId?: string
  onMethodSelect: (method: PaymentMethod | null) => void
  totalAmount: number
  className?: string
}

export default function PaymentMethodSelector({ 
  selectedMethodId, 
  onMethodSelect,
  totalAmount,
  className = ""
}: PaymentMethodSelectorProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPaymentMethods()
  }, [])

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true)
      // 실제 데이터베이스에서 결제 방법 조회
      const methods = await paymentService.getPaymentMethods()
      setPaymentMethods(methods)
    } catch (error) {
      console.error('결제 방법 로드 실패:', error)
      toast.error('결제 방법을 불러올 수 없습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const getMethodIcon = (method: PaymentMethod) => {
    if (method.provider) {
      const providerIcons: { [key: string]: string } = {
        'toss': '💳',
        'kakao': '🟡',  
        'naver': '🟢',
        'payco': '🔴'
      }
      return providerIcons[method.provider] || '💳'
    }

    switch (method.type) {
      case 'simple_pay':
        return <Zap className="w-5 h-5 text-yellow-500" />
      case 'card':
        return <CreditCard className="w-5 h-5 text-blue-500" />
      case 'mobile':
        return <Smartphone className="w-5 h-5 text-green-500" />
      case 'bank_transfer':
        return <Building2 className="w-5 h-5 text-gray-500" />
      default:
        return <CreditCard className="w-5 h-5 text-gray-500" />
    }
  }

  const getMethodBadge = (method: PaymentMethod) => {
    if (method.provider === 'toss') {
      return <Badge className="text-xs bg-blue-100 text-blue-600 border-blue-200">인기</Badge>
    }
    
    if (method.type === 'simple_pay') {
      return <Badge className="text-xs bg-orange-100 text-orange-600 border-orange-200">추천</Badge>
    }

    return null
  }

  const getMethodDescription = (method: PaymentMethod) => {
    const descriptions: { [key: string]: string } = {
      'toss': '간편하고 빠른 결제',
      'kakao': '카카오 계정으로 간편 결제',
      'naver': '네이버페이 포인트 적립',
      'payco': 'NHN페이코 간편 결제'
    }

    if (method.provider && descriptions[method.provider]) {
      return descriptions[method.provider]
    }

    const typeDescriptions: { [key: string]: string } = {
      'card': '신용/체크카드 결제',
      'bank_transfer': '계좌이체 결제',
      'mobile': '휴대폰 결제'
    }

    return typeDescriptions[method.type] || ''
  }

  const handleMethodSelect = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId)
    onMethodSelect(method || null)
  }

  // 타입별로 결제 방법 그룹화
  const groupedMethods = paymentMethods.reduce((groups, method) => {
    const group = method.type
    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(method)
    return groups
  }, {} as { [key: string]: PaymentMethod[] })

  const getGroupTitle = (type: string) => {
    const titles: { [key: string]: string } = {
      'simple_pay': '간편결제',
      'card': '카드결제',
      'bank_transfer': '계좌이체',
      'mobile': '휴대폰결제'
    }
    return titles[type] || '기타'
  }

  if (isLoading) {
    return (
      <div className={`mb-6 animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (paymentMethods.length === 0) {
    return (
      <div className={`mb-6 ${className}`}>
        <h2 className="text-lg font-semibold mb-4 text-gray-800">결제 방법</h2>
        <div className="bg-gray-100 rounded-[30px] p-8 text-center">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-600">사용 가능한 결제 방법이 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`mb-6 ${className}`}>
      <h2 className="text-lg font-semibold mb-4 text-gray-800">결제 방법</h2>
      
      {/* 피그마 디자인에 맞춘 결제 방법 선택 */}
      <div className="space-y-3">
        <RadioGroup value={selectedMethodId || ''} onValueChange={handleMethodSelect}>
          {Object.entries(groupedMethods).map(([type, methods], groupIndex) => (
            <div key={type}>
              {/* 그룹 타이틀 */}
              <div className="mb-3">
                <h3 className="text-base font-semibold text-gray-700 mb-3">
                  {getGroupTitle(type)}
                </h3>
                
                <div className="space-y-2">
                  {methods.map((method) => (
                    <div key={method.id} className="relative">
                      <Label
                        htmlFor={method.id}
                        className={`flex items-center p-4 bg-gray-100 border border-gray-200 rounded-[30px] cursor-pointer transition-all hover:bg-gray-200 ${
                          selectedMethodId === method.id
                            ? 'ring-2 ring-orange-500 bg-orange-50 border-orange-200'
                            : ''
                        }`}
                      >
                        <RadioGroupItem
                          value={method.id}
                          id={method.id}
                          className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                        />
                        
                        <div className="flex items-center gap-3 ml-3 flex-1">
                          {/* 아이콘 */}
                          <div className="text-2xl">
                            {typeof getMethodIcon(method) === 'string' 
                              ? getMethodIcon(method)
                              : <div className="w-6 h-6">{getMethodIcon(method)}</div>
                            }
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-800">
                                {method.name}
                              </span>
                              {getMethodBadge(method)}
                            </div>
                            <p className="text-sm text-gray-500">
                              {getMethodDescription(method)}
                            </p>
                          </div>
                        </div>

                        {selectedMethodId === method.id && (
                          <Check className="w-5 h-5 text-orange-500" />
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 구분선 (마지막 그룹이 아닌 경우) */}
              {groupIndex < Object.entries(groupedMethods).length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* 결제 금액 표시 */}
      <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="font-medium text-orange-800">결제 예정 금액</span>
          <span className="text-lg font-bold text-orange-600">
            {paymentService.formatCurrency(totalAmount)}
          </span>
        </div>
      </div>

      {/* 결제 안내 */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700 leading-relaxed">
            <p className="font-medium mb-1">안전한 결제 시스템</p>
            <ul className="space-y-1 text-blue-600">
              <li>• SSL 보안 인증서로 안전하게 보호</li>
              <li>• 결제 완료 후 즉시 서비스 시작</li>
              <li>• 24시간 고객지원 서비스 제공</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}