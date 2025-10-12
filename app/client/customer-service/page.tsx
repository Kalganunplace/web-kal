"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, BodySmall, Heading3 } from "@/components/ui/typography"
import { ChevronDown, Phone, Mail, Clock } from "lucide-react"

interface FAQItem {
  id: number
  question: string
  answer: string
}

export default function CustomerServicePage() {
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<number | null>(null)

  // TODO: 나중에 Supabase에서 가져오기
  const faqs: FAQItem[] = [
    {
      id: 1,
      question: "칼갈이 서비스는 어떻게 이용하나요?",
      answer: "앱에서 수거 날짜와 시간을 선택하신 후 주소를 입력해주시면, 지정하신 시간에 직원이 방문하여 칼을 수거합니다. 작업 완료 후 다시 배송해드립니다."
    },
    {
      id: 2,
      question: "칼갈이 비용은 얼마인가요?",
      answer: "칼 종류와 크기에 따라 비용이 다릅니다. 가격표 메뉴에서 자세한 정보를 확인하실 수 있습니다."
    },
    {
      id: 3,
      question: "작업 기간은 얼마나 걸리나요?",
      answer: "수거 후 2-3일 내에 작업이 완료되며, 완료 즉시 배송해드립니다. 정확한 일정은 예약 시 안내해드립니다."
    },
    {
      id: 4,
      question: "예약을 취소하거나 변경할 수 있나요?",
      answer: "예약 내역에서 취소 및 변경이 가능합니다. 단, 수거 예정 시간 2시간 전까지만 가능합니다."
    },
    {
      id: 5,
      question: "쿠폰은 어떻게 사용하나요?",
      answer: "결제 화면에서 보유하신 쿠폰을 선택하여 사용하실 수 있습니다. 신규 가입 고객에게는 웰컴 쿠폰이 자동으로 지급됩니다."
    }
  ]

  const toggleFAQ = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-white">
      <TopBanner
        title="고객센터"
        onBackClick={() => router.back()}
      />

      <div className="px-5 py-6 space-y-6">
        {/* 연락처 정보 */}
        <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
          <Heading3 color="#333333" className="font-bold mb-4">
            연락처
          </Heading3>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <BodySmall color="#999999" className="mb-1">전화</BodySmall>
              <BodyMedium color="#333333" className="font-bold">
                1588-0000
              </BodyMedium>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <BodySmall color="#999999" className="mb-1">이메일</BodySmall>
              <BodyMedium color="#333333" className="font-bold">
                support@kalganeungot.com
              </BodyMedium>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <BodySmall color="#999999" className="mb-1">운영시간</BodySmall>
              <BodyMedium color="#333333" className="font-bold">
                평일 09:00 - 18:00
              </BodyMedium>
              <BodySmall color="#666666">
                (주말 및 공휴일 휴무)
              </BodySmall>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <Heading3 color="#333333" className="font-bold mb-4">
            자주 묻는 질문
          </Heading3>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <BodyMedium color="#333333" className="font-bold flex-1 pr-4">
                    {faq.question}
                  </BodyMedium>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedId === faq.id ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedId === faq.id && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                    <BodyMedium color="#666666" className="leading-relaxed">
                      {faq.answer}
                    </BodyMedium>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 문의하기 버튼 */}
        <div className="pt-4">
          <button
            onClick={() => {
              // TODO: 문의하기 기능 구현
              alert("문의하기 기능은 준비 중입니다.")
            }}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors"
          >
            1:1 문의하기
          </button>
        </div>
      </div>
    </div>
  )
}
