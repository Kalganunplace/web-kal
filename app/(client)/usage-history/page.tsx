"use client"

import BottomSheet from "@/components/ui/bottom-sheet"
import { ChevronDownIcon, ChevronRightIcon } from "@/components/ui/icon"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, BodySmall, CaptionLarge } from "@/components/ui/typography"
import { getScenario, HistoryItem, usageHistoryScenarios } from "@/mock/usage-history"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function UsageHistoryPage() {
  const router = useRouter()

  // 개발용: 시나리오 변경 버튼을 위한 상태
  const [currentScenarioName, setCurrentScenarioName] = useState("with_current_service")
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null)
  const [showLoginSheet, setShowLoginSheet] = useState(false)
  const scenario = getScenario(currentScenarioName)

  const {
    userStatus,
    isLoading,
    hasCurrentService,
    hasHistory,
    currentService,
    yearlyStats,
    historyItems
  } = scenario

  const handleItemClick = (item: HistoryItem) => {
    if (item.detailed) {
      setSelectedItem(item)
    }
  }

  const handleCloseDetailView = () => {
    setSelectedItem(null)
  }

  const handleLoginClick = () => {
    setShowLoginSheet(false)
    router.push("/login")
  }

  const handleSignupClick = () => {
    setShowLoginSheet(false)
    router.push("/signup")
  }

  const handleShowLogin = () => {
    setShowLoginSheet(true)
  }

  const handleCloseLogin = () => {
    setShowLoginSheet(false)
  }

  // 영수증 상세 뷰
  if (selectedItem && selectedItem.detailed) {
    const detail = selectedItem.detailed
    return (
      <>
        <TopBanner
          title="이용내역"
          onBackClick={handleCloseDetailView}
        />

        <div className="flex flex-col items-center gap-5 px-0">
          {/* Date Header */}
          <div className="w-full  px-5">
            <div className="flex items-center">
              <BodyMedium color="#333333">{selectedItem.date}</BodyMedium>
            </div>
          </div>

          {/* Receipt Card */}
          <div className="w-full  bg-white rounded-[15px] shadow-[0px_5px_30px_0px_rgba(0,0,0,0.1)] px-0 py-[30px]">
            <div className="flex flex-col">
              {/* Receipt Header */}
              <div className="flex flex-col items-center gap-2 px-[30px] pb-[20px]">
                <div className="text-2xl">🧾</div>
                <BodyMedium color="#333333">영수증</BodyMedium>
                <BodyMedium color="#E67E22" className="text-xl font-bold">
                  {detail.total.toLocaleString()}원
                </BodyMedium>
              </div>

              {/* Orange Divider */}
              <div className="w-full h-[2px] bg-[#E67E22] mb-[20px]" />

              {/* Order Details */}
              <div className="px-[30px] space-y-4">
                {/* Order Info */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <CaptionLarge color="#767676">주문번호</CaptionLarge>
                    <CaptionLarge color="#333333">{detail.order_number}</CaptionLarge>
                  </div>
                  <div className="flex justify-between">
                    <CaptionLarge color="#767676">주문시간</CaptionLarge>
                    <CaptionLarge color="#333333">{detail.time}</CaptionLarge>
                  </div>
                </div>

                {/* Order Type */}
                <div className="bg-[#FFF9F0] rounded-[10px] p-3">
                  <CaptionLarge color="#E67E22" className="font-bold">{detail.order_type}</CaptionLarge>
                </div>

                {/* Order Items */}
                <div className="space-y-2">
                  {detail.order_items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <CaptionLarge color="#333333">{item.name} × {item.quantity}</CaptionLarge>
                      <CaptionLarge color="#333333">{item.price.toLocaleString()}원</CaptionLarge>
                    </div>
                  ))}
                </div>

                {/* White Divider */}
                <div className="w-full h-[1px] bg-[#F0F0F0]" />

                {/* Additional Info */}
                <div className="bg-[#F8F8F8] rounded-[10px] p-3">
                  <CaptionLarge color="#767676" className="font-bold mb-2">기타 정보</CaptionLarge>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <CaptionLarge color="#767676">할인</CaptionLarge>
                      <CaptionLarge color="#333333">{detail.discount} ({detail.coupon_name})</CaptionLarge>
                    </div>
                    <div className="flex justify-between">
                      <CaptionLarge color="#767676">부가세</CaptionLarge>
                      <CaptionLarge color="#333333">{detail.tax}</CaptionLarge>
                    </div>
                    <div className="flex justify-between">
                      <CaptionLarge color="#767676">결제수단</CaptionLarge>
                      <CaptionLarge color="#333333">{detail.payment_method}</CaptionLarge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Safe Area */}
        <div className="h-20" />
      </>
    )
  }

  // 로그인하지 않은 상태
  if (userStatus === "logged_out") {
    return (
      <>
        {/* Background */}
        <div className="min-h-screen bg-gradient-to-b from-orange-500 to-orange-400">
          {/* Logo Section */}
          <div className="flex justify-center pt-16 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 text-white text-2xl">📍</div>
              <span className="text-white text-sm font-medium">대구</span>
            </div>
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="text-white text-3xl font-bold">칼가는곳</div>
          </div>

          {/* Main Banner */}
          <div className="mx-5 mb-5 bg-white/10 backdrop-blur-sm rounded-[30px] p-5 h-[360px] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-[30px]" />
            <div className="relative z-10 flex flex-col justify-end h-full">
              <div className="mb-6">
                <h2 className="text-white text-2xl font-bold mb-2 leading-tight">
                  더이상 칼로<br />
                  으깨지 마세요.<br />
                  썰어야죠...
                </h2>
              </div>
              <button
                onClick={() => router.push("/knife-request")}
                className="bg-white text-orange-500 rounded-lg py-3 px-6 font-medium"
              >
                첫 칼갈이 신청하기
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mx-5 mb-5 flex gap-5">
            <button
              onClick={() => router.push("/price-list")}
              className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between"
            >
              <span className="text-white font-medium">가격표</span>
              <span className="text-white text-xl">💰</span>
            </button>
            <button
              onClick={() => router.push("/guide")}
              className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between"
            >
              <span className="text-white font-medium">가이드</span>
              <span className="text-white text-xl">ℹ️</span>
            </button>
          </div>

          {/* Promotional Cards */}
          <div className="mx-5 space-y-4 mb-20">
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-[30px] p-6 text-white">
              <div className="text-xs mb-2 opacity-90">신규고객 전용 1+1 이벤트</div>
              <div className="flex items-center gap-2 text-2xl font-bold">
                <span>하나갈면</span>
                <span className="text-sm">+</span>
                <span className="text-yellow-300">하나무료</span>
              </div>
            </div>
            <div className="bg-orange-100 rounded-[30px] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-orange-600 text-2xl font-bold mb-1">
                    이제 칼갈이도<br />구독으로!
                  </div>
                </div>
                <div className="text-4xl">🔪</div>
              </div>
            </div>
          </div>

          {/* Fixed Login Button */}
          <div className="fixed bottom-5 left-5 right-5">
            <button
              onClick={handleShowLogin}
              className="w-full bg-white text-orange-500 rounded-[30px] py-4 font-bold text-lg shadow-lg"
            >
              로그인하고 이용내역 보기
            </button>
          </div>
        </div>

        {/* Login Bottom Sheet */}
        <BottomSheet
          isOpen={showLoginSheet}
          onClose={handleCloseLogin}
          className="max-h-[400px]"
        >
          <div className="flex flex-col gap-6 p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🛡️</span>
              </div>
              <h3 className="text-xl font-bold mb-2">로그인이 필요해요</h3>
              <p className="text-gray-600 text-sm">
                간편하게 로그인하고<br />
                칼가는곳의 다양한 서비스를 이용해보세요!
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleLoginClick}
                className="w-full bg-orange-500 text-white rounded-lg py-4 font-medium"
              >
                로그인 · 회원가입
              </button>
              <button
                onClick={handleCloseLogin}
                className="w-full bg-gray-100 text-gray-600 rounded-lg py-4 font-medium"
              >
                나중에 가입
              </button>
            </div>
          </div>
        </BottomSheet>
      </>
    )
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <>
        <TopBanner
          title="이용내역"
          onBackClick={() => router.back()}
        />
        <div className="flex flex-col items-center justify-center h-96">
          <div className="w-12 h-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500 mb-4"></div>
          <BodyMedium color="#767676">로딩 중...</BodyMedium>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Development: Scenario Selector */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-100 p-2 text-xs">
        <select
          value={currentScenarioName}
          onChange={(e) => setCurrentScenarioName(e.target.value)}
          className="w-full p-1 text-xs border rounded"
        >
          {Object.keys(usageHistoryScenarios).map(key => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      </div>

      {/* Top Banner */}
      <TopBanner
        title="이용내역"
        onBackClick={() => router.back()}
      />

      <div className="flex flex-col items-center gap-5 px-0 pt-16">
        {/* Current Service Section */}
        {hasCurrentService && currentService && (
          <div className="w-full  px-5">
            <div className="flex justify-between items-center gap-5 mb-5">
              <BodyMedium color="#333333">현재 진행 중인 서비스</BodyMedium>
            </div>
            <div className="bg-white rounded-[30px] shadow-[0px_6px_12px_-6px_rgba(24,39,75,0.12),_0px_8px_24px_-4px_rgba(24,39,75,0.08)] p-5 flex items-center gap-4">
              <div className="text-2xl">{currentService.icon}</div>
              <div className="flex-1">
                <BodyMedium color="#333333" className="mb-1">{currentService.title}</BodyMedium>
                <BodySmall color="#767676">{currentService.description}</BodySmall>
              </div>
              <div className="bg-[#E67E22] text-white text-xs px-3 py-1 rounded-full">
                {currentService.status}
              </div>
            </div>
          </div>
        )}

        {/* No Current Service */}
        {!hasCurrentService && (
          <div className="w-full  px-5">
            <div className="flex justify-between items-center gap-5 mb-5">
              <BodyMedium color="#333333">현재 진행 중인 서비스</BodyMedium>
            </div>
            <div className="bg-gray-50 rounded-[30px] p-5 text-center">
              <BodySmall color="#767676">진행 중인 서비스가 없습니다</BodySmall>
            </div>
          </div>
        )}

        {/* Year Selection & Stats */}
        <div className="w-full  px-5 space-y-5">
          {/* Year Selector */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BodyMedium color="#333333">{yearlyStats.year}</BodyMedium>
              <ChevronDownIcon size={20} className="text-[#767676]" />
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-between items-center">
            <div>
              <BodySmall color="#767676">올해 연마 횟수</BodySmall>
              <BodyMedium color="#333333">{yearlyStats.sharpening_count}</BodyMedium>
            </div>
            <div className="text-right">
              <BodySmall color="#767676">총 이용 금액</BodySmall>
              <BodyMedium color="#E67E22">{yearlyStats.total_amount}</BodyMedium>
            </div>
          </div>
        </div>

        {/* History Items or Empty State */}
        {hasHistory ? (
          <div className="w-full  px-5 space-y-5">
            {historyItems.map((item, index) => (
              <div key={index} className="space-y-3">
                {/* Date Header */}
                <div className="flex items-center">
                  <BodyMedium color="#333333">{item.date}</BodyMedium>
                </div>

                {/* History Item */}
                <div
                  className={`bg-white rounded-[15px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] p-4 flex items-center gap-4 ${
                    item.detailed ? 'cursor-pointer hover:bg-gray-50' : ''
                  }`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="text-xl">🔪</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <BodyMedium color="#333333">{item.amount}</BodyMedium>
                      {item.detailed && <ChevronRightIcon size={20} className="text-[#767676]" />}
                    </div>
                    <BodySmall color="#767676">{item.items}</BodySmall>
                  </div>
                </div>

                {/* Separator */}
                {index < historyItems.length - 1 && (
                  <div className="w-full h-px bg-[#F0F0F0]" />
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Empty History State */
          <div className="w-full  px-5">
            <div className="flex flex-col items-center gap-4 py-20">
              <BodyMedium color="#333333">이용 내역이 없습니다</BodyMedium>
              <button
                onClick={() => router.push("/knife-request")}
                className="bg-[#E67E22] text-white px-6 py-3 rounded-lg font-medium"
              >
                첫 칼갈이 신청하기
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Safe Area */}
      <div className="h-20" />
    </>
  )
}
