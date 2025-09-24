"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import BottomSheet from "@/components/ui/bottom-sheet"
import { Loader2, ChevronLeft, PocketKnifeIcon as Knife, Scissors, Utensils, Info } from "lucide-react"
import { toast } from "sonner"

import { knifeService, type KnifeType, type KnifeTypeWithCouponPrice } from "@/lib/knife-service"
import { useAuthStore } from "@/stores/auth-store"

export default function PriceList() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  
  const [knifeTypes, setKnifeTypes] = useState<KnifeTypeWithCouponPrice[]>([])
  const [selectedKnife, setSelectedKnife] = useState<KnifeTypeWithCouponPrice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)

  // 칼 종류별 아이콘 매핑
  const getKnifeIcon = (name: string) => {
    if (name.includes('가위')) return <Scissors className="w-6 h-6" />
    if (name.includes('과도')) return <Utensils className="w-6 h-6" />
    return <Knife className="w-6 h-6" />
  }

  // 데이터 로드
  useEffect(() => {
    const loadKnifeTypes = async () => {
      try {
        setIsLoading(true)
        const data = await knifeService.getKnifeTypesWithCouponPrice(
          isAuthenticated ? user?.id : undefined
        )
        setKnifeTypes(data)
      } catch (error) {
        console.error('칼 종류 로드 실패:', error)
        toast.error('가격 정보를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadKnifeTypes()
  }, [isAuthenticated, user?.id])

  const handleKnifeSelect = (knife: KnifeTypeWithCouponPrice) => {
    setSelectedKnife(knife)
    setIsBottomSheetOpen(true)
  }

  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false)
    setSelectedKnife(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </Button>
            <h1 className="text-lg font-medium">가격표</h1>
            <div className="w-6" />
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">칼갈이 서비스 가격</h2>
              <p className="text-sm text-gray-600">전문 장인이 직접 연마해드립니다</p>
              {isAuthenticated && (
                <p className="text-xs text-orange-600 mt-1">🎟️ 보유 쿠폰 적용가로 표시됩니다</p>
              )}
            </div>

            <div className="space-y-4">
              {knifeTypes.map((knifeType) => (
                <Card 
                  key={knifeType.id} 
                  className="border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => handleKnifeSelect(knifeType)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-orange-500">{getKnifeIcon(knifeType.name)}</div>
                        <div>
                          <h3 className="font-medium text-gray-800">{knifeType.name}</h3>
                          <p className="text-sm text-gray-500">{knifeType.description}</p>
                          {knifeType.coupon_discount && knifeType.coupon_discount > 0 && (
                            <p className="text-xs text-green-600 font-medium mt-1">
                              🎟️ 쿠폰 할인 -{knifeService.formatPrice(knifeType.coupon_discount)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-400 line-through">
                            시장가 {knifeService.formatPrice(knifeType.market_price)}
                          </div>
                          {knifeType.coupon_price !== undefined && knifeType.coupon_price !== knifeType.discount_price ? (
                            <>
                              <div className="text-sm text-gray-500 line-through">
                                {knifeService.formatPrice(knifeType.discount_price)}
                              </div>
                              <div className="text-lg font-bold text-green-600">
                                {knifeService.formatPrice(knifeType.coupon_price)}
                              </div>
                            </>
                          ) : (
                            <div className="text-lg font-bold text-orange-500">
                              {knifeService.formatPrice(knifeType.discount_price)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h3 className="font-medium text-orange-800 mb-2">📋 서비스 안내</h3>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• 전문 장인의 수작업 연마</li>
                <li>• 무료 수거 및 배송 서비스</li>
                <li>• 연마 후 품질 보증</li>
                <li>• 칼 상태에 따른 맞춤 관리</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 칼 상세 정보 바텀시트 */}
      <BottomSheet isOpen={isBottomSheetOpen} onClose={handleCloseBottomSheet}>
        {selectedKnife && (
          <div className="p-6 space-y-4">
            {/* 칼 정보 헤더 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="text-orange-500 text-2xl">
                  {getKnifeIcon(selectedKnife.name)}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800">{selectedKnife.name}</h3>
              <p className="text-gray-600 mt-1">{selectedKnife.description}</p>
            </div>

            {/* 가격 정보 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">💰 가격 정보</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">시장가</span>
                  <span className="text-sm text-gray-400 line-through">
                    {knifeService.formatPrice(selectedKnife.market_price)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">할인가</span>
                  <span className="text-lg font-bold text-orange-500">
                    {knifeService.formatPrice(selectedKnife.discount_price)}
                  </span>
                </div>
                {selectedKnife.coupon_price !== undefined && selectedKnife.coupon_price !== selectedKnife.discount_price && (
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-sm text-green-700 font-medium">🎟️ 쿠폰 적용가</span>
                    <span className="text-lg font-bold text-green-600">
                      {knifeService.formatPrice(selectedKnife.coupon_price)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 관리 주의사항 */}
            {selectedKnife.care_instructions && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">⚠️ 칼 상태 및 주의사항</h4>
                <p className="text-sm text-blue-700">{selectedKnife.care_instructions}</p>
              </div>
            )}

            {/* 추가 참고사항 */}
            {selectedKnife.additional_notes && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">📝 기타 참고사항</h4>
                <p className="text-sm text-yellow-700">{selectedKnife.additional_notes}</p>
              </div>
            )}

            {/* 관리 방법 추천 */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-3">✨ 추천 관리 방법</h4>
              <ul className="text-sm text-green-700 space-y-1">
                {knifeService.getCareRecommendations(selectedKnife).map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </div>

            {/* 바로 신청 버튼 */}
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-3 mt-6"
              onClick={() => {
                handleCloseBottomSheet()
                router.push('/knife-request')
              }}
            >
              바로 신청하기
            </Button>
          </div>
        )}
      </BottomSheet>
    </>
  )
}