"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Bell, FileText, User, ChevronRight, Gift } from "lucide-react"
import Image from "next/image"

export default function Profile() {
  const menuItems = [
    { title: "회원 정보", subtitle: "주소 설정" },
    { title: "구독 관리", subtitle: "" },
    { title: "공지사항", subtitle: "" },
    { title: "고객센터", subtitle: "" },
    { title: "이용약관", subtitle: "" },
    { title: "앱 설정", subtitle: "" },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 text-center">
          <h1 className="text-xl font-bold text-gray-800">칼가는곳 님</h1>
        </div>

        {/* Promotional Banner */}
        <div className="px-4 mb-4">
          <Card className="bg-gradient-to-r from-orange-100 to-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">이제 칼갈이도</h3>
                  <h3 className="font-bold text-gray-800">구독으로!</h3>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
                <div className="relative">
                  <Image
                    src="/placeholder.svg?height=80&width=120"
                    alt="배송 트럭"
                    width={120}
                    height={80}
                    className="object-contain"
                  />
                  <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    할인
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coupon Button */}
        <div className="px-4 mb-6">
          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-3">
            <Gift className="w-5 h-5 mr-2" />내 보유 쿠폰
          </Button>
        </div>

        {/* Menu Items */}
        <div className="px-4 pb-20">
          <div className="space-y-1">
            {menuItems.map((item, index) => (
              <div key={index}>
                <button className="w-full flex items-center justify-between py-4 text-left">
                  <div>
                    <h3 className="font-medium text-gray-800">{item.title}</h3>
                    {item.subtitle && <p className="text-sm text-gray-500 mt-1">{item.subtitle}</p>}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                {index === 1 && <hr className="border-gray-200" />}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200">
          <div className="flex justify-around py-2">
            <button className="flex flex-col items-center py-2 text-gray-400">
              <Home className="w-5 h-5" />
              <span className="text-xs mt-1">홈</span>
            </button>
            <button className="flex flex-col items-center py-2 text-gray-400">
              <Bell className="w-5 h-5" />
              <span className="text-xs mt-1">알림</span>
            </button>
            <button className="flex flex-col items-center py-2 text-gray-400">
              <FileText className="w-5 h-5" />
              <span className="text-xs mt-1">이용내역</span>
            </button>
            <button className="flex flex-col items-center py-2 text-orange-500">
              <User className="w-5 h-5" />
              <span className="text-xs mt-1">내정보</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
