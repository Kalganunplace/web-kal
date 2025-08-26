"use client"

import BottomNavigation from "@/components/bottom-navigation"
import { ChevronRightIcon } from "@/components/ui/icon"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, Typography } from "@/components/ui/typography"
import { useAuthHydration } from "@/hooks/use-auth-hydration"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading } = useAuthHydration()
  const [showLoginSheet, setShowLoginSheet] = useState(false)

  // 로딩 중인 경우
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <TopBanner
          title="내정보"
          showBackButton={false}
        />

        <div className="flex-1 flex items-center justify-center px-5 py-20">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-400 rounded-full animate-spin mb-4"></div>
          </div>
        </div>

        <BottomNavigation />
      </div>
    )
  }

  // 비로그인 상태: 로그인 유도 화면
  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <TopBanner
          title="내정보"
          showBackButton={false}
        />

        <div className="flex-1 flex items-center justify-center px-5">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 text-gray-400">👤</div>
              </div>
              <BodyMedium color="#666666" className="mb-4">내정보를 확인하려면</BodyMedium>
              <BodyMedium color="#666666">로그인해주세요</BodyMedium>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="w-full h-12 bg-[#E67E22] hover:bg-[#D35400] text-white font-bold rounded-lg transition-colors"
            >
              로그인하기
            </button>
          </div>
        </div>

        <BottomNavigation />
      </div>
    )
  }

  // 로그인 상태: Figma 디자인 기반 구현
  return (
    <div className="min-h-screen bg-white">
      <TopBanner
        title="내정보"
        showBackButton={false}
      />

      {/* 메인 콘텐츠 영역 */}
      <div className="px-5 py-6 space-y-5">
        {/* 사용자 이름 */}
        <div className="text-center">
          <Typography variant="h2" color="#333333" className="font-extrabold">
            {user.name}님
          </Typography>
        </div>

        {/* 구독 배너 */}
        <div className="relative bg-[#FAF3E0] rounded-[30px] p-6 shadow-sm">
          {/* 배경 이미지들 */}
          <div className="absolute top-0 right-0 w-full h-full overflow-hidden rounded-[30px]">
            <div className="absolute top-4 right-4 w-[59px] h-[59px] bg-cover bg-center opacity-20"></div>
            <div className="absolute top-6 right-0 w-[59px] h-[59px] bg-cover bg-center opacity-20"></div>
            <div className="absolute bottom-2 right-4 w-[35px] h-[35px] bg-cover bg-center opacity-20"></div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="relative z-10">
            <div className="text-center mb-4">
              <div className="text-2xl font-normal text-[#333333] leading-tight drop-shadow-sm">
                이제 칼갈이도<br />
                구독으로!
              </div>
            </div>

            {/* 하단 인디케이터 */}
            <div className="flex justify-center space-x-1">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* 내 보유 쿠폰 버튼 */}
        <button
          onClick={() => router.push("/coupons")}
          className="w-full h-12 bg-[#E67E22] text-white font-bold rounded-md flex items-center justify-center space-x-1 shadow-sm"
        >
          <div className="w-6 h-6 text-white">🎫</div>
          <span>내 보유 쿠폰</span>
        </button>

        {/* 메뉴 리스트 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="space-y-0">
            {/* 회원 정보 */}
            <button
              onClick={() => router.push("/member-info")}
              className="w-full flex items-center justify-between py-4 px-5 border-b border-gray-100"
            >
              <BodyMedium color="#333333" className="font-bold">회원 정보</BodyMedium>
              <ChevronRightIcon size={24} color="#CCCCCC" />
            </button>

            {/* 주소 설정 */}
            <button
              onClick={() => router.push("/address-settings")}
              className="w-full flex items-center justify-between py-4 px-5 border-b border-gray-100"
            >
              <BodyMedium color="#333333" className="font-bold">주소 설정</BodyMedium>
              <ChevronRightIcon size={24} color="#CCCCCC" />
            </button>

            {/* 공지사항 */}
            <button
              onClick={() => router.push("/notices")}
              className="w-full flex items-center justify-between py-4 px-5 border-b border-gray-100"
            >
              <BodyMedium color="#333333" className="font-bold">공지사항</BodyMedium>
              <ChevronRightIcon size={24} color="#CCCCCC" />
            </button>

            {/* 고객센터 */}
            <button
              onClick={() => router.push("/customer-service")}
              className="w-full flex items-center justify-between py-4 px-5 border-b border-gray-100"
            >
              <BodyMedium color="#333333" className="font-bold">고객센터</BodyMedium>
              <ChevronRightIcon size={24} color="#CCCCCC" />
            </button>

            {/* 이용약관 */}
            <button
              onClick={() => router.push("/terms-detail")}
              className="w-full flex items-center justify-between py-4 px-5 border-b border-gray-100"
            >
              <BodyMedium color="#333333" className="font-bold">이용약관</BodyMedium>
              <ChevronRightIcon size={24} color="#CCCCCC" />
            </button>

            {/* 설정 */}
            <button
              onClick={() => router.push("/app-settings")}
              className="w-full flex items-center justify-between py-4 px-5"
            >
              <BodyMedium color="#333333" className="font-bold">설정</BodyMedium>
              <ChevronRightIcon size={24} color="#CCCCCC" />
            </button>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}
