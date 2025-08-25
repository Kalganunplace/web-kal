"use client"

import { Button } from "@/components/ui/button"
import { BellIcon, ChevronRightIcon, GiftIcon } from "@/components/ui/icon"
import { Switch } from "@/components/ui/switch"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, CaptionMedium, Heading2, Heading3 } from "@/components/ui/typography"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function ProfilePage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState(true)

  const menuItems = [
    { title: "회원 정보", subtitle: "주소 설정", path: "/member-info" },
    { title: "구독 관리", subtitle: "", path: "/subscription" },
    { title: "공지사항", subtitle: "", path: "/notices" },
    { title: "고객센터", subtitle: "", path: "/customer-service" },
    { title: "이용약관", subtitle: "", path: "/terms-detail" },
    { title: "앱 설정", subtitle: "", path: "/app-settings" },
  ]

  return (
    <>
      <TopBanner
        title="프로필"
        onBackClick={() => router.back()}
      />


      {/* User Info */}
      <div className="bg-white px-5 py-4 text-center">
        <Heading2 color="#333333">칼가는곳 님</Heading2>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-5 space-y-6 bg-gray-50">
        {/* Promotional Banner */}
        <div className="w-full h-[100px] bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center justify-between h-full">
            <div className="flex flex-col justify-center">
              <Heading3 color="#333333" className="mb-1">이제 칼갈이도</Heading3>
              <Heading3 color="#333333">구독으로!</Heading3>
              <div className="flex items-center mt-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
              </div>
            </div>
            <div className="relative h-full flex items-center">
              <Image
                src="/placeholder.svg?height=80&width=120"
                alt="배송 트럭"
                width={100}
                height={60}
                className="object-contain"
              />
              <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                할인
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/login")}
            className="w-full h-12 bg-[#E67E22] hover:bg-[#D35400] text-white font-bold rounded-xl"
          >
            로그인 / 회원가입
          </Button>

          <button
            onClick={() => router.push("/coupons")}
            className="w-full h-12 border border-gray-300 bg-white rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <GiftIcon size={20} color="#E67E22" />
            <BodyMedium color="#333333">내 보유 쿠폰</BodyMedium>
          </button>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-xl overflow-hidden">
          {/* Quick Settings */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BellIcon size={20} color="#E67E22" />
                <div>
                  <BodyMedium color="#333333" className="font-medium">알림 허용</BodyMedium>
                  <CaptionMedium color="#767676" className="mt-1">주문 상태 및 서비스 알림</CaptionMedium>
                </div>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </div>

          {/* Menu List */}
          {menuItems.map((item, index) => (
            <div key={index}>
              <button
                onClick={() => router.push(item.path)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div>
                  <BodyMedium color="#333333" className="font-medium">{item.title}</BodyMedium>
                  {item.subtitle && (
                    <CaptionMedium color="#767676" className="mt-1">{item.subtitle}</CaptionMedium>
                  )}
                </div>
                <ChevronRightIcon size={20} color="#D9D9D9" />
              </button>
              {index < menuItems.length - 1 && (
                <div className="border-b border-gray-100" />
              )}
            </div>
          ))}
        </div>

        {/* Spacer for bottom navigation */}
        <div className="h-20" />
      </div>
    </>
  )
}
