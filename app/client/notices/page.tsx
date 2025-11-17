"use client"

import { useRouter } from "next/navigation"
import TopBanner from "@/components/ui/top-banner"
import { ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/auth/supabase"

interface Notice {
  id: string
  title: string
  created_at: string
  is_important: boolean
}

export default function NoticesPage() {
  const router = useRouter()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const supabase = await createClient()
        const { data, error } = await supabase
          .from('announcements')
          .select('id, title, created_at, is_important')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('공지사항 조회 오류:', error)
          return
        }

        setNotices(data || [])
      } catch (error) {
        console.error('공지사항 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotices()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '.').replace(/\.$/, '')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <TopBanner
          title="공지사항"
          onBackClick={() => router.back()}
        />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <TopBanner
        title="공지사항"
        onBackClick={() => router.back()}
      />

      <div className="px-5 py-4">
        {notices.map((notice) => (
          <div
            key={notice.id}
            onClick={() => router.push(`/client/notices/${notice.id}`)}
            className="border-b border-gray-200 py-4 cursor-pointer active:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {notice.is_important && (
                    <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded font-bold">
                      중요
                    </span>
                  )}
                  <h3 className="text-base font-medium text-gray-800">
                    {notice.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-500">{formatDate(notice.created_at)}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
            </div>
          </div>
        ))}

        {notices.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-gray-500">공지사항이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
