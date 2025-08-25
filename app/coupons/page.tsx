"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, BodySmall, CaptionMedium, Heading2, Heading3 } from "@/components/ui/typography"
import { Skeleton } from "@/components/ui/skeleton"

interface Coupon {
  id: string
  title: string
  description: string
  validUntil: string
  isUsed: boolean
  category: "신규" | "웰컴" | "일반"
  discountType: "1+1" | "무료" | "할인"
  remainingDays: number
}

export default function CouponsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [coupons, setCoupons] = useState<Coupon[]>([])

  useEffect(() => {
    // 쿠폰 데이터 로딩 시뮬레이션
    const loadCoupons = async () => {
      setLoading(true)
      
      // 2초 로딩 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockCoupons: Coupon[] = [
        {
          id: "1",
          title: "신규 유저 1+1 웰컴 쿠폰",
          description: "[웰컴 쿠폰] 1차로 연마시 한차례 무료",
          validUntil: "2025.07.06 11시59분까지",
          isUsed: false,
          category: "신규",
          discountType: "1+1",
          remainingDays: 30
        }
      ]
      
      setCoupons(mockCoupons)
      setLoading(false)
    }

    loadCoupons()
  }, [])

  const availableCoupons = coupons.filter(coupon => !coupon.isUsed)
  const usedCoupons = coupons.filter(coupon => coupon.isUsed)

  if (loading) {
    return (
      <>
        <TopBanner
          title="내 보유 쿠폰"
          onBackClick={() => router.back()}
        />
        
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <BodyMedium color="#666666">쿠폰을 불러오는 중...</BodyMedium>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBanner
        title="내 보유 쿠폰"
        onBackClick={() => router.back()}
      />

      <div className="flex-1 px-5 py-6 bg-gray-50 space-y-6">
        {/* 프로모션 배너 */}
        <div className="relative bg-gradient-to-r from-orange-200 via-orange-300 to-orange-400 rounded-3xl p-6 overflow-hidden">
          {/* 배경 디자인 요소 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-600 rounded-full translate-y-12 -translate-x-12 opacity-20"></div>
          
          <div className="relative z-10">
            <div className="text-right mb-2">
              <BodySmall color="white" className="opacity-90">~2025.12</BodySmall>
            </div>
            
            <div className="text-center mb-4">
              <CaptionMedium color="white" className="opacity-90 mb-2">신규고객 전용 1+1 이벤트</CaptionMedium>
              <Heading2 color="white" className="font-bold text-2xl leading-tight">
                하나갈면 + 하나무료
              </Heading2>
            </div>
            
            <div className="flex justify-center">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-white opacity-60 rounded-full"></div>
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div className="w-2 h-2 bg-white opacity-60 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 보유쿠폰 요약 */}
        <div className="text-left">
          <Heading3 color="#333333" className="font-bold">
            보유쿠폰 {availableCoupons.length}개
          </Heading3>
        </div>

        {/* 쿠폰 없을 때 */}
        {coupons.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              🎫
            </div>
            <Heading3 color="#333333" className="font-medium mb-2">보유쿠폰 없음</Heading3>
            <BodyMedium color="#666666">아직 보유한 쿠폰이 없어요</BodyMedium>
            <div className="mt-6">
              <Button 
                onClick={() => router.push("/")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8"
              >
                서비스 이용하기
              </Button>
            </div>
          </div>
        )}

        {/* 사용 가능한 쿠폰 목록 */}
        {availableCoupons.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <BodyMedium color="#666666">{availableCoupons.length > 0 ? `보유쿠폰 ${availableCoupons.length}개` : "보유쿠폰 없음"}</BodyMedium>
              <button className="text-orange-500 font-medium">
                <BodySmall color="#E67E22">자세히보기</BodySmall>
              </button>
            </div>
            
            {availableCoupons.map((coupon) => (
              <div key={coupon.id} className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-orange-100 text-orange-500 px-2 py-1 rounded text-xs font-bold">
                        {coupon.category}
                      </div>
                      <div className="bg-red-100 text-red-500 px-2 py-1 rounded text-xs font-bold">
                        {coupon.discountType}
                      </div>
                    </div>
                    <Heading3 color="#333333" className="font-bold mb-1">
                      {coupon.title}
                    </Heading3>
                    <BodyMedium color="#666666" className="mb-3">
                      {coupon.description}
                    </BodyMedium>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="text-orange-500 font-bold">{coupon.remainingDays}일 남음</span>
                      <span className="mx-2">•</span>
                      <span>{coupon.validUntil}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-3">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold">
                    자세히보기
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 사용 완료 쿠폰 (있다면) */}
        {usedCoupons.length > 0 && (
          <div className="space-y-4">
            <div className="border-t border-gray-200 pt-6">
              <BodyMedium color="#666666" className="mb-4">사용 완료 쿠폰</BodyMedium>
            </div>
            
            {usedCoupons.map((coupon) => (
              <div key={coupon.id} className="bg-gray-50 rounded-2xl p-5 opacity-60">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <Heading3 color="#999999" className="font-bold mb-1">
                      {coupon.title}
                    </Heading3>
                    <BodyMedium color="#999999" className="mb-3">
                      {coupon.description}
                    </BodyMedium>
                    <CaptionMedium color="#999999">
                      {coupon.validUntil}
                    </CaptionMedium>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="text-center py-2">
                    <BodySmall color="#999999">사용 완료</BodySmall>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Spacer for bottom navigation */}
        <div className="h-20" />
      </div>
    </>
  )
}