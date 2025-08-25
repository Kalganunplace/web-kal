"use client"

import { Button } from "@/components/ui/button"
import { BellIcon, ChevronRightIcon, GiftIcon } from "@/components/ui/icon"
import { Switch } from "@/components/ui/switch"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, CaptionMedium, Heading2, Heading3 } from "@/components/ui/typography"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuthHydration } from "@/hooks/use-auth-hydration"

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuthHydration()
  const [notifications, setNotifications] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const menuItems = [
    { title: "회원 정보", subtitle: "주소 설정", path: "/member-info" },
    { title: "구독 관리", subtitle: "", path: "/subscription" },
    { title: "공지사항", subtitle: "", path: "/notices" },
    { title: "고객센터", subtitle: "", path: "/customer-service" },
    { title: "이용약관", subtitle: "", path: "/terms-detail" },
    { title: "앱 설정", subtitle: "", path: "/app-settings" },
  ]

  // 로딩 중인 경우
  if (loading) {
    return (
      <>
        <TopBanner
          title="내정보"
          showBackButton={false}
        />
        
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <BodyMedium color="#666666">로딩 중...</BodyMedium>
          </div>
        </div>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <TopBanner
          title="내정보"
          showBackButton={false}
        />
        
        {/* 로그인 전 메인 화면 */}
        <div className="flex-1 px-5 py-16 bg-gray-50 relative">
          {/* 위치 정보 */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-5 h-5 text-orange-500">📍</div>
            <BodyMedium color="#666666">대구</BodyMedium>
          </div>

          {/* 메인 이미지 및 텍스트 */}
          <div className="bg-white rounded-3xl p-6 mb-8 relative overflow-hidden">
            <div className="relative z-10">
              <Heading2 color="#333333" className="mb-2 font-bold leading-tight">더이상 칼도</Heading2>
              <Heading2 color="#333333" className="mb-2 font-bold leading-tight">으깨지 마세요.</Heading2>
              <Heading2 color="#666666" className="font-normal">썰어야죠...</Heading2>
            </div>
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-gray-100 to-transparent opacity-30"></div>
          </div>

          {/* 로그인 모달 트리거 */}
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 h-full" onClick={() => setShowLoginModal(true)}></div>
        </div>

        {/* 로그인 모달 */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
            <div className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-8">
              <div className="text-center mb-6">
                <Heading2 color="#333333" className="mb-6 font-bold">로그인이 필요해요</Heading2>
                
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 text-orange-500">🛡️</div>
                </div>
                
                <div className="mb-2">
                  <BodyMedium color="#333333" className="font-medium">간편하게 로그인하고</BodyMedium>
                </div>
                <div className="mb-8">
                  <BodyMedium color="#333333" className="font-medium">칼가는곳의 다양한 서비스를 이용해보세요!</BodyMedium>
                </div>
                
                <div className="border-t border-gray-200 mb-6"></div>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setShowLoginModal(false)
                    router.push("/login")
                  }}
                  className="w-full h-14 bg-[#E67E22] hover:bg-[#D35400] text-white font-bold rounded-xl text-lg"
                >
                  로그인 · 회원가입
                </Button>
                
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="w-full py-4"
                >
                  <BodyMedium color="#E67E22" className="font-medium">나중에 가입</BodyMedium>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Spacer for bottom navigation */}
        <div className="h-20" />
      </>
    )
  }

  return (
    <>
      <TopBanner
        title="내정보"
        showBackButton={false}
      />

      {/* User Info */}
      <div className="bg-white px-5 py-6 text-center">
        <Heading2 color="#333333" className="font-bold">{user.name}님</Heading2>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-5 space-y-5 bg-gray-50">
        {/* Promotional Banner */}
        <div className="w-full h-[120px] bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200 rounded-3xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between h-full">
            <div className="flex flex-col justify-center z-10">
              <Heading3 color="#333333" className="mb-1 font-bold">이제 칼갈이도</Heading3>
              <Heading3 color="#E67E22" className="font-bold">구독으로!</Heading3>
              <div className="flex items-center mt-3">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
              </div>
            </div>
            <div className="relative h-full flex items-center">
              <Image
                src="/images/home/main_banner.png"
                alt="칼갈이 트럭"
                width={120}
                height={80}
                className="object-contain"
              />
              <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                할인
              </div>
            </div>
          </div>
        </div>

        {/* 내 보유 쿠폰 버튼 */}
        <button
          onClick={() => router.push("/coupons")}
          className="w-full h-14 bg-[#E67E22] hover:bg-[#D35400] rounded-xl flex items-center justify-center gap-3 transition-colors"
        >
          <GiftIcon size={24} color="white" />
          <BodyMedium color="white" className="font-bold text-lg">내 보유 쿠폰</BodyMedium>
        </button>

        {/* Menu Items */}
        <div className="bg-white rounded-xl overflow-hidden">
          {/* Quick Settings - 알림 허용 */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BellIcon size={24} color="#E67E22" />
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
                <ChevronRightIcon size={24} color="#D9D9D9" />
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
