"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Bell, FileText, User, ChevronLeft } from "lucide-react"

export default function Notifications() {
  const notifications = [
    {
      id: 1,
      title: "칼이 배송중입니다!",
      date: "2023.06.06",
      time: "오후 3시",
      status: "배송중",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
          <h1 className="text-lg font-medium">알림</h1>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600">안읽은 알림 1개</span>
            <span className="text-sm text-gray-600">전체 읽기</span>
          </div>

          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card key={notification.id} className="border-orange-100">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          <span className="text-orange-600 font-medium text-sm">{notification.title}</span>
                        </div>
                        <p className="text-xs text-gray-500">{notification.date}</p>
                      </div>
                      <span className="text-xs text-gray-400">{notification.time}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-700">칼이 배송중입니다!</p>
                      <p className="text-xs text-gray-500 mt-1">연마 완료! 안전하게 배송 중이에요 :)</p>
                      <p className="text-xs text-orange-600 mt-2">택배 배송 예정: 2023.06.07 11:00</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
              <p className="text-gray-500 text-sm">알림이 없습니다</p>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="border-t border-gray-200 bg-white">
          <div className="flex justify-around py-2">
            <button className="flex flex-col items-center py-2 text-gray-400">
              <Home className="w-5 h-5" />
              <span className="text-xs mt-1">홈</span>
            </button>
            <button className="flex flex-col items-center py-2 text-orange-500">
              <Bell className="w-5 h-5" />
              <span className="text-xs mt-1">알림</span>
            </button>
            <button className="flex flex-col items-center py-2 text-gray-400">
              <FileText className="w-5 h-5" />
              <span className="text-xs mt-1">이용내역</span>
            </button>
            <button className="flex flex-col items-center py-2 text-gray-400">
              <User className="w-5 h-5" />
              <span className="text-xs mt-1">내정보</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
