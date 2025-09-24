"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Info, Shield, CheckCircle, AlertCircle } from "lucide-react"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { insuranceService, type InsuranceProduct } from "@/lib/insurance-service"
import { toast } from "sonner"

interface InsuranceOptionProps {
  serviceAmount: number
  selectedInsurance?: InsuranceProduct | null
  onInsuranceSelect: (insurance: InsuranceProduct | null, premium: number) => void
}

export default function InsuranceOption({ 
  serviceAmount, 
  selectedInsurance, 
  onInsuranceSelect 
}: InsuranceOptionProps) {
  const [insuranceProducts, setInsuranceProducts] = useState<InsuranceProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [calculatedPremium, setCalculatedPremium] = useState(0)

  // 보험 상품 로드
  useEffect(() => {
    loadInsuranceProducts()
  }, [])

  // 보험료 계산
  useEffect(() => {
    if (selectedInsurance && serviceAmount > 0) {
      const premium = insuranceService.calculatePremium(
        serviceAmount,
        selectedInsurance.coverage_amount,
        selectedInsurance.premium_rate,
        selectedInsurance.min_premium,
        selectedInsurance.max_premium
      )
      setCalculatedPremium(premium)
    } else {
      setCalculatedPremium(0)
    }
  }, [selectedInsurance, serviceAmount])

  const loadInsuranceProducts = async () => {
    try {
      setIsLoading(true)
      // 실제 데이터베이스에서 보험 상품 조회
      const products = await insuranceService.getInsuranceProducts()
      setInsuranceProducts(products)
    } catch (error) {
      console.error('보험 상품 로드 실패:', error)
      toast.error('보험 상품을 불러올 수 없습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInsuranceToggle = (checked: boolean) => {
    if (checked && insuranceProducts.length > 0) {
      const defaultProduct = insuranceProducts[0]
      const premium = insuranceService.calculatePremium(
        serviceAmount,
        defaultProduct.coverage_amount,
        defaultProduct.premium_rate,
        defaultProduct.min_premium,
        defaultProduct.max_premium
      )
      onInsuranceSelect(defaultProduct, premium)
    } else {
      onInsuranceSelect(null, 0)
    }
  }

  if (isLoading) {
    return (
      <div className="mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (insuranceProducts.length === 0) {
    return null
  }

  const mainProduct = insuranceProducts[0]

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">칼 보험</h2>
      
      {/* 보험 옵션 카드 - 피그마 디자인에 맞춘 스타일 */}
      <div className="bg-gray-100 border border-gray-200 rounded-[30px] p-5">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={!!selectedInsurance}
            onCheckedChange={handleInsuranceToggle}
            className="mt-1 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
          />
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-800">{mainProduct.name}</h3>
              <Badge className="text-xs bg-orange-100 text-orange-600 border-orange-200">
                추천
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              {mainProduct.description}
            </p>

            {/* 보험료 정보 */}
            <div className="bg-white rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">보험료</span>
                <span className="font-bold text-orange-500">
                  {insuranceService.formatCurrency(calculatedPremium)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">최대 보장금액</span>
                <span className="text-sm font-medium text-gray-800">
                  {insuranceService.formatCurrency(mainProduct.coverage_amount)}
                </span>
              </div>
            </div>

            {/* 보장 내용 */}
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium text-gray-700">보장 내용: </span>
                <span className="text-gray-600">
                  {mainProduct.coverage_details.coverage_types.join(', ')}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">처리 기간: </span>
                <span className="text-gray-600">{mainProduct.coverage_details.processing_time}</span>
              </div>
            </div>

            {/* 약관 보기 버튼 */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="textButton" size="sm" className="mt-2 p-0 h-auto text-orange-500 hover:text-orange-600">
                  약관 자세히 보기
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm mx-4 max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg">{mainProduct.name} 약관</DialogTitle>
                </DialogHeader>
                <DialogDescription asChild>
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">보장 내용</h4>
                      <ul className="space-y-1 text-gray-600">
                        {mainProduct.coverage_details.coverage_types.map((type, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                            {type}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">보장 제외</h4>
                      <ul className="space-y-1 text-gray-600">
                        {mainProduct.coverage_details.exclusions.map((exclusion, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                            {exclusion}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-semibold text-gray-800 mb-1">필요 서류</p>
                      <ul className="text-gray-600 space-y-1">
                        {mainProduct.coverage_details.required_documents.map((doc, index) => (
                          <li key={index}>• {doc}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">
                      {mainProduct.terms}
                    </div>
                  </div>
                </DialogDescription>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* 보험 미가입시 안내 */}
      {!selectedInsurance && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700 leading-relaxed">
              <p className="font-medium mb-1">보험 가입을 권장합니다</p>
              <p>전문 작업 중에도 예상치 못한 사고가 발생할 수 있습니다. 소중한 칼을 안전하게 보호하세요.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}