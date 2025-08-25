"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, Bell, FileText, User, ChevronRight } from "lucide-react"

export default function UsageHistory() {
  const historyItems = [
    {
      id: 1,
      date: "2023.06.06",
      service: "칼갈이 서비스",
      items: "식칼 2개, 과도 1개",
      status: "배송중",
      price: "13,000원",
    },
    {
      id: 2,
      date: "2023.05.15",
      service: "칼갈이 서비스",
      items: "회칼 1개, 가위 1개",
      status: "완료",
      price: "11,000원",
    },
    {
      id: 3,
      date: "2023.04.22",
      service: "칼갈이 서비스",
      items: "식칼 1개",
      status: "완료",
      price: "8,000원",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "배송중":
        return "bg-orange-100 text-orange-800"
      case "완료":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b">
          <h1 className="text-lg font-medium text-center">이용내역</h1>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 pb-20">
          <div className="space-y-3">
            {historyItems.map((item) => (
              <Card key={item.id} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800">{item.service}</span>
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{item.date}</p>
                      <p className="text-sm text-gray-500">{item.items}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">{item.price}</p>
                      <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {historyItems.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">이용내역이 없습니다</p>
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
            <button className="flex flex-col items-center py-2 text-gray-400">
              <Bell className="w-5 h-5" />
              <span className="text-xs mt-1">알림</span>
            </button>
            <button className="flex flex-col items-center py-2 text-orange-500">
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
