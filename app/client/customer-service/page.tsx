"use client"

import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, BodySmall, BodyXSmall } from "@/components/ui/typography"
import { useRouter } from "next/navigation"

export default function CustomerServicePage() {
  const router = useRouter()

  const handleInquiry = () => {
    // 카카오톡 채널 또는 전화 연결
    window.open("tel:010-0000-0000", "_self")
  }

  return (
    <div className="min-h-screen bg-white">
      <TopBanner
        title="고객센터"
        onBackClick={() => router.back()}
      />

      {/* 배경 이미지 영역 */}
      <div className="relative">
        {/* 배경 이미지 */}
        <div className="h-[280px]">
          <img
            src="/images/customer.png"
            alt="고객센터"
            className="w-full h-full object-cover"
          />
        </div>

        {/* 카드 - 이미지 하단에 걸쳐있음 */}
        <div className="absolute left-5 right-5 bottom-0 translate-y-[80%]">
          <div className="bg-[#FFFFFF] rounded-[30px] p-5 shadow-lg">
            {/* 제목 */}
            <BodyMedium color="#333333" className="font-bold mb-2">
              칼가는곳 고객센터
            </BodyMedium>

            {/* 설명 */}
            <BodySmall color="#767676" className="leading-relaxed mb-5">
              궁금한 점이 있으신가요?<br />
              칼갈이 예약, 배송 등 언제든 편하게 문의해주세요.
            </BodySmall>

            {/* 문의하기 버튼 */}
            <button
              onClick={handleInquiry}
              className="w-full h-12 bg-[#E67E22] text-white font-bold rounded-[8px] mb-5"
            >
              문의하기
            </button>

            {/* 운영시간 안내 */}
            <div className="text-center space-y-0.5">
              <BodySmall color="#767676">
                운영시간:
              </BodySmall>
              <BodySmall color="#767676">
                평일 10:00 ~ 18:00 (점심 12:30-13:30)
              </BodySmall>
              <BodyXSmall color="#767676">
                ※ 주말·공휴일 휴무
              </BodyXSmall>
            </div>
          </div>
        </div>
      </div>

      {/* 카드가 translate로 내려간 만큼 여백 */}
      <div className="h-[200px]" />
    </div>
  )
}
