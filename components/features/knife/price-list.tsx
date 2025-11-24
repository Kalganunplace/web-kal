"use client"

import BottomSheet from "@/components/ui/bottom-sheet"
import TopBanner from "@/components/ui/top-banner"
import { ChevronRight } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { BodyMedium, BodySmall } from "@/components/ui/typography"
import { knifeService, type KnifeTypeWithCouponPrice } from "@/lib/knife-service"
import { useIsAuthenticated } from "@/stores/auth-store"

interface Banner {
  id: string;
  position: string;
  title?: string;
  image_url: string;
  link_url?: string;
  display_order: number;
}

export default function PriceList() {
  const router = useRouter()
  const { user, isAuthenticated } = useIsAuthenticated()

  const [knifeTypes, setKnifeTypes] = useState<KnifeTypeWithCouponPrice[]>([])
  const [selectedKnife, setSelectedKnife] = useState<KnifeTypeWithCouponPrice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)
  const [banner, setBanner] = useState<Banner | null>(null)

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // 칼 종류와 배너를 동시에 로드
        const [knifeData, bannerRes] = await Promise.all([
          knifeService.getKnifeTypesWithCouponPrice(
            isAuthenticated ? user?.id : undefined
          ),
          fetch('/api/banners?position=price_list')
        ]);

        setKnifeTypes(knifeData);

        const bannerData = await bannerRes.json();
        if (bannerData.success && bannerData.data.length > 0) {
          setBanner(bannerData.data[0]);
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error)
        toast.error('가격 정보를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [isAuthenticated, user?.id])

  const handleKnifeSelect = (knife: KnifeTypeWithCouponPrice) => {
    setSelectedKnife(knife)
    setIsBottomSheetOpen(true)
  }

  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false)
    setSelectedKnife(null)
  }

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ko-KR')}원`
  }

  if (isLoading) {
    return (
      <>
        <TopBanner
          title="가격표"
          onBackClick={() => router.back()}
        />

        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <BodyMedium color="#666666">가격표를 불러오는 중...</BodyMedium>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBanner
        title="가격표"
        onBackClick={() => router.back()}
      />

      <div className="flex-1 px-5 py-6 bg-gray-50 space-y-6">
        {/* 배너 */}
        {banner ? (
          <button
            onClick={() => banner.link_url && router.push(banner.link_url)}
            className="w-full relative rounded-2xl overflow-hidden"
          >
            <div className="relative w-full h-32">
              <Image
                src={banner.image_url}
                alt={banner.title || "가격표 배너"}
                fill
                className="object-cover"
              />
            </div>
          </button>
        ) : (
          <div className="relative bg-[#FAF3E0] rounded-2xl p-5 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-[#333333]" style={{ fontFamily: 'Do Hyeon', fontSize: '22px', fontWeight: 400, lineHeight: '1.3' }}>
                  이제 칼갈이도<br />
                  <span className="text-[#E67E22]">구독으로!</span>
                </div>
              </div>
              <div className="relative w-28 h-16 flex-shrink-0">
                <Image
                  src="/images/home/main_banner.png"
                  alt="칼갈이 구독"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          </div>
        )}

        {/* 가격표 테이블 */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          {/* 테이블 헤더 */}
          <div className="grid grid-cols-3 bg-[#F2F2F2] py-3 px-4 border-b border-gray-200">
            <div className="text-sm font-medium text-gray-700">종류</div>
            <div className="text-sm font-medium text-gray-700 text-center">시장가</div>
            <div className="text-sm font-medium text-gray-700 text-right">할인가</div>
          </div>

          {/* 테이블 바디 */}
          {knifeTypes.map((knife, index) => (
            <button
              key={knife.id}
              onClick={() => handleKnifeSelect(knife)}
              className={`w-full grid grid-cols-3 py-4 px-4 items-center hover:bg-gray-50 transition-colors ${
                index !== knifeTypes.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <BodyMedium color="#333333" className="font-medium">
                  {knife.name}
                </BodyMedium>
              </div>

              <div className="text-center">
                <BodySmall color="#999999" className="line-through">
                  {formatPrice(knife.market_price)}
                </BodySmall>
              </div>

              <div className="flex items-center justify-end gap-2">
                <BodyMedium color="#E67E22" className="font-bold">
                  {formatPrice(knife.discount_price)}
                </BodyMedium>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
          ))}
        </div>

        {/* 칼 상태 및 종류 관련 주의사항 */}
        <div className="bg-[#F2F2F2] rounded-xl p-5 space-y-4">
          <h3 className="text-[#E67E22] font-bold text-base" style={{ fontFamily: 'Do Hyeon' }}>
            칼 상태 및 종류 관련 주의사항
          </h3>
          <div className="border-t border-gray-300 my-4"></div>
          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-sm text-gray-800 mb-1">불량 칼</h4>
              <BodySmall color="#666666">
                날이 휘었거나 녹슨 칼은 연마가 불가능할 수 있으므로,<br />
                미리 날이 나거나 분리된 칼은 연마가 어려우며, 별도 비<br />
                용이 발생할 수 있어요.
              </BodySmall>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-800 mb-1">연마 불가 칼</h4>
              <BodySmall color="#666666">
                세라믹 칼, 톱날형 칼(빵칼 등)은 연마 대상에서 제외됩니<br />
                다.
              </BodySmall>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-800 mb-1">특수 구조 칼</h4>
              <BodySmall color="#666666">
                접이식 칼, 다기능 멀티툴 등 특수 구조의 칼은 사전 상담<br />
                이 필요해요.
              </BodySmall>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-800 mb-1">고급 칼</h4>
              <BodySmall color="#666666">
                고가의 칼이나 수제 칼은 재질에 따라 연마가 제한되며,<br />
                사전 문의 후 진행됩니다.
              </BodySmall>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-800 mb-1">칼날 마모</h4>
              <BodySmall color="#666666">
                오랜 사용이나 미세하게 갈린 자국을 연마하면 칼이 짧아질<br />
                수 있어요.
              </BodySmall>
            </div>
          </div>

        {/* 기타 참고사항 */}
          <h3 className="text-[#E67E22] font-bold text-base" style={{ fontFamily: 'Do Hyeon' }}>
            기타 참고사항
          </h3>
          <div className="border-t border-gray-300 my-4"></div>

          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-sm text-gray-800 mb-1">브랜드 제한</h4>
              <BodySmall color="#666666">
                일부 제조사에서는 특정 연마 방식을 권장하지 않을 수 있<br />
                어요. (예: 샤프닝 금지)
              </BodySmall>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-800 mb-1">코팅 손상 가능</h4>
              <BodySmall color="#666666">
                코팅된 칼은 연마 중 코팅이 일부 손실될 수 있습니다.
              </BodySmall>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-800 mb-1">각인 훼손 가능</h4>
              <BodySmall color="#666666">
                글씨가 새겨진 칼은 연마로 글씨가 흐려질 수 있어<br />
                요.
              </BodySmall>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-800 mb-1">연마 후 복구 불가</h4>
              <BodySmall color="#666666">
                연마 작업이 완료된 칼은 복구가 어려우니, 작업 전 내용<br />
                을 꼭 확인해 주세요.
              </BodySmall>
            </div>
          </div>
        </div>
      </div>

      {/* 칼 상세 정보 바텀시트 */}
      <BottomSheet isOpen={isBottomSheetOpen} onClose={handleCloseBottomSheet}>
        {selectedKnife && (
          <div className="p-6 space-y-5">
            {/* 칼 정보 헤더 */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Do Hyeon' }}>
                {selectedKnife.name}
              </h3>
            </div>

            {/* 칼 이미지 */}
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-[#F5F5F5] rounded-2xl flex items-center justify-center p-4">
                {selectedKnife.image_url ? (
                  <img
                    src={selectedKnife.image_url}
                    alt={selectedKnife.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-6xl">🔪</div>
                )}
              </div>
            </div>

            {/* 가격 정보 */}
            <div className="space-y-3">
              {/* 시장가 */}
              <div className="bg-[#F2F2F2] rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 font-medium">시장가</span>
                  <span className="text-base text-gray-700 line-through">
                    {formatPrice(selectedKnife.market_price)}
                  </span>
                </div>
              </div>

              {/* 칼가는곳 할인가 */}
              <div className="bg-[#FFF4E6] rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 font-medium">칼가는곳 할인가</span>
                  <span className="text-lg font-bold text-[#E67E22]">
                    {formatPrice(selectedKnife.discount_price)}
                  </span>
                </div>
              </div>
            </div>

            {/* 관리 주의사항 */}
            {selectedKnife.care_instructions && (
              <div className="bg-[#FFF4E6] rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-2">⚠️ 칼 상태 및 주의사항</h4>
                <BodySmall color="#666666">{selectedKnife.care_instructions}</BodySmall>
              </div>
            )}

            {/* 추가 참고사항 */}
            {selectedKnife.additional_notes && (
              <div className="bg-[#FFF4E6] rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-2">📝 기타 참고사항</h4>
                <BodySmall color="#666666">{selectedKnife.additional_notes}</BodySmall>
              </div>
            )}

            {/* 바로 신청 버튼 */}
            {/* <Button
              className="w-full bg-[#E67E22]  text-white rounded-lg py-3 font-bold mt-6"
              onClick={() => {
                handleCloseBottomSheet()
                router.push('/client/knife-request')
              }}
            >
              바로 신청하기
            </Button> */}
          </div>
        )}
      </BottomSheet>
    </>
  )
}
