"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Megaphone } from "lucide-react"

export default function Notices() {
  const notices = [
    {
      id: 1,
      title: "서비스 지역 확대 안내",
      content: "대구 전 지역으로 서비스가 확대되었습니다.",
      date: "2023.06.05",
      isNew: true,
      category: "서비스",
    },
    {
      id: 2,
      title: "추석 연휴 서비스 일정 안내",
      content: "추석 연휴 기간 중 서비스 일정을 안내드립니다.",
      date: "2023.06.01",
      isNew: true,
      category: "공지",
    },
    {
      id: 3,
      title: "앱 업데이트 안내 (v2.1.0)",
      content: "새로운 기능이 추가된 앱 업데이트가 출시되었습니다.",
      date: "2023.05.28",
      isNew: false,
      category: "업데이트",
    },
    {
      id: 4,
      title: "개인정보처리방침 개정 안내",
      content: "개인정보처리방침이 개정되었습니다.",
      date: "2023.05.20",
      isNew: false,
      category: "정책",
    },
    {
      id: 5,
      title: "서비스 점검 완료 안내",
      content: "시스템 점검이 완료되어 정상 서비스됩니다.",
      date: "2023.05.15",
      isNew: false,
      category: "점검",
    },
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "서비스":
        return "bg-blue-100 text-blue-800"
      case "공지":
        return "bg-orange-100 text-orange-800"
      case "업데이트":
        return "bg-green-100 text-green-800"
      case "정책":
        return "bg-purple-100 text-purple-800"
      case "점검":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
          <h1 className="text-lg font-medium">공지사항</h1>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="space-y-3">
            {notices.map((notice) => (
              <Card
                key={notice.id}
                className="border-gray-200 hover:border-orange-200 transition-colors cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getCategoryColor(notice.category)}>{notice.category}</Badge>
                        {notice.isNew && <Badge className="bg-red-500 text-white text-xs">NEW</Badge>}
                      </div>
                      <h3 className="font-medium text-gray-800 mb-1 line-clamp-1">{notice.title}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{notice.content}</p>
                      <p className="text-xs text-gray-400">{notice.date}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {notices.length === 0 && (
            <div className="text-center py-20">
              <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">공지사항이 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
