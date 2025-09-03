"use client"

import BottomNavigation from "@/components/bottom-navigation"
import { LoginBottomSheet } from "@/components/auth/login-prompt"
import { ChevronRightIcon } from "@/components/ui/icon"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, Typography } from "@/components/ui/typography"
import { useAuthHydration } from "@/hooks/use-auth-hydration"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { supabase, UserProfile } from "@/lib/auth/supabase"

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading } = useAuthHydration()
  const [showLoginSheet, setShowLoginSheet] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  // 사용자 프로필 정보 가져오기
  useEffect(() => {
    if (user && !loading) {
      setProfileLoading(true)
      supabase.getUserProfile(user.id)
        .then(response => {
          if (response.success && response.data) {
            setUserProfile(response.data)
          } else {
            console.error('프로필 조회 실패:', response.error)
          }
        })
        .catch(error => {
          console.error('프로필 조회 오류:', error)
        })
        .finally(() => {
          setProfileLoading(false)
        })
    }
  }, [user, loading])

  // 로딩 중인 경우 (인증 로딩 또는 프로필 로딩)
  if (loading || (user && profileLoading)) {
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

  // 비로그인 상태: 기본 프로필 화면 (로그인 바텀시트와 함께)
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
              onClick={() => setShowLoginSheet(true)}
              className="w-full h-12 bg-[#E67E22] hover:bg-[#D35400] text-white font-bold rounded-lg transition-colors"
            >
              로그인하기
            </button>
          </div>
        </div>

        {/* 로그인 바텀시트 */}
        <LoginBottomSheet
          isOpen={showLoginSheet}
          onClose={() => setShowLoginSheet(false)}
          title="내정보 확인하기"
          message="프로필 정보를 보려면 로그인이 필요합니다."
        />

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
        {/* 사용자 정보 */}
        <div className="text-center space-y-2">
          <Typography variant="h2" color="#333333" className="font-extrabold">
            {user.name}님
          </Typography>
          {userProfile && (
            <div className="flex items-center justify-center gap-4 text-sm text-[#666666]">
              <div className="flex items-center gap-1">
                <span>등급</span>
                <span className="font-bold text-[#E67E22] capitalize">
                  {userProfile.memberGrade}
                </span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-1">
                <span>서비스</span>
                <span className="font-bold text-[#E67E22]">
                  {userProfile.totalServices}회
                </span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-1">
                <span>가입</span>
                <span className="font-bold">
                  {userProfile.created_at ? 
                    new Date(userProfile.created_at).toLocaleDateString('ko-KR', {
                      year: '2-digit',
                      month: '2-digit'
                    }) : 
                    '24.01'
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 구독 배너 */}
        <div className="relative bg-[#FAF3E0] rounded-[30px] p-6 shadow-sm">
          {/* 구독 상태 배지 */}
          {userProfile?.subscriptionStatus === 'active' && (
            <div className="absolute top-4 left-4 z-20">
              <div className="bg-[#E67E22] text-white text-xs font-bold px-2 py-1 rounded-full">
                구독중
              </div>
            </div>
          )}

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
                {userProfile?.subscriptionStatus === 'active' ? (
                  '구독 서비스 이용중!'
                ) : (
                  <>
                    이제 칼갈이도<br />
                    구독으로!
                  </>
                )}
              </div>
              {userProfile?.subscriptionStatus === 'active' && (
                <div className="text-sm text-[#666666] mt-2">
                  매월 무제한 칼갈이 서비스
                </div>
              )}
            </div>

            {/* 하단 인디케이터 */}
            <div className="flex justify-center space-x-1">
              {[0, 1, 2].map((index) => (
                <div 
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full ${
                    index === 1 ? 'bg-gray-600' : 'bg-gray-400'
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* 내 보유 쿠폰 버튼 */}
        <button
          onClick={() => router.push("/coupons")}
          className="w-full h-12 bg-[#E67E22] text-white font-bold rounded-md flex items-center justify-center space-x-1 shadow-sm"
        >
          <div className="w-6 h-6 text-white">🎫</div>
          <span>
            내 보유 쿠폰 {userProfile?.couponCount ? `(${userProfile.couponCount}개)` : ''}
          </span>
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
              <div className="flex items-center justify-between w-full">
                <BodyMedium color="#333333" className="font-bold">설정</BodyMedium>
                <div className="flex items-center gap-2">
                  {userProfile && (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-[#666666]">알림</span>
                      <div className={`w-2 h-2 rounded-full ${
                        userProfile.notificationEnabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    </div>
                  )}
                  <ChevronRightIcon size={24} color="#CCCCCC" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}
