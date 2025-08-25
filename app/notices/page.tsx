"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, BodySmall, CaptionMedium, Heading3 } from "@/components/ui/typography"

interface Notice {
  id: string
  title: string
  content: string
  date: string
  isNew: boolean
  isImportant: boolean
}

export default function NoticesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [notices, setNotices] = useState<Notice[]>([])
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)

  useEffect(() => {
    const loadNotices = async () => {
      setLoading(true)
      
      // 로딩 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockNotices: Notice[] = [
        {
          id: "1",
          title: "서비스 이용 안내",
          content: "안녕하세요, 칼가는곳 서비스를 이용해주셔서 감사합니다.\n\n서비스 이용 시 다음 사항을 확인해주세요:\n\n1. 칼갈이 서비스는 대구 지역 내에서만 제공됩니다.\n2. 서비스 예약은 최소 1일 전에 해주셔야 합니다.\n3. 칼의 상태에 따라 작업 시간이 달라질 수 있습니다.\n\n궁금한 사항이 있으시면 고객센터로 문의해주세요.",
          date: "2024.03.15",
          isNew: true,
          isImportant: true
        },
        {
          id: "2", 
          title: "3월 이벤트 안내",
          content: "3월 한정 특별 이벤트를 진행합니다!\n\n신규 회원 가입 시 첫 서비스 30% 할인 쿠폰을 드립니다.\n친구 추천 시 추가 10% 할인 혜택까지!\n\n이벤트 기간: 2024.03.01 ~ 2024.03.31\n\n많은 참여 부탁드립니다.",
          date: "2024.03.10",
          isNew: false,
          isImportant: false
        },
        {
          id: "3",
          title: "서비스 지역 확대 안내",
          content: "칼가는곳 서비스 지역이 확대됩니다!\n\n기존 대구 중구에서 대구 전 지역으로 서비스가 확대되었습니다.\n\n새로 추가된 지역:\n- 대구 동구\n- 대구 서구  \n- 대구 남구\n- 대구 북구\n\n더 많은 고객분들께 편리한 서비스를 제공하겠습니다.",
          date: "2024.03.05",
          isNew: false,
          isImportant: false
        },
        {
          id: "4",
          title: "개인정보 처리방침 변경 안내",
          content: "개인정보 처리방침이 일부 변경되었습니다.\n\n주요 변경사항:\n- 개인정보 보유기간 명시\n- 마케팅 정보 수신 동의 절차 개선\n- 개인정보 수집 목적 구체화\n\n자세한 내용은 앱 설정 > 개인정보 처리방침에서 확인하실 수 있습니다.",
          date: "2024.02.28",
          isNew: false,
          isImportant: false
        }
      ]
      
      setNotices(mockNotices)
      setLoading(false)
    }

    loadNotices()
  }, [])

  if (loading) {
    return (
      <>
        <TopBanner
          title="공지사항"
          onBackClick={() => router.back()}
        />
        
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <BodyMedium color="#666666">공지사항을 불러오는 중...</BodyMedium>
          </div>
        </div>
      </>
    )
  }

  if (selectedNotice) {
    return (
      <>
        <TopBanner
          title="공지사항"
          onBackClick={() => setSelectedNotice(null)}
        />
        
        <div className="flex-1 px-5 py-6 bg-gray-50">
          <div className="bg-white rounded-xl p-6 mb-6">
            {/* 제목과 날짜 */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                {selectedNotice.isImportant && (
                  <div className="bg-red-100 text-red-500 px-2 py-1 rounded text-xs font-bold">
                    중요
                  </div>
                )}
                {selectedNotice.isNew && (
                  <div className="bg-orange-100 text-orange-500 px-2 py-1 rounded text-xs font-bold">
                    새글
                  </div>
                )}
              </div>
              <Heading3 color="#333333" className="font-bold mb-2 leading-snug">
                {selectedNotice.title}
              </Heading3>
              <CaptionMedium color="#999999">
                {selectedNotice.date}
              </CaptionMedium>
            </div>
            
            {/* 내용 */}
            <div className="border-t border-gray-100 pt-4">
              <BodyMedium color="#333333" className="leading-relaxed whitespace-pre-line">
                {selectedNotice.content}
              </BodyMedium>
            </div>
          </div>
          
          {/* Spacer for bottom navigation */}
          <div className="h-20" />
        </div>
      </>
    )
  }

  return (
    <>
      <TopBanner
        title="공지사항"
        onBackClick={() => router.back()}
      />

      <div className="flex-1 px-5 py-6 bg-gray-50">
        {notices.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              📢
            </div>
            <Heading3 color="#333333" className="font-medium mb-2">공지사항이 없습니다</Heading3>
            <BodyMedium color="#666666">새로운 소식이 있으면 알려드리겠습니다</BodyMedium>
          </div>
        ) : (
          <div className="space-y-3">
            {notices.map((notice) => (
              <button
                key={notice.id}
                onClick={() => setSelectedNotice(notice)}
                className="w-full bg-white rounded-xl p-4 text-left hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    {/* 배지들 */}
                    <div className="flex items-center gap-2 mb-2">
                      {notice.isImportant && (
                        <div className="bg-red-100 text-red-500 px-2 py-1 rounded text-xs font-bold">
                          중요
                        </div>
                      )}
                      {notice.isNew && (
                        <div className="bg-orange-100 text-orange-500 px-2 py-1 rounded text-xs font-bold">
                          새글
                        </div>
                      )}
                    </div>
                    
                    {/* 제목 */}
                    <BodyMedium color="#333333" className="font-medium mb-2 line-clamp-2">
                      {notice.title}
                    </BodyMedium>
                    
                    {/* 날짜 */}
                    <CaptionMedium color="#999999">
                      {notice.date}
                    </CaptionMedium>
                  </div>
                  
                  {/* 화살표 아이콘 */}
                  <div className="text-gray-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Spacer for bottom navigation */}
        <div className="h-20" />
      </div>
    </>
  )
}