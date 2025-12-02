"use client"

import { Icon44 } from "@/components/icons"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, Typography } from "@/components/ui/typography"
import { useAuthActions } from "@/stores/auth-store"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function AppSettingsPage() {
  const router = useRouter()
  const { signOut } = useAuthActions()
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = () => {
    signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-white">
      <TopBanner
        title="설정"
        showBackButton={true}
        onBackClick={() => router.back()}
      />

      {/* 메인 콘텐츠 영역 */}
      <div className="px-5 py-6 space-y-5">
        {/* SMS 알림 설정 */}
        <div className="flex items-center justify-between py-4 px-5 bg-white rounded-lg">
          <BodyMedium color="#333333" className="font-bold">
            SMS 알림
          </BodyMedium>
          <div className="relative">
            <button
              onClick={() => setSmsNotifications(!smsNotifications)}
              className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                smsNotifications ? 'bg-[#E67E22]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  smsNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 서비스 버전 */}
        <div className="flex items-center justify-between py-4 px-5 bg-white rounded-lg border-t border-gray-100">
          <BodyMedium color="#333333" className="font-bold">
            서비스 버전
          </BodyMedium>
          <Typography variant="body-small" color="#333333" className="font-bold">
            v1.0.0
          </Typography>
        </div>

        {/* 로그아웃 버튼 */}
        <div className="absolute bottom-6 left-5 right-5">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full h-14 bg-gray-100 text-[#E67E22] font-bold rounded-lg flex items-center justify-center"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 로그아웃 확인 모달 */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-[30px] w-full max-w-sm p-6 space-y-5">
            {/* 모달 헤더 */}
            <div className="text-center">
              <Typography variant="h2" color="#333333" className="font-bold">
                로그아웃 하시겠습니까?
              </Typography>
            </div>

            {/* 로그아웃 아이콘 */}
            <div className="flex justify-center">
              <Icon44 size={70} color="#E67E22"/>
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-200"></div>

            {/* 버튼 영역 */}
            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full h-12 bg-[#E67E22] text-white font-bold rounded-md"
              >
                로그아웃
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-full h-12 bg-gray-100 text-[#E67E22] font-bold rounded-md"
              >
                아니요
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
