"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Shield, Receipt, Percent, CreditCard } from "lucide-react"

import { paymentService, type PaymentMethod } from "@/lib/payment-service"
import { type InsuranceProduct } from "@/lib/insurance-service"

interface PaymentSummaryProps {
  serviceAmount: number
  selectedInsurance?: InsuranceProduct | null
  insurancePremium?: number
  discountAmount?: number
  selectedPaymentMethod?: PaymentMethod | null
  className?: string
}

export default function PaymentSummary({
  serviceAmount,
  selectedInsurance,
  insurancePremium = 0,
  discountAmount = 0,
  selectedPaymentMethod,
  className = ""
}: PaymentSummaryProps) {
  const totalAmount = serviceAmount + insurancePremium - discountAmount

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-800">결제 금액</h3>
        </div>

        <div className="space-y-3">
          {/* 서비스 금액 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">칼갈이 서비스</span>
            <span className="text-sm font-medium text-gray-800">
              {paymentService.formatCurrency(serviceAmount)}
            </span>
          </div>

          {/* 보험료 */}
          {selectedInsurance && insurancePremium > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-orange-500" />
                <span className="text-sm text-gray-600">손상 보험</span>
              </div>
              <span className="text-sm font-medium text-gray-800">
                {paymentService.formatCurrency(insurancePremium)}
              </span>
            </div>
          )}

          {/* 할인 금액 */}
          {discountAmount > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Percent className="w-3 h-3 text-green-500" />
                <span className="text-sm text-gray-600">할인</span>
              </div>
              <span className="text-sm font-medium text-green-600">
                -{paymentService.formatCurrency(discountAmount)}
              </span>
            </div>
          )}

          <Separator className="my-3" />

          {/* 총 결제 금액 */}
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-gray-800">총 결제 금액</span>
            <span className="text-lg font-bold text-orange-600">
              {paymentService.formatCurrency(totalAmount)}
            </span>
          </div>

          {/* 선택된 결제 방법 */}
          {selectedPaymentMethod && (
            <>
              <Separator className="my-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">결제 방법</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">
                    {selectedPaymentMethod.name}
                  </span>
                  {selectedPaymentMethod.type === 'simple_pay' && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-600">
                      간편
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}

          {/* 보험 상세 정보 */}
          {selectedInsurance && (
            <>
              <Separator className="my-3" />
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">
                    보험 상세 정보
                  </span>
                </div>
                <div className="space-y-1 text-xs text-orange-700">
                  <div className="flex justify-between">
                    <span>상품명</span>
                    <span>{selectedInsurance.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>최대 보장금액</span>
                    <span>{paymentService.formatCurrency(selectedInsurance.coverage_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>보험료율</span>
                    <span>{(selectedInsurance.premium_rate * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 부가세 안내 */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 leading-relaxed">
              • 위 금액은 부가세가 포함된 최종 결제 금액입니다<br/>
              • 결제 완료 후 서비스가 시작되며, 취소/환불은 고객센터에 문의해 주세요<br/>
              • 보험 가입 시 서비스 완료 후 30일간 보장됩니다
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}