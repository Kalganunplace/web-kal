"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, BodySmall, CaptionMedium, Heading3, Heading2 } from "@/components/ui/typography"

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  originalPrice?: number
  period: string
  features: string[]
  isPopular: boolean
  isActive: boolean
}

export default function SubscriptionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const plans: SubscriptionPlan[] = [
    {
      id: "basic",
      name: "베이직 플랜",
      price: 15000,
      period: "월",
      features: [
        "월 2회 칼갈이 서비스",
        "기본 칼갈이 (식도, 과도)",
        "24시간 고객지원",
        "예약 우선권"
      ],
      isPopular: false,
      isActive: false
    },
    {
      id: "premium",
      name: "프리미엄 플랜",
      price: 25000,
      originalPrice: 30000,
      period: "월",
      features: [
        "월 4회 칼갈이 서비스",
        "모든 종류 칼갈이",
        "당일 서비스 가능",
        "전용 전문가 배정",
        "무료 칼 상태 진단",
        "24시간 고객지원"
      ],
      isPopular: true,
      isActive: true
    },
    {
      id: "pro",
      name: "프로 플랜",
      price: 40000,
      originalPrice: 50000,
      period: "월",
      features: [
        "무제한 칼갈이 서비스",
        "프리미엄 칼갈이 (전문 도구 포함)",
        "당일 서비스 보장",
        "전담 전문가",
        "무료 픽업/배송 서비스",
        "칼 관리 컨설팅",
        "VIP 고객지원"
      ],
      isPopular: false,
      isActive: false
    }
  ]

  const [activePlan, setActivePlan] = useState(plans.find(p => p.isActive))

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setLoading(true)
    
    try {
      // 결제 처리 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert(`${plan.name} 구독이 완료되었습니다!`)
      setActivePlan(plan)
      
      // 실제로는 결제 페이지로 이동
      // router.push(`/payment?plan=${plan.id}`)
    } catch (error) {
      console.error("구독 처리 중 오류:", error)
      alert("구독 처리 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (confirm("정말로 구독을 취소하시겠습니까?")) {
      setLoading(true)
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        alert("구독이 취소되었습니다.")
        setActivePlan(undefined)
      } catch (error) {
        console.error("구독 취소 중 오류:", error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <>
      <TopBanner
        title="구독 관리"
        onBackClick={() => router.back()}
      />

      <div className="flex-1 px-5 py-6 bg-gray-50 space-y-6">
        {/* 현재 구독 상태 */}
        {activePlan ? (
          <div className="bg-white rounded-xl p-6 border-2 border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  ⭐
                </div>
                <div>
                  <Heading3 color="#333333" className="font-bold">
                    {activePlan.name}
                  </Heading3>
                  <BodySmall color="#E67E22" className="font-medium">
                    활성 구독
                  </BodySmall>
                </div>
              </div>
              <div className="text-right">
                <Heading3 color="#333333" className="font-bold">
                  {activePlan.price.toLocaleString()}원
                </Heading3>
                <BodySmall color="#666666">
                  /{activePlan.period}
                </BodySmall>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <BodySmall color="#666666" className="mb-2">다음 결제일</BodySmall>
              <BodyMedium color="#333333" className="font-bold">2024.04.15</BodyMedium>
            </div>
            
            <Button
              onClick={handleCancelSubscription}
              variant="outline"
              className="w-full border-red-200 text-red-500 hover:bg-red-50"
              disabled={loading}
            >
              {loading ? "처리 중..." : "구독 취소"}
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              📋
            </div>
            <Heading3 color="#333333" className="font-bold mb-2">
              활성 구독이 없습니다
            </Heading3>
            <BodyMedium color="#666666">
              구독을 통해 더 편리하고 저렴하게 서비스를 이용하세요
            </BodyMedium>
          </div>
        )}

        {/* 구독 혜택 안내 */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6">
          <Heading3 color="#E67E22" className="font-bold mb-4">구독의 장점</Heading3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">
                ✓
              </div>
              <BodyMedium color="#333333">개별 서비스 대비 최대 40% 절약</BodyMedium>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">
                ✓
              </div>
              <BodyMedium color="#333333">예약 우선권 및 당일 서비스</BodyMedium>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">
                ✓
              </div>
              <BodyMedium color="#333333">전담 전문가 배정</BodyMedium>
            </div>
          </div>
        </div>

        {/* 구독 플랜 목록 */}
        <div>
          <Heading3 color="#333333" className="font-bold mb-4">구독 플랜 선택</Heading3>
          
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-xl p-6 border-2 transition-colors ${
                  plan.isPopular
                    ? "border-orange-500 bg-orange-50"
                    : activePlan?.id === plan.id
                    ? "border-orange-200"
                    : "border-gray-200"
                }`}
              >
                {/* 플랜 헤더 */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Heading3 color="#333333" className="font-bold">
                        {plan.name}
                      </Heading3>
                      {plan.isPopular && (
                        <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          인기
                        </div>
                      )}
                      {activePlan?.id === plan.id && (
                        <div className="bg-green-100 text-green-500 px-2 py-1 rounded-full text-xs font-bold">
                          현재 플랜
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-baseline gap-2">
                      <Heading2 color="#333333" className="font-bold">
                        {plan.price.toLocaleString()}원
                      </Heading2>
                      {plan.originalPrice && (
                        <BodySmall color="#999999" className="line-through">
                          {plan.originalPrice.toLocaleString()}원
                        </BodySmall>
                      )}
                      <BodyMedium color="#666666">
                        /{plan.period}
                      </BodyMedium>
                    </div>
                  </div>
                </div>

                {/* 플랜 특징 */}
                <div className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-4 h-4 text-green-500">✓</div>
                      <BodyMedium color="#666666">{feature}</BodyMedium>
                    </div>
                  ))}
                </div>

                {/* 구독 버튼 */}
                {activePlan?.id === plan.id ? (
                  <div className="text-center py-3">
                    <BodyMedium color="#E67E22" className="font-bold">
                      현재 이용 중인 플랜
                    </BodyMedium>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(plan)}
                    className={`w-full h-12 font-bold rounded-xl ${
                      plan.isPopular
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                    }`}
                    disabled={loading}
                  >
                    {loading ? "처리 중..." : "구독하기"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 구독 안내사항 */}
        <div className="bg-blue-50 rounded-xl p-4">
          <BodySmall color="#4A90E2" className="font-medium mb-2">
            구독 안내사항
          </BodySmall>
          <div className="space-y-1">
            <CaptionMedium color="#4A90E2">
              • 구독은 언제든지 취소 가능합니다
            </CaptionMedium>
            <CaptionMedium color="#4A90E2">
              • 첫 달은 50% 할인가로 이용 가능
            </CaptionMedium>
            <CaptionMedium color="#4A90E2">
              • 사용하지 않은 서비스는 다음 달로 이월됩니다
            </CaptionMedium>
          </div>
        </div>

        {/* Spacer for bottom navigation */}
        <div className="h-20" />
      </div>
    </>
  )
}