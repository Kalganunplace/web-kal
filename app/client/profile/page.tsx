"use client"

import { AccountSwitchModal } from "@/components/auth/account-switch-modal"
import { LoginBottomSheet } from "@/components/auth/login-prompt"
import BottomNavigation from "@/components/common/bottom-navigation"
import { ChevronRightIcon } from "@/components/ui/icon"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, Typography } from "@/components/ui/typography"
import { useAuthHydration } from "@/hooks/use-auth-hydration"
import { UserProfile } from "@/lib/auth/supabase"
import { bannerService, type Banner } from "@/lib/banner-service"
import { useAuth } from "@/stores/auth-store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading } = useAuthHydration()
  const { signOut } = useAuth()
  const [showLoginSheet, setShowLoginSheet] = useState(false)
  const [showSwitchModal, setShowSwitchModal] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [subscriptionBanner, setSubscriptionBanner] = useState<Banner | null>(null)

  // 관리자가 클라이언트 페이지 접근 시 모달 표시
  useEffect(() => {
    if (user && !loading && user.type === 'admin') {
      setShowSwitchModal(true)
    }
  }, [user, loading])

  // 사용자 프로필 정보 가져오기
  useEffect(() => {
    if (user && !loading && user.type === 'client') {
      setProfileLoading(true)
      // API 라우트를 통해 프로필 조회 (JWT 토큰은 HttpOnly 쿠키로 자동 전달됨)
      fetch('/api/user/profile', {
        method: 'GET',
        credentials: 'include' // 쿠키 포함
      })
        .then(res => res.json())
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

  // 구독 배너 로드
  useEffect(() => {
    const loadBanner = async () => {
      try {
        const banner = await bannerService.getProfileSubscriptionBanner()
        setSubscriptionBanner(banner)
      } catch (error) {
        console.error('배너 로드 실패:', error)
      }
    }

    loadBanner()
  }, [])

  // 계정 전환 확인
  const handleSwitchAccount = async () => {
    await signOut()
    router.push('/client/login')
  }

  // 계정 전환 취소
  const handleCancelSwitch = () => {
    router.push('/admin')
  }

  // 관리자 계정 전환 모달
  if (showSwitchModal && user?.type === 'admin') {
    return (
      <AccountSwitchModal
        currentUserName={user.name || user.email || '관리자'}
        currentUserType="admin"
        targetType="client"
        onConfirm={handleSwitchAccount}
        onCancel={handleCancelSwitch}
      />
    )
  }

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
              className="w-full h-12 bg-[#E67E22]  text-white font-bold rounded-lg transition-colors"
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
        </div>

        {/* 구독 배너 - 관리자 설정 배너 또는 기본 배너 */}
        {subscriptionBanner ? (
          <div
            className="relative rounded-[30px] p-6 shadow-sm cursor-pointer"
            style={{
              backgroundColor: subscriptionBanner.background_color || '#FAF3E0'
            }}
            onClick={() => {
              if (subscriptionBanner.link_url) {
                router.push(subscriptionBanner.link_url)
              }
            }}
          >
            {/* 구독 상태 배지 */}
            {userProfile?.subscriptionStatus === 'active' && (
              <div className="absolute top-4 left-4 z-20">
                <div className="bg-[#E67E22] text-white text-xs font-bold px-2 py-1 rounded-full">
                  구독중
                </div>
              </div>
            )}

            {/* 배경 이미지 */}
            {subscriptionBanner.image_url && (
              <div className="absolute top-0 right-0 w-full h-full overflow-hidden rounded-[30px]">
                <img
                  src={subscriptionBanner.image_url}
                  alt={subscriptionBanner.title}
                  className="absolute right-0 top-0 h-full w-auto object-contain opacity-40"
                />
              </div>
            )}

            {/* 메인 콘텐츠 */}
            <div className="relative z-10">
              <div className="text-center mb-4">
                <div
                  className="text-2xl font-normal leading-tight drop-shadow-sm whitespace-pre-line"
                  style={{
                    color: subscriptionBanner.text_color || '#333333'
                  }}
                >
                  {subscriptionBanner.title}
                </div>
                {subscriptionBanner.subtitle && (
                  <div
                    className="text-sm mt-2"
                    style={{
                      color: subscriptionBanner.text_color || '#666666',
                      opacity: 0.8
                    }}
                  >
                    {subscriptionBanner.subtitle}
                  </div>
                )}
              </div>

              {subscriptionBanner.button_text && (
                <div className="text-center">
                  <button className="bg-[#E67E22] text-white px-6 py-2 rounded-lg font-medium">
                    {subscriptionBanner.button_text}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="relative bg-[#FAF3E0] rounded-[30px] p-6 shadow-sm">
            {/* 구독 상태 배지 */}
            {userProfile?.subscriptionStatus === 'active' && (
              <div className="absolute top-4 left-4 z-20">
                <div className="bg-[#E67E22] text-white text-xs font-bold px-2 py-1 rounded-full">
                  구독중
                </div>
              </div>
            )}

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
            </div>
          </div>
        )}

        {/* 내 보유 쿠폰 버튼 - 쿠폰이 있을 때만 표시 */}
        {userProfile?.couponCount != null && userProfile.couponCount > 0 && (
          <button
            onClick={() => router.push("/client/coupons")}
            className="w-full h-12 bg-[#E67E22] text-white font-bold rounded-md flex items-center justify-center space-x-1 shadow-sm"
          >
            <div className="w-6 h-6 text-white">🎫</div>
            <span>
              내 보유 쿠폰 ({userProfile.couponCount}개)
            </span>
          </button>
        )}

        {/* 메뉴 리스트 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="space-y-0">
            {/* 회원 정보 */}
            <button
              onClick={() => router.push("/client/member-info")}
              className="w-full flex items-center justify-between py-4 px-5 border-b border-gray-100"
            >
              <BodyMedium color="#333333" className="font-bold">회원 정보</BodyMedium>
              <ChevronRightIcon size={24} color="#CCCCCC" />
            </button>

            {/* 주소 설정 */}
            <button
              onClick={() => router.push("/client/address-settings")}
              className="w-full flex items-center justify-between py-4 px-5 border-b border-gray-100"
            >
              <BodyMedium color="#333333" className="font-bold">주소 설정</BodyMedium>
              <ChevronRightIcon size={24} color="#CCCCCC" />
            </button>

            {/* 공지사항 */}
            <button
              onClick={() => router.push("/client/notices")}
              className="w-full flex items-center justify-between py-4 px-5 border-b border-gray-100"
            >
              <BodyMedium color="#333333" className="font-bold">공지사항</BodyMedium>
              <ChevronRightIcon size={24} color="#CCCCCC" />
            </button>

            {/* 고객센터 */}
            <button
              onClick={() => router.push("/client/customer-service")}
              className="w-full flex items-center justify-between py-4 px-5 border-b border-gray-100"
            >
              <BodyMedium color="#333333" className="font-bold">고객센터</BodyMedium>
              <ChevronRightIcon size={24} color="#CCCCCC" />
            </button>

            {/* 이용약관 */}
            <button
              onClick={() => router.push("/client/terms-detail")}
              className="w-full flex items-center justify-between py-4 px-5 border-b border-gray-100"
            >
              <BodyMedium color="#333333" className="font-bold">이용약관</BodyMedium>
              <ChevronRightIcon size={24} color="#CCCCCC" />
            </button>

            {/* 설정 */}
            <button
              onClick={() => router.push("/client/app-settings")}
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
