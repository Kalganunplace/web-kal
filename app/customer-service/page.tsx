"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, BodySmall, CaptionMedium, Heading3 } from "@/components/ui/typography"

interface FAQ {
  id: string
  question: string
  answer: string
  category: "서비스" | "결제" | "기타"
}

export default function CustomerServicePage() {
  const router = useRouter()
  const [selectedFAQ, setSelectedFAQ] = useState<string | null>(null)
  
  const faqs: FAQ[] = [
    {
      id: "1",
      question: "칼갈이 서비스는 어떻게 이용하나요?",
      answer: "1. 앱에서 칼갈이 신청하기를 선택합니다.\n2. 주소와 원하는 시간을 설정합니다.\n3. 신청 완료 후 전문가가 방문합니다.\n4. 현장에서 칼갈이 작업을 진행합니다.\n5. 결제 후 서비스가 완료됩니다.",
      category: "서비스"
    },
    {
      id: "2",
      question: "서비스 이용 요금은 얼마인가요?",
      answer: "칼갈이 서비스 요금은 다음과 같습니다:\n\n• 일반 칼: 5,000원\n• 대형 칼: 7,000원\n• 전문 칼 (회칼 등): 10,000원\n\n정확한 요금은 칼의 상태에 따라 달라질 수 있으며, 현장에서 최종 확인됩니다.",
      category: "결제"
    },
    {
      id: "3",
      question: "서비스 지역은 어디까지 가능한가요?",
      answer: "현재 대구 전 지역에서 서비스를 제공하고 있습니다:\n\n• 대구 중구\n• 대구 동구\n• 대구 서구\n• 대구 남구\n• 대구 북구\n\n향후 서비스 지역을 지속적으로 확대할 예정입니다.",
      category: "서비스"
    },
    {
      id: "4",
      question: "예약 취소나 변경은 어떻게 하나요?",
      answer: "예약 취소나 변경은 다음과 같이 가능합니다:\n\n• 서비스 2시간 전까지: 무료 취소/변경\n• 서비스 2시간 이내: 취소 수수료 발생\n\n취소나 변경을 원하실 때는 앱의 '이용내역'에서 해당 예약을 선택하여 처리하시거나 고객센터로 연락주세요.",
      category: "서비스"
    },
    {
      id: "5",
      question: "결제는 어떻게 이루어지나요?",
      answer: "다음과 같은 결제 방법을 지원합니다:\n\n• 카드 결제 (신용/체크)\n• 계좌이체\n• 간편결제 (카카오페이, 네이버페이)\n• 현금 결제 (현장에서)\n\n서비스 완료 후 결제가 진행됩니다.",
      category: "결제"
    },
    {
      id: "6",
      question: "서비스에 만족하지 못했을 때는 어떻게 하나요?",
      answer: "서비스에 만족하지 못하신 경우:\n\n1. 앱의 리뷰 기능을 통해 피드백 남기기\n2. 고객센터로 직접 연락하기\n3. 재작업이 필요한 경우 무료 재방문 서비스\n\n고객님의 만족을 위해 최선을 다하겠습니다.",
      category: "기타"
    }
  ]

  const handleCallSupport = () => {
    const phoneNumber = "tel:1588-1234"
    window.location.href = phoneNumber
  }

  const handleKakaoTalk = () => {
    // 실제로는 카카오톡 채널로 연결
    alert("카카오톡 상담은 준비 중입니다.")
  }

  return (
    <>
      <TopBanner
        title="고객센터"
        onBackClick={() => router.back()}
      />

      <div className="flex-1 px-5 py-6 bg-gray-50 space-y-6">
        {/* 상담 연결 */}
        <div className="bg-white rounded-xl p-6">
          <Heading3 color="#333333" className="font-bold mb-4">상담 문의</Heading3>
          
          <div className="space-y-3">
            <Button
              onClick={handleCallSupport}
              className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-3"
            >
              <span>📞</span>
              <div className="text-left">
                <div>전화 상담</div>
                <div className="text-sm opacity-90">1588-1234 (평일 9:00~18:00)</div>
              </div>
            </Button>
            
            <Button
              onClick={handleKakaoTalk}
              variant="outline"
              className="w-full h-14 border-yellow-300 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 font-bold rounded-xl flex items-center justify-center gap-3"
            >
              <span>💬</span>
              <div>카카오톡 상담</div>
            </Button>
          </div>
        </div>

        {/* 자주 묻는 질문 */}
        <div className="bg-white rounded-xl p-6">
          <Heading3 color="#333333" className="font-bold mb-4">자주 묻는 질문</Heading3>
          
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} className="border border-gray-200 rounded-xl">
                <button
                  onClick={() => setSelectedFAQ(selectedFAQ === faq.id ? null : faq.id)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="bg-orange-100 text-orange-500 px-2 py-1 rounded text-xs font-bold">
                        {faq.category}
                      </div>
                    </div>
                    <BodyMedium color="#333333" className="font-medium">
                      {faq.question}
                    </BodyMedium>
                  </div>
                  <div className="text-gray-400 ml-4">
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      className={`transition-transform ${selectedFAQ === faq.id ? 'rotate-180' : ''}`}
                    >
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                </button>
                
                {selectedFAQ === faq.id && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="pt-4">
                      <BodyMedium color="#666666" className="leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </BodyMedium>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 운영 시간 안내 */}
        <div className="bg-blue-50 rounded-xl p-4">
          <Heading3 color="#4A90E2" className="font-bold mb-2">고객센터 운영시간</Heading3>
          <div className="space-y-1">
            <CaptionMedium color="#4A90E2">
              • 평일: 09:00 ~ 18:00
            </CaptionMedium>
            <CaptionMedium color="#4A90E2">
              • 토요일: 09:00 ~ 15:00
            </CaptionMedium>
            <CaptionMedium color="#4A90E2">
              • 일요일, 공휴일: 휴무
            </CaptionMedium>
          </div>
        </div>

        {/* 앱 정보 */}
        <div className="bg-gray-100 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <BodySmall color="#666666">앱 버전</BodySmall>
            <BodySmall color="#666666">1.0.0</BodySmall>
          </div>
          <div className="flex justify-between items-center">
            <BodySmall color="#666666">개발사</BodySmall>
            <BodySmall color="#666666">칼가는곳</BodySmall>
          </div>
        </div>

        {/* Spacer for bottom navigation */}
        <div className="h-20" />
      </div>
    </>
  )
}