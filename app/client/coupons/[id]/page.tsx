"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, BodySmall, CaptionMedium, Heading2, Heading3 } from "@/components/ui/typography"
import { createClient } from "@/lib/auth/supabase"
import { useAuthAware } from "@/hooks/use-auth-aware"

interface Coupon {
  id: string
  title: string
  description: string
  validUntil: string
  isUsed: boolean
  category: "신규" | "웰컴" | "일반"
  discountType: "1+1" | "무료" | "할인"
  remainingDays: number
  minOrderAmount?: number
  maxDiscountAmount?: number
  applicableItems?: string[]
  terms?: string[]
}

export default function CouponDetailPage() {
  const router = useRouter()
  const params = useParams()
  const couponId = params.id as string
  const { user, isAuthenticated } = useAuthAware()
  const [loading, setLoading] = useState(true)
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadCoupon = async () => {
      setLoading(true)

      if (!isAuthenticated || !user) {
        setLoading(false)
        router.push('/client/login')
        return
      }

      try {
        // 쿠폰 상세 정보 조회
        const { data, error } = await supabase
          .from('user_coupons')
          .select(`
            *,
            coupon_type:coupon_types(*)
          `)
          .eq('id', couponId)
          .eq('user_id', user.id)
          .single()

        if (error || !data) {
          console.error('쿠폰 조회 오류:', error)
          router.push('/client/coupons')
          return
        }

        // DB 데이터를 Coupon 형태로 변환
        const couponType = data.coupon_type
        const expiresAt = data.expires_at ? new Date(data.expires_at) : null
        const remainingDays = expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0

        const formattedCoupon: Coupon = {
          id: data.id,
          title: couponType?.name || '쿠폰',
          description: couponType?.description || '',
          validUntil: expiresAt ? expiresAt.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(/\. /g, '.') + '까지' : '무제한',
          isUsed: data.is_used,
          category: couponType?.discount_type === 'percentage' ? '할인' : '신규',
          discountType: couponType?.discount_type === 'fixed_amount' ? '할인' :
                       couponType?.discount_type === 'percentage' ? '할인' : '무료',
          remainingDays,
          minOrderAmount: couponType?.min_order_amount || 0,
          maxDiscountAmount: couponType?.max_discount_amount,
          applicableItems: ['식도', '과도', '빵칼 (가정 기본 3종)'],
          terms: [
            '본 쿠폰은 발행일로부터 서비스 예약 시에만 이용 가능',
            '고객당 1회 사용 가능',
            '서비스 이용 시 쿠폰을 선택하여 사용 가능'
          ]
        }

        setCoupon(formattedCoupon)
      } catch (error) {
        console.error('쿠폰 로드 실패:', error)
        router.push('/client/coupons')
      } finally {
        setLoading(false)
      }
    }

    if (couponId) {
      loadCoupon()
    }
  }, [couponId, isAuthenticated, user])

  if (loading || !coupon) {
    return (
      <>
        <TopBanner
          title="쿠폰 상세정보"
          onBackClick={() => router.back()}
        />

        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <BodyMedium color="#666666">쿠폰 정보를 불러오는 중...</BodyMedium>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBanner
        title="쿠폰 상세정보"
        onBackClick={() => router.back()}
      />

      <div className="flex-1 px-5 py-6 bg-gray-50 space-y-6">
        {/* 쿠폰 카드 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          {/* 쿠폰 헤더 */}
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-orange-100 text-orange-500 px-3 py-1 rounded-lg text-sm font-bold">
              {coupon.category}
            </div>
            <div className="bg-red-100 text-red-500 px-3 py-1 rounded-lg text-sm font-bold">
              {coupon.discountType}
            </div>
          </div>

          {/* 쿠폰 타이틀 */}
          <Heading2 color="#333333" className="font-bold mb-3">
            {coupon.title}
          </Heading2>

          {/* 쿠폰 설명 */}
          <BodyMedium color="#666666" className="mb-4">
            {coupon.description}
          </BodyMedium>

          {/* 유효기간 정보 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <BodySmall color="#666666">남은 기간</BodySmall>
              <BodyMedium color="#E67E22" className="font-bold">
                {coupon.remainingDays}일
              </BodyMedium>
            </div>
            <div className="flex items-center justify-between">
              <BodySmall color="#666666">유효기간</BodySmall>
              <BodySmall color="#666666">
                {coupon.validUntil}
              </BodySmall>
            </div>
          </div>

          {/* 사용 상태 */}
          {coupon.isUsed && (
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <BodyMedium color="#999999" className="font-bold">사용 완료</BodyMedium>
            </div>
          )}
        </div>

        {/* 쿠폰 사용 조건 */}
        <div className="bg-white rounded-2xl p-6 space-y-4">
          <Heading3 color="#333333" className="font-bold">쿠폰 사용 조건</Heading3>

          {coupon.minOrderAmount && coupon.minOrderAmount > 0 && (
            <div className="space-y-2">
              <BodyMedium color="#666666" className="font-medium">최소 주문 금액</BodyMedium>
              <BodyMedium color="#333333" className="font-bold">
                {coupon.minOrderAmount.toLocaleString()}원 이상
              </BodyMedium>
            </div>
          )}

          {coupon.maxDiscountAmount && (
            <div className="space-y-2">
              <BodyMedium color="#666666" className="font-medium">최대 할인 금액</BodyMedium>
              <BodyMedium color="#333333" className="font-bold">
                {coupon.maxDiscountAmount.toLocaleString()}원
              </BodyMedium>
            </div>
          )}

          {coupon.applicableItems && coupon.applicableItems.length > 0 && (
            <div className="space-y-2">
              <BodyMedium color="#666666" className="font-medium">적용 가능 항목</BodyMedium>
              <div className="space-y-1">
                {coupon.applicableItems.map((item, index) => (
                  <BodySmall key={index} color="#333333">
                    • {item}
                  </BodySmall>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 이용 약관 */}
        {coupon.terms && coupon.terms.length > 0 && (
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <Heading3 color="#333333" className="font-bold">이용 약관</Heading3>
            <div className="space-y-2">
              {coupon.terms.map((term, index) => (
                <BodySmall key={index} color="#666666">
                  • {term}
                </BodySmall>
              ))}
            </div>
          </div>
        )}

        {/* 쿠폰 사용 버튼 */}
        {!coupon.isUsed && (
          <Button
            onClick={() => router.push('/client/knife-request')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4"
          >
            쿠폰 사용하기
          </Button>
        )}

        {/* Spacer */}
        <div className="h-10" />
      </div>
    </>
  )
}
