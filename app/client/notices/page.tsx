"use client"

import { useRouter } from "next/navigation"
import TopBanner from "@/components/ui/top-banner"
import { ChevronRight } from "lucide-react"

export default function NoticesPage() {
  const router = useRouter()

  // TODO: 나중에 Supabase에서 가져오기
  const notices = [
    {
      id: 1,
      title: "[공지] 칼가는곳에 오신걸 환영합니다",
      date: "2025.06.06",
    },
  ]

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
                <h3 className="text-base font-medium text-gray-800 mb-1">
                  {notice.title}
                </h3>
                <p className="text-sm text-gray-500">{notice.date}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
            </div>
          </div>
        ))}

        {notices.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500">공지사항이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
