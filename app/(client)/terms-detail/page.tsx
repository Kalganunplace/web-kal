"use client"

import { ChevronRightIcon } from "@/components/ui/icon"
import TopBanner from "@/components/ui/top-banner"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface TermsSection {
  id: string
  title: string
  content: string
}

interface TermsItem {
  id: string
  title: string
  type: "terms" | "privacy" | "location" | "identity" | "marketing" | "advertising"
}

export default function TermsDetailPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [selectedTerms, setSelectedTerms] = useState<TermsItem | null>(null)

  useEffect(() => {
    // 로딩 시뮬레이션
    setTimeout(() => setLoading(false), 800)
  }, [])

  const termsList: TermsItem[] = [
    {
      id: "1",
      title: "서비스 이용 약관",
      type: "terms"
    },
    {
      id: "2",
      title: "개인정보 수집 및 이용",
      type: "privacy"
    },
    {
      id: "3",
      title: "위치기반 서비스 이용약관",
      type: "location"
    },
    {
      id: "4",
      title: "본인확인서비스 동의사항",
      type: "identity"
    },
    {
      id: "5",
      title: "마케팅 정보 동의 수신 동의",
      type: "marketing"
    },
    {
      id: "6",
      title: "맞춤형 광고 목적 개인정보 수집 및 이용",
      type: "advertising"
    }
  ]

  const termsContent = `제1조 (목적)

이 약관은 주식회사 칼가는곳(이하 "회사")이 제공하는 칼갈이 중개 서비스 '칼가는곳'(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.

제2조 (정의)

"서비스"란 회사가 운영하는 모바일 애플리케이션 및 웹사이트를 통해 이용자가 칼갈이 서비스를 신청하고, 연계된 전문가로부터 서비스를 제공받을 수 있도록 중개하는 플랫폼을 말합니다.

"이용자"란 이 약관에 따라 회사가 제공하는 서비스를 이용하는 자를 말합니다.

"전문가(또는 아티잔)"란 회사와 제휴하여 이용자에게 칼갈이 서비스를 제공하는 자를 말합니다.

제3조 (약관의 효력 및 변경)

본 약관은 서비스 초기 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다.

회사는 관련 법령을 위반하지 않는 범위에서 약관을 개정할 수 있으며, 개정 시 개정 내용과 시행일을 명시하여 사전에 공지합니다.

이용자가 개정 약관에 동의하지 않는 경우, 이용계약을 해지할 수 있습니다. 개정 약관의 시행일까지 이의를 제기하지 않을 경우, 개정 약관에 동의한 것으로 간주합니다.

제4조 (이용계약 체결)

이용계약은 이용자가 본 약관에 동의하고, 회사가 정한 절차에 따라 서비스 이용 신청을 완료함으로써 성립됩니다.

회사는 다음 각 호의 경우 이용 신청을 거부하거나, 사후에 이용계약을 해지할 수 있습니다.

허위 정보를 입력한 경우

서비스 목적에 부합하지 않거나 부정한 용도로 신청한 경우

기타 회사가 정한 기준을 위반한 경우

제5조 (서비스 내용 및 제공)

회사는 아래와 같은 서비스를 제공합니다.

칼갈이 전문가 예약 및 중개 서비스

서비스 관련 정보 제공 및 상담

그 외 회사가 정하는 부가서비스

회사는 전문가와 이용자 간의 거래를 중개하는 플랫폼 운영자일 뿐, 칼갈이 서비스의 직접 제공자는 아닙니다.`

  const handleTermsClick = (terms: TermsItem) => {
    setSelectedTerms(terms)
  }

  const handleBackToList = () => {
    setSelectedTerms(null)
  }

  if (loading) {
    return (
      <>
        <TopBanner
          title="이용약관"
          onBackClick={() => router.back()}
        />

        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mb-4"></div>
          </div>
        </div>
      </>
    )
  }

  // 약관 상세 화면
  if (selectedTerms) {
    return (
      <>
        <TopBanner
          title={selectedTerms.title}
          onBackClick={handleBackToList}
        />

        <div className="flex-1 bg-white">
          {/* 구분선 */}
          <div className="h-px bg-gray-300 mx-5"></div>

          {/* 약관 내용 */}
          <div className="flex-1 px-6 py-6">
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line font-bold">
              {termsContent}
            </div>
          </div>
        </div>
      </>
    )
  }

  // 약관 목록 화면
  return (
    <>
      <TopBanner
        title="이용약관"
        onBackClick={() => router.back()}
      />

      <div className="flex-1 bg-white">
        {termsList.map((terms, index) => (
          <div key={terms.id}>
            <button
              onClick={() => handleTermsClick(terms)}
              className="w-full flex items-center justify-between py-5 px-5 hover:bg-gray-50 transition-colors"
            >
              <span className="text-base font-bold text-gray-800">
                {terms.title}
              </span>
              <ChevronRightIcon size={24} color="#767676" />
            </button>
            {index < termsList.length - 1 && (
              <div className="h-px bg-gray-300 mx-5"></div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
