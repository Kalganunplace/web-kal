"use client"

import BottomSheet from "@/components/ui/bottom-sheet"
import { ChevronRightIcon } from "@/components/ui/icon"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, BodySmall, CaptionLarge } from "@/components/ui/typography"
import { useRouter } from "next/navigation"
import { useState } from "react"

const priceData = [
  {
    id: 1,
    name: "일반 식도류",
    marketPrice: 6500,
    discountPrice: 5500,
    image: "/images/knife-cooking.png",
    couponName: "첫구매 20% 할인",
    couponPrice: 4400
  },
  {
    id: 2,
    name: "정육도",
    marketPrice: 8000,
    discountPrice: 6000,
    image: "/images/knife-meat.png",
    couponName: "첫구매 20% 할인",
    couponPrice: 4800
  },
  {
    id: 3,
    name: "과도",
    marketPrice: 4000,
    discountPrice: 2400,
    image: "/images/knife-fruit.png",
    couponName: "첫구매 20% 할인",
    couponPrice: 1920
  },
  {
    id: 4,
    name: "회칼",
    marketPrice: 10000,
    discountPrice: 6000,
    image: "/images/knife-sashimi.png",
    couponName: "첫구매 20% 할인",
    couponPrice: 4800
  },
  {
    id: 5,
    name: "일반 가위",
    marketPrice: 4000,
    discountPrice: 2000,
    image: "/images/scissors.png",
    couponName: "첫구매 20% 할인",
    couponPrice: 1600
  }
]

// Notice sections data
const noticeData = [
  {
    title: "칼 상태 및 종류 관련 주의사항",
    items: [
      {
        category: "불량 칼",
        points: [
          "날이 휘었거나 녹슨 칼은 연마가 불가능할 수 있어요.",
          "이가 많이 나가거나 부러진 칼은 연마가 어렵고, 별도 비용이 발생할 수 있어요."
        ]
      },
      {
        category: "연마 불가 칼",
        points: [
          "세라믹 칼, 톱날형 칼(빵칼 등)은 연마 대상에서 제외됩니다."
        ]
      },
      {
        category: "특수 구조 칼",
        points: [
          "접이식 칼, 다기능 멀티툴 등 특수 구조의 칼은 사전 상담이 필요해요."
        ]
      },
      {
        category: "고급 칼",
        points: [
          "고가의 칼이나 수제 칼은 재질에 따라 연마가 제한되며, 사전 동의 후 진행됩니다."
        ]
      }
    ]
  },
  {
    title: "연마 작업 관련 주의사항",
    items: [
      {
        category: "칼날 마모",
        points: [
          "연마 시 칼날이 미세하게 깎여 자주 연마하면 칼이 짧아질 수 있어요."
        ]
      },
      {
        category: "브랜드 제한",
        points: [
          "일부 제조사에서는 특정 연마 방식을 권장하지 않을 수 있어요. (예: 샤프닝 금지)"
        ]
      },
      {
        category: "코팅 손상 가능",
        points: [
          "코팅된 칼은 연마 중 외관이 일부 손상될 수 있습니다."
        ]
      },
      {
        category: "각인 흐림 가능",
        points: [
          "이름이 새겨진 칼은 연마로 인해 글씨가 흐려질 수 있어요."
        ]
      },
      {
        category: "연마 후 복구 불가",
        points: [
          "연마 작업이 완료된 칼은 복구가 어려우니, 작업 전 내용을 꼭 확인해 주세요."
        ]
      }
    ]
  }
]

export default function PriceListPage() {
  const router = useRouter()
  const [selectedKnife, setSelectedKnife] = useState<typeof priceData[0] | null>(null)

  const handleKnifeClick = (knife: typeof priceData[0]) => {
    setSelectedKnife(knife)
  }

  const handleCloseModal = () => {
    setSelectedKnife(null)
  }

  return (
    <>
      {/* Top Banner */}
      <TopBanner
        title="가격표"
        onBackClick={() => router.back()}
      />

      {/* Content */}
      <div className="flex flex-col items-center gap-5 px-0">
        {/* Promotional Banner */}
        <div className="w-full h-[100px] bg-[#FAF3E0] rounded-[30px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.05)] relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-[77px] left-[261px] w-[30px] h-[2.59px] bg-black/40 rounded-full blur-[2px]" />
          <div className="absolute top-[81px] left-[286px] w-[30px] h-[2.59px] bg-black/40 rounded-full blur-[2px]" />

          {/* Main content */}
          <div className="absolute left-[27px] top-[24px] flex justify-center items-center gap-[4.32px]">
            <div className="flex items-center gap-[4.32px]">
              <div
                className="text-[#333333]"
                style={{ fontFamily: 'Do Hyeon', fontSize: '24px', fontWeight: 400, lineHeight: '1.25em', textShadow: '0px 3px 3px rgba(0,0,0,0.2)' }}
              >
                이제 칼갈이도<br />구독으로!
              </div>
            </div>
          </div>

          {/* Decorative images - placeholders */}
          <div className="absolute top-[25px] right-[59px] w-[59px] h-[59px] bg-gray-200 rounded-sm" />
          <div className="absolute top-[30px] right-[35px] w-[59px] h-[59px] bg-gray-200 rounded-sm" />
          <div className="absolute top-[6px] right-[35px] w-[35px] h-[35px] bg-gray-200 rounded-sm" />
        </div>

        {/* Price Table */}
        <div className="w-full">
          {/* Table Header */}
          <div className="flex justify-between items-center gap-5 px-[38px] py-[10px] bg-[#F2F2F2]">
            <CaptionLarge color="#333333">종류</CaptionLarge>
            <div className="flex justify-between items-center gap-5 w-[100px]">
              <CaptionLarge color="#333333">시장가</CaptionLarge>
              <CaptionLarge color="#333333">할인가</CaptionLarge>
            </div>
          </div>

          {/* Price Rows */}
          {priceData.map((item, index) => (
            <div key={item.id}>
              <div className="flex justify-between items-center gap-5 px-5 py-5">
                <BodySmall color="#333333">{item.name}</BodySmall>
                <div className="flex items-center gap-[10px]">
                  <BodySmall color="#767676" className="line-through">
                    {item.marketPrice.toLocaleString()}원
                  </BodySmall>
                  <div className="flex items-center gap-0">
                    <BodySmall color="#333333">
                      {item.discountPrice.toLocaleString()}원
                    </BodySmall>
                    <button
                      onClick={() => handleKnifeClick(item)}
                      className="flex items-center justify-center w-[18px] h-[18px]"
                    >
                      <ChevronRightIcon size={18} color="#D9D9D9" />
                    </button>
                  </div>
                </div>
              </div>
              {index < priceData.length - 1 && (
                <div className="w-[330px] h-0 border-t border-[#F2F2F2] mx-auto" />
              )}
            </div>
          ))}
        </div>

        {/* Notice Section */}
        <div className="w-[330px] bg-[#F2F2F2] rounded-[30px] px-5 py-9">
          {noticeData.map((section, sectionIndex) => (
            <div key={sectionIndex} className="flex flex-col gap-[10px]">
              {/* Section Title */}
              <div className="flex items-center justify-center">
                <BodyMedium color="#E67E22">{section.title}</BodyMedium>
              </div>

              {/* Divider */}
              <div className="w-[290px] h-0 border-t border-[#D9D9D9] mx-auto" />

              {/* Section Content - Always Visible */}
              <div className="flex flex-col gap-5">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex flex-col gap-1">
                    <div className="flex items-center">
                      <BodySmall color="#333333">{item.category}</BodySmall>
                    </div>
                    {item.points.map((point, pointIndex) => (
                      <div key={pointIndex} className="flex items-stretch justify-stretch">
                        <CaptionLarge color="#767676">{point}</CaptionLarge>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {sectionIndex < noticeData.length - 1 && (
                <div className="mt-[10px]" />
              )}
            </div>
          ))}
        </div>

        {/* Bottom spacer */}
        <div className="h-20" />
      </div>

      {/* Bottom Sheet Modal */}
      <BottomSheet
        isOpen={!!selectedKnife}
        onClose={handleCloseModal}
        className="max-h-[600px]"
      >
        {selectedKnife && (
          <div className="flex flex-col gap-6 px-6 py-4">
            {/* Header Section */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedKnife.name}</h3>
              <p className="text-sm text-gray-600">전문 연마 서비스</p>
            </div>

            {/* Knife Image Section */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl flex items-center justify-center border border-orange-200">
                <img
                  src={selectedKnife.image}
                  alt={selectedKnife.name}
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<div class="text-orange-400 text-xl">🔪</div>';
                  }}
                />
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">기본 가격</span>
                <div className="text-right">
                  <span className="text-sm text-gray-500 line-through mr-2">
                    {selectedKnife.marketPrice.toLocaleString()}원
                  </span>
                  <span className="text-lg font-semibold text-gray-900">
                    {selectedKnife.discountPrice.toLocaleString()}원
                  </span>
                </div>
              </div>

              {/* Coupon Highlight */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-lg p-3 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-90 mb-1">🎫 {selectedKnife.couponName}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">최종 가격:</span>
                      <span className="text-lg font-bold">
                        {selectedKnife.couponPrice.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                  <div className="text-xl">🔥</div>
                </div>
              </div>
            </div>

            {/* Service Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>⚡</span>
                <span>당일 수거, 다음날 배송</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>🛡️</span>
                <span>30일 품질 보장</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>📦</span>
                <span>무료 포장 서비스</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pb-4">
              <button
                onClick={() => {
                  handleCloseModal()
                  router.push("/knife-request")
                }}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-xl flex items-center justify-center font-semibold shadow-lg shadow-orange-200 hover:shadow-xl transition-shadow"
              >
                이 칼로 신청하기
              </button>

              <button
                onClick={handleCloseModal}
                className="w-full h-10 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center font-medium hover:bg-gray-200 transition-colors"
              >
                다른 칼 보기
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </>
  )
}
