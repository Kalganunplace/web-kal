"use client"

import { Button } from "@/components/ui/button"
import { CircleWonIcon, PlusIcon } from "@/components/ui/icon"
import { BodySmall, CaptionSmall } from "@/components/ui/typography"
import { useAuthAware } from "@/hooks/use-auth-aware"
import { AuthAware } from "@/components/auth/auth-aware"
import { LoginBottomSheet } from "@/components/auth/login-prompt"
import { useAuthHydration } from "@/hooks/use-auth-hydration"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function HomePage() {
  const router = useRouter()
  const { user, navigateWithAuth } = useAuthAware()
  const { user: authUser, loading } = useAuthHydration()
  const [showLoginSheet, setShowLoginSheet] = useState(false)
  const [loginSheetConfig, setLoginSheetConfig] = useState({
    title: "로그인이 필요해요",
    message: "이 기능을 사용하려면 로그인이 필요합니다."
  })

  const handleKnifeRequest = () => {
    navigateWithAuth(
      "/knife-request", 
      "/knife-request", // 게스트도 접근 가능
      false // 로그인 강제하지 않음
    )
  }

  const handlePriceList = () => {
    router.push("/price-list")
  }

  const handleGuide = () => {
    router.push("/guide")
  }

  const handleEvent = () => {
    if (!loading && !authUser) {
      setLoginSheetConfig({
        title: "이벤트 참여하기",
        message: "신규고객 전용 1+1 이벤트에 참여하려면 로그인이 필요합니다."
      })
      setShowLoginSheet(true)
      return
    }
    router.push("/events/new-customer")
  }

  const handleSubscription = () => {
    if (!loading && !authUser) {
      setLoginSheetConfig({
        title: "구독 서비스 신청하기",
        message: "구독 서비스를 이용하려면 로그인이 필요합니다."
      })
      setShowLoginSheet(true)
      return
    }
    router.push("/subscription")
  }

  return (
    <>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center gap-5 px-5">
        {/* Brand Logo */}
        <div className="flex justify-center items-center pt-15 pb-4 w-full">
          <div className="relative flex items-center justify-center">
            {/* Logo Text */}
            <Image
              src="/svg/logo.svg"
              alt="Main Banner"
              width={100}
              height={100}
              className="object-cover mt-10"
            />

          </div>
        </div>

        {/* Main Banner */}
        <div className="w-full aspect-[33/36] bg-gray-200 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-end items-center gap-1 p-5">
          {/* Background Image */}
          <div className="absolute inset-0 -left-1/4 w-[150%]">
            <Image
              src="/images/home/main_banner.png"
              alt="Main Banner"
              fill
              className="object-cover"
            />
          </div>

          {/* Banner Text - 로그인 여부에 따른 개인화 */}
          <div className="absolute left-6 top-1/3 z-10">
            <AuthAware
              fallback={
                <div
                  className="text-white text-2xl leading-relaxed"
                  style={{ fontFamily: 'Do Hyeon', fontWeight: 400 }}
                >
                  더이상 칼로<br />으깨지 마세요.<br />썰어야죠...
                </div>
              }
            >
              <div
                className="text-white text-2xl leading-relaxed"
                style={{ fontFamily: 'Do Hyeon', fontWeight: 400 }}
              >
                {user?.name}님,<br />오늘도 칼갈이<br />어떠세요?
              </div>
            </AuthAware>
          </div>

          {/* CTA Button - 인증 상태에 따른 텍스트 변경 */}
          <Button
            variant="white"
            size="md"
            onClick={handleKnifeRequest}
            className="w-4/5 bg-[#F2F2F2] rounded-md shadow-lg flex justify-center items-center px-4 py-6 z-10"
          >
            <span className="text-[#E67E22] text-base font-extrabold leading-none">
              <AuthAware fallback="첫 칼갈이 신청하기">
                칼갈이 신청하기
              </AuthAware>
            </span>
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex justify-between items-center gap-5">
          {/* Price List Button */}
          <button
            onClick={handlePriceList}
            className="flex-1 h-16 bg-[#F2F2F2] rounded-xl shadow-lg flex justify-between items-center px-5"
          >
            <BodySmall color="#333333">가격표</BodySmall>
            <div className="w-6 h-6">
              <CircleWonIcon size={24} color="#E67E22" />
            </div>
          </button>

          {/* Guide Button */}
          <button
            onClick={handleGuide}
            className="flex-1 h-16 bg-[#F2F2F2] rounded-xl shadow-lg flex justify-between items-center px-5"
          >
            <BodySmall color="#333333">가이드</BodySmall>
            <div className="w-6 h-6">
              <div className="w-6 h-6 border-2 border-[#E67E22] rounded-full flex items-center justify-center">
                <span className="text-[#E67E22] text-xs font-bold">i</span>
              </div>
            </div>
          </button>
        </div>

        {/* Sub Banners */}
        <div className="w-full space-y-5">
          {/* Event Banner */}
          <button
            onClick={handleEvent}
            className="w-full aspect-[33/12] bg-gradient-to-br from-[#E67E22] to-[#FF8E63] rounded-3xl shadow-md relative overflow-hidden flex flex-col justify-center items-center hover:scale-[1.02] transition-transform"
          >
            {/* Content */}
            <div className="flex flex-col justify-center items-center gap-2 z-10">
              {/* Event Title */}
              <div className="border border-white/50 rounded px-2 py-1">
                <CaptionSmall color="#FFFFFF" className="text-xs leading-none text-center">
                  신규고객 전용 1+1 이벤트
                </CaptionSmall>
              </div>

              {/* Event Description */}
              <div className="flex justify-center items-center gap-2">
                <span
                  className="text-white text-3xl leading-tight"
                  style={{
                    fontFamily: 'Do Hyeon',
                    fontWeight: 400,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  하나갈면
                </span>

                <div className="w-5 h-5">
                  <PlusIcon size={18} color="#FFFFFF" />
                </div>

                <span
                  className="text-[#E67E22] text-3xl leading-tight"
                  style={{
                    fontFamily: 'Do Hyeon',
                    fontWeight: 400,
                    textShadow: '1px 1px 2px rgba(242,242,242,1)'
                  }}
                >
                  하나무료
                </span>
              </div>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-[#767676] rounded-full" />
              <div className="w-1.5 h-1.5 bg-[#767676] rounded-full" />
              <div className="w-1.5 h-1.5 bg-[#767676] rounded-full" />
            </div>

            {/* Period */}
            <div className="absolute top-4 right-4">
              <CaptionSmall color="#F2F2F2" className="text-xs leading-none">
                2025.03~2025.12
              </CaptionSmall>
            </div>
          </button>

          {/* Subscription Banner */}
          <button
            onClick={handleSubscription}
            className="w-full aspect-[33/12] bg-[#FAF3E0] rounded-3xl shadow-md relative overflow-hidden hover:scale-[1.02] transition-transform"
          >
            {/* Background decorative elements */}
            <div className="absolute top-3/4 right-1/4 w-8 h-1 bg-black/40 rounded-full blur-sm" />
            <div className="absolute top-4/5 right-1/5 w-8 h-1 bg-black/40 rounded-full blur-sm" />

            {/* Main content */}
            <div className="absolute left-6 top-1/4 flex justify-center items-center">
              <div
                className="text-[#333333]"
                style={{ fontFamily: 'Do Hyeon', fontSize: '24px', fontWeight: 400, lineHeight: '1.25em', textShadow: '0px 3px 3px rgba(0,0,0,0.2)' }}
              >
                이제 칼갈이도<br />구독으로!
              </div>
            </div>


            {/* Indicators */}
            <div className="absolute left-1/6 bottom-4 flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-[#B0B0B0] rounded-full" />
              <div className="w-1.5 h-1.5 bg-[#767676] rounded-full" />
              <div className="w-1.5 h-1.5 bg-[#B0B0B0] rounded-full" />
            </div>
          </button>
        </div>

        {/* Spacer for bottom navigation */}
        <div className="h-20" />
      </div>

      {/* 로그인 바텀시트 */}
      <LoginBottomSheet
        isOpen={showLoginSheet}
        onClose={() => setShowLoginSheet(false)}
        title={loginSheetConfig.title}
        message={loginSheetConfig.message}
      />
    </>
  )
}
