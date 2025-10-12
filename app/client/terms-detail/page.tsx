"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, BodySmall, Heading3 } from "@/components/ui/typography"

interface TermSection {
  id: string
  title: string
  content: string
}

export default function TermsDetailPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>("service")

  // TODO: 나중에 Supabase에서 가져오기
  const terms: Record<string, TermSection[]> = {
    service: [
      {
        id: "1",
        title: "제1조 (목적)",
        content: "본 약관은 칼가는곳(이하 '회사')이 제공하는 칼갈이 서비스의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다."
      },
      {
        id: "2",
        title: "제2조 (용어의 정의)",
        content: "1. '서비스'란 회사가 제공하는 칼갈이 수거, 작업, 배송 등 일체의 서비스를 의미합니다.\n2. '이용자'란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.\n3. '회원'이란 회사에 개인정보를 제공하여 회원 등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며, 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다."
      },
      {
        id: "3",
        title: "제3조 (서비스의 제공)",
        content: "1. 회사는 다음과 같은 서비스를 제공합니다.\n   - 칼갈이 예약 및 수거 서비스\n   - 칼 연마 및 관리 서비스\n   - 완료된 칼의 배송 서비스\n   - 서비스 이용 내역 조회\n2. 회사는 필요한 경우 서비스의 내용을 추가 또는 변경할 수 있습니다."
      },
      {
        id: "4",
        title: "제4조 (서비스 이용 시간)",
        content: "1. 서비스 이용은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간 운영을 원칙으로 합니다.\n2. 회사는 시스템 정기점검, 증설 및 교체를 위해 서비스를 일시적으로 중단할 수 있으며, 예정된 작업의 경우 사전에 공지합니다."
      },
      {
        id: "5",
        title: "제5조 (서비스의 변경 및 중지)",
        content: "회사는 다음 각 호에 해당하는 경우 서비스 제공을 중지할 수 있습니다.\n1. 설비의 보수 등을 위하여 부득이한 경우\n2. 전기통신사업법에 규정된 기간통신사업자가 전기통신 서비스를 중지한 경우\n3. 국가비상사태, 정전, 서비스 설비의 장애 또는 서비스 이용의 폭주 등으로 정상적인 서비스 제공이 불가능한 경우"
      }
    ],
    privacy: [
      {
        id: "1",
        title: "제1조 (개인정보의 수집 항목 및 방법)",
        content: "1. 회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.\n   - 필수항목: 이름, 휴대전화번호, 주소\n   - 선택항목: 이메일 주소\n2. 개인정보는 회원가입 시 이용자가 직접 입력하는 방식으로 수집됩니다."
      },
      {
        id: "2",
        title: "제2조 (개인정보의 이용 목적)",
        content: "회사는 수집한 개인정보를 다음의 목적으로 이용합니다.\n1. 서비스 제공: 칼 수거 및 배송, 서비스 예약 관리\n2. 회원관리: 본인 확인, 불만 처리 등 민원 처리\n3. 마케팅 및 광고: 이벤트 정보 제공, 맞춤 서비스 제공"
      },
      {
        id: "3",
        title: "제3조 (개인정보의 보유 및 이용 기간)",
        content: "회사는 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 따라 보존할 필요가 있는 경우 회사는 아래와 같이 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.\n- 계약 또는 청약철회 등에 관한 기록: 5년\n- 대금결제 및 재화 등의 공급에 관한 기록: 5년\n- 소비자의 불만 또는 분쟁처리에 관한 기록: 3년"
      },
      {
        id: "4",
        title: "제4조 (개인정보의 제3자 제공)",
        content: "회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.\n1. 이용자가 사전에 동의한 경우\n2. 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우"
      }
    ],
    payment: [
      {
        id: "1",
        title: "제1조 (결제 방법)",
        content: "서비스 이용료는 다음과 같은 방법으로 결제할 수 있습니다.\n1. 신용카드 결제\n2. 계좌이체\n3. 쿠폰 사용"
      },
      {
        id: "2",
        title: "제2조 (환불 정책)",
        content: "1. 서비스 수거 전 취소: 전액 환불\n2. 서비스 진행 중 취소: 작업 진행 정도에 따라 부분 환불\n3. 서비스 완료 후 취소: 환불 불가 (단, 회사의 과실인 경우 전액 환불)"
      },
      {
        id: "3",
        title: "제3조 (쿠폰 사용)",
        content: "1. 쿠폰은 발급일로부터 유효기간 내에만 사용 가능합니다.\n2. 쿠폰은 현금으로 환불되지 않습니다.\n3. 중복 사용이 불가능한 쿠폰의 경우, 하나의 주문에 하나의 쿠폰만 적용됩니다."
      }
    ]
  }

  const tabs = [
    { id: "service", label: "서비스 이용약관" },
    { id: "privacy", label: "개인정보 처리방침" },
    { id: "payment", label: "결제 및 환불" }
  ]

  return (
    <div className="min-h-screen bg-white">
      <TopBanner
        title="이용약관"
        onBackClick={() => router.back()}
      />

      {/* 탭 메뉴 */}
      <div className="sticky top-[60px] z-10 bg-white border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 내용 */}
      <div className="px-5 py-6 space-y-6">
        {terms[activeTab]?.map((section) => (
          <div key={section.id} className="space-y-3">
            <Heading3 color="#333333" className="font-bold">
              {section.title}
            </Heading3>
            <BodyMedium color="#666666" className="leading-relaxed whitespace-pre-line">
              {section.content}
            </BodyMedium>
          </div>
        ))}

        {/* 하단 공지 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <BodySmall color="#999999" className="text-center">
            최종 수정일: 2025.06.06
          </BodySmall>
        </div>
      </div>
    </div>
  )
}
