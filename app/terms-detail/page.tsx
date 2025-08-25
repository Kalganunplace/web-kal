"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, BodySmall, CaptionMedium, Heading3 } from "@/components/ui/typography"

interface TermsSection {
  id: string
  title: string
  content: string
}

export default function TermsDetailPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms")
  
  useEffect(() => {
    // 로딩 시뮬레이션
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const termsOfService: TermsSection[] = [
    {
      id: "1",
      title: "제1조 (목적)",
      content: "이 약관은 칼가는곳(이하 '회사')이 제공하는 칼갈이 서비스(이하 '서비스')의 이용조건 및 절차, 회사와 이용자의 권리, 의무, 책임사항을 규정함을 목적으로 합니다."
    },
    {
      id: "2", 
      title: "제2조 (정의)",
      content: "① '서비스'란 회사가 제공하는 칼갈이 관련 모든 서비스를 의미합니다.\n② '이용자'란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.\n③ '회원'이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다."
    },
    {
      id: "3",
      title: "제3조 (서비스의 제공)",
      content: "① 회사는 다음과 같은 서비스를 제공합니다:\n1. 칼갈이 예약 및 관리 서비스\n2. 고객 상담 서비스\n3. 기타 회사가 추가 개발하거나 제휴계약 등을 통해 회원에게 제공하는 일체의 서비스\n② 회사는 필요시 서비스의 내용을 추가하거나 변경할 수 있습니다."
    },
    {
      id: "4",
      title: "제4조 (서비스 이용료)",
      content: "① 서비스 이용료는 서비스 제공 전에 고지됩니다.\n② 결제는 신용카드, 계좌이체, 간편결제 등의 방법으로 가능합니다.\n③ 서비스 취소 시 결제 수수료를 제외한 금액을 환불해드립니다."
    },
    {
      id: "5",
      title: "제5조 (개인정보보호)",
      content: "① 회사는 이용자의 개인정보를 보호하기 위해 개인정보처리방침을 수립, 시행하고 있습니다.\n② 회사의 개인정보처리방침은 관련 법령의 변경, 정부의 정책변경 또는 보안기술의 변경에 따라 내용이 수정될 수 있습니다."
    }
  ]

  const privacyPolicy: TermsSection[] = [
    {
      id: "1",
      title: "1. 개인정보의 수집 및 이용목적",
      content: "회사는 다음의 목적을 위하여 개인정보를 처리합니다:\n\n① 서비스 제공\n- 칼갈이 서비스 예약 및 이용\n- 고객상담 및 불만처리\n- 서비스 개선을 위한 의견수렴\n\n② 마케팅 및 광고에의 활용\n- 이벤트 및 광고성 정보 제공\n- 맞춤형 서비스 제공"
    },
    {
      id: "2",
      title: "2. 수집하는 개인정보의 항목",
      content: "① 필수항목\n- 이름, 휴대폰번호, 주소\n\n② 선택항목\n- 이메일 주소\n\n③ 자동으로 수집되는 정보\n- 서비스 이용기록, 접속 로그, 쿠키"
    },
    {
      id: "3",
      title: "3. 개인정보의 보유 및 이용기간",
      content: "① 회원정보: 회원 탈퇴 시까지\n② 서비스 이용기록: 3년\n③ 결제정보: 5년\n④ 불만 및 상담 내역: 3년\n\n단, 관련 법령에 의하여 보존할 필요가 있는 경우에는 해당 법령에서 정한 기간 동안 보존합니다."
    },
    {
      id: "4", 
      title: "4. 개인정보의 제3자 제공",
      content: "① 회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.\n② 다음의 경우에는 예외로 합니다:\n- 이용자가 사전에 동의한 경우\n- 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우"
    },
    {
      id: "5",
      title: "5. 개인정보 보호책임자",
      content: "① 성명: 개인정보보호담당자\n② 연락처: privacy@칼가는곳.com\n③ 전화번호: 1588-1234\n\n개인정보와 관련된 불만처리, 피해구제 등에 관한 사항은 개인정보보호책임자에게 연락해 주시기 바랍니다."
    }
  ]

  if (loading) {
    return (
      <>
        <TopBanner
          title="이용약관"
          onBackClick={() => router.back()}
        />
        
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <BodyMedium color="#666666">약관을 불러오는 중...</BodyMedium>
          </div>
        </div>
      </>
    )
  }

  const currentSections = activeTab === "terms" ? termsOfService : privacyPolicy

  return (
    <>
      <TopBanner
        title="이용약관"
        onBackClick={() => router.back()}
      />

      <div className="flex-1 bg-gray-50">
        {/* 탭 네비게이션 */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab("terms")}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === "terms"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-600"
              }`}
            >
              이용약관
            </button>
            <button
              onClick={() => setActiveTab("privacy")}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === "privacy"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-600"
              }`}
            >
              개인정보처리방침
            </button>
          </div>
        </div>

        {/* 약관 내용 */}
        <div className="px-5 py-6">
          <div className="bg-white rounded-xl p-6 mb-4">
            <div className="text-center mb-6">
              <Heading3 color="#333333" className="font-bold mb-2">
                {activeTab === "terms" ? "칼가는곳 서비스 이용약관" : "개인정보처리방침"}
              </Heading3>
              <CaptionMedium color="#999999">
                최종 수정일: 2024년 3월 1일
              </CaptionMedium>
            </div>

            <div className="space-y-8">
              {currentSections.map((section) => (
                <div key={section.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                  <Heading3 color="#333333" className="font-bold mb-4">
                    {section.title}
                  </Heading3>
                  <BodyMedium color="#666666" className="leading-relaxed whitespace-pre-line">
                    {section.content}
                  </BodyMedium>
                </div>
              ))}
            </div>
          </div>

          {/* 시행일자 */}
          <div className="bg-gray-100 rounded-xl p-4 text-center">
            <CaptionMedium color="#666666">
              본 약관은 2024년 3월 1일부터 시행됩니다.
            </CaptionMedium>
          </div>

          {/* 문의 안내 */}
          <div className="bg-orange-50 rounded-xl p-4 mt-4">
            <BodySmall color="#E67E22" className="font-medium text-center">
              약관에 대한 문의사항이 있으시면 고객센터(1588-1234)로 연락해 주세요.
            </BodySmall>
          </div>

          {/* Spacer for bottom navigation */}
          <div className="h-20" />
        </div>
      </div>
    </>
  )
}