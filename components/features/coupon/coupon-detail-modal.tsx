"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BodyMedium, BodySmall, Heading3 } from "@/components/ui/typography"
import { useRouter } from "next/navigation"

interface CouponDetailModalProps {
  isOpen: boolean
  onClose: () => void
  coupon: {
    id: string
    title: string
    description: string
    validUntil: string
    isUsed: boolean
    category: "신규" | "웰컴" | "일반"
    discountType: "1+1" | "무료" | "할인"
    remainingDays: number
    // 추가 상세 정보
    minOrderAmount?: number
    maxDiscountAmount?: number
    applicableItems?: string[]
    terms?: string[]
  }
}

export function CouponDetailModal({ isOpen, onClose, coupon }: CouponDetailModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleUseCoupon = () => {
    onClose()
    router.push("/client/knife-request")
  }

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-5 h-14">
          <button onClick={onClose} className="p-2 -ml-2">
            <X className="w-6 h-6 text-gray-600" />
          </button>
          <Heading3 color="#333333" className="font-bold">
            내 보유 쿠폰
          </Heading3>
          <div className="w-6"></div>
        </div>
      </div>

      {/* 쿠폰 메인 이미지 영역 */}
      <div className="relative bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 px-8 py-12">
        {/* 배경 장식 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-600 rounded-full translate-y-12 -translate-x-12 opacity-20"></div>

        <div className="relative z-10 text-center">
          <div className="inline-block mb-4">
            <div className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full mb-2">
              COUPON
            </div>
          </div>

          {/* 쿠폰 아이콘/일러스트 */}
          <div className="mb-4">
            <div className="w-24 h-24 mx-auto bg-white/30 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <div className="text-5xl">🔪</div>
            </div>
          </div>

          <div className="text-3xl font-bold text-white mb-2 drop-shadow-md">
            {coupon.discountType}
          </div>

          {/* 인디케이터 */}
          <div className="flex justify-center space-x-1 mt-4">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full ${
                  index === 1 ? 'bg-white' : 'bg-white/50'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* 쿠폰 사용 버튼 */}
      <div className="px-5 py-4 bg-white border-b-8 border-gray-50">
        <Button
          onClick={handleUseCoupon}
          disabled={coupon.isUsed}
          className={`w-full h-12 font-bold text-base ${
            coupon.isUsed
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          {coupon.isUsed ? '사용 완료' : '쿠폰 사용하러 가기'}
        </Button>
      </div>

      {/* 상세 정보 */}
      <div className="px-5 py-6 space-y-6">
        {/* 쿠폰명 */}
        <div>
          <BodySmall color="#999999" className="mb-2">
            쿠폰명
          </BodySmall>
          <BodyMedium color="#333333" className="font-bold">
            {coupon.title}
          </BodyMedium>
        </div>

        {/* 할인내역 */}
        <div>
          <BodySmall color="#999999" className="mb-2">
            할인내역
          </BodySmall>
          <BodyMedium color="#333333">
            {coupon.description}
          </BodyMedium>
        </div>

        {/* 적용내역 */}
        {(coupon.minOrderAmount || coupon.maxDiscountAmount) && (
          <div>
            <BodySmall color="#999999" className="mb-2">
              적용내역
            </BodySmall>
            <div className="space-y-1">
              {coupon.minOrderAmount && (
                <BodySmall color="#666666">
                  • 최소 사용금액: {coupon.minOrderAmount.toLocaleString()}원 이상 시 사용 가능
                </BodySmall>
              )}
              {coupon.maxDiscountAmount && (
                <BodySmall color="#666666">
                  • 최대 할인금액: {coupon.maxDiscountAmount.toLocaleString()}원 1개월 할인금액 최대 {coupon.maxDiscountAmount.toLocaleString()}원까지
                </BodySmall>
              )}
            </div>
          </div>
        )}

        {/* 사용기한 */}
        <div>
          <BodySmall color="#999999" className="mb-2">
            사용기한
          </BodySmall>
          <BodyMedium color="#333333">
            {coupon.validUntil}
          </BodyMedium>
        </div>

        {/* 사용조건 */}
        {coupon.terms && coupon.terms.length > 0 && (
          <div>
            <BodySmall color="#999999" className="mb-2">
              사용조건
            </BodySmall>
            <div className="space-y-1">
              {coupon.terms.map((term, index) => (
                <BodySmall key={index} color="#666666">
                  • {term}
                </BodySmall>
              ))}
            </div>
          </div>
        )}

        {/* 적용대상 */}
        {coupon.applicableItems && coupon.applicableItems.length > 0 && (
          <div>
            <BodySmall color="#999999" className="mb-2">
              적용대상
            </BodySmall>
            <BodySmall color="#666666">
              {coupon.applicableItems.join(', ')}
            </BodySmall>
          </div>
        )}

        {/* 유의사항 */}
        <div className="pt-4 border-t border-gray-200">
          <BodySmall color="#999999" className="mb-2">
            유의사항
          </BodySmall>
          <div className="space-y-1">
            <BodySmall color="#666666">
              • 본 쿠폰은 발행일로부터 서비스 예약 시에만 이용 가능 · 고객당 1회 사용
            </BodySmall>
            <BodySmall color="#666666">
              • 서비스 이용 시 쿠폰을 선택하여 사용 가능
            </BodySmall>
            <BodySmall color="#666666">
              • 1회, 2회(1+N쿠폰) 이외의 복원불가, 중복할인 불가 (무료 이벤트 외함)
            </BodySmall>
            <BodySmall color="#666666">
              • 타 쿠폰과 중복 사용 불가
            </BodySmall>
          </div>
        </div>
      </div>
    </div>
  )
}
