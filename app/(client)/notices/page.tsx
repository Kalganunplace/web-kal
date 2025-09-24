"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, BodySmall, CaptionMedium, Heading3 } from "@/components/ui/typography"
import { createClient } from "@/lib/auth/supabase"

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
  const supabase = createClient()

  useEffect(() => {
    const loadNotices = async () => {
      setLoading(true)
      
      try {
        // 실제 DB에서 공지사항 조회
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('공지사항 조회 오류:', error)
          return
        }

        // DB 데이터를 Notice 형태로 변환
        const formattedNotices: Notice[] = data?.map(announcement => ({
          id: announcement.id,
          title: announcement.title,
          content: announcement.content,
          date: new Date(announcement.created_at).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).replace(/\. /g, '.'),
          isNew: new Date(announcement.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7일 이내는 New
          isImportant: announcement.is_important || false
        })) || []
        
        setNotices(formattedNotices)
      } catch (error) {
        console.error('공지사항 로드 실패:', error)
      } finally {
        setLoading(false)
      }
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