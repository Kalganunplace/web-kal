"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, CameraIcon, LocationIcon, PlusIcon } from "@/components/ui/icon"
import { Switch } from "@/components/ui/switch"
import { BodyLarge, BodyMedium, BodySmall, CaptionMedium, Heading1, Heading2 } from "@/components/ui/typography"
import { AuthAware, AuthenticatedOnly } from "@/components/auth/auth-aware"
import { useAuthAware } from "@/hooks/use-auth-aware"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function KnifeRequestPage() {
  const router = useRouter()
  const { user, isAuthenticated, executeWithAuth } = useAuthAware()
  const [isPickupService, setIsPickupService] = useState(false)

  return (
    <>
      {/* System Title */}
      <div className="flex flex-col gap-2 px-4 py-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-6 h-6"
          >
            <ArrowLeftIcon size={24} color="#FFFFFF" />
          </button>
          <Heading1 className="text-5xl text-white leading-none">칼갈이 신청</Heading1>
        </div>
        <div className="w-full h-0 border-t-2 border-white" />
      </div>

      {/* Main Content */}
      <div className="flex-1 px-5 space-y-6">
        {/* Information Banner */}
        <div className="w-full h-[200px] bg-gray-100 rounded-3xl flex flex-col items-center justify-center p-4">
          <Image
            src="/images/knife-request-flow.png"
            alt="칼갈이 신청 안내"
            width={280}
            height={160}
            className="object-contain"
          />
        </div>

        {/* Service Type Selection */}
        <div className="space-y-4">
          <Heading2 color="#333333">서비스 선택</Heading2>

          {/* Pickup Service Toggle */}
          <div className="w-full h-16 bg-[#F2F2F2] rounded-xl flex justify-between items-center px-5">
            <div className="flex flex-col">
              <BodyMedium color="#333333">방문 수거 서비스</BodyMedium>
              <CaptionMedium color="#767676">직접 수거하러 갑니다</CaptionMedium>
            </div>
            <Switch
              checked={isPickupService}
              onCheckedChange={setIsPickupService}
            />
          </div>

          {/* Address Input - Show when pickup service is enabled */}
          {isPickupService && (
            <div className="w-full min-h-[60px] bg-[#F2F2F2] rounded-xl flex items-center px-5 gap-3">
              <LocationIcon size={24} color="#E67E22" />
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="수거 주소를 입력해주세요"
                  className="w-full bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Knife Selection */}
        <div className="space-y-4">
          <Heading2 color="#333333">칼 선택</Heading2>

          {/* Knife List */}
          <div className="space-y-3">
            {/* Knife Item 1 */}
            <div className="w-full h-20 bg-[#F2F2F2] rounded-xl flex items-center justify-between px-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                  <CameraIcon size={24} color="#767676" />
                </div>
                <div>
                  <BodyMedium color="#333333">식도 (일반)</BodyMedium>
                  <CaptionMedium color="#767676">20cm</CaptionMedium>
                </div>
              </div>
              <div className="text-right">
                <BodySmall color="#E67E22" className="font-bold">3,000원</BodySmall>
                <CaptionMedium color="#999999" className="line-through">5,000원</CaptionMedium>
              </div>
            </div>

            {/* Add Knife Button */}
            <button className="w-full h-16 border-2 border-dashed border-[#D9D9D9] rounded-xl flex items-center justify-center gap-2 hover:border-[#E67E22] transition-colors">
              <PlusIcon size={24} color="#D9D9D9" />
              <BodyMedium color="#D9D9D9">칼 추가하기</BodyMedium>
            </button>
          </div>
        </div>

        {/* Special Instructions */}
        <div className="space-y-4">
          <Heading2 color="#333333">특별 요청사항</Heading2>

          <div className="w-full min-h-[100px] bg-[#F2F2F2] rounded-xl p-4">
            <textarea
              placeholder="특별한 요청사항이 있으시면 작성해주세요"
              className="w-full h-full bg-transparent border-none outline-none resize-none text-sm text-gray-700 placeholder-gray-500"
              rows={4}
            />
          </div>
        </div>

        {/* Cost Summary */}
        <div className="space-y-4">
          <Heading2 color="#333333">비용 안내</Heading2>

          <div className="w-full bg-[#FFF9F0] rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <BodyMedium color="#333333">칼갈이 비용</BodyMedium>
              <BodyMedium color="#333333">3,000원</BodyMedium>
            </div>

            {isPickupService && (
              <div className="flex justify-between items-center">
                <BodyMedium color="#333333">방문 수거 비용</BodyMedium>
                <BodyMedium color="#333333">2,000원</BodyMedium>
              </div>
            )}

            <div className="w-full h-px bg-[#E0E0E0]" />

            <div className="flex justify-between items-center">
              <BodyLarge color="#333333" className="font-bold">총 비용</BodyLarge>
              <BodyLarge color="#E67E22" className="font-bold">
                {isPickupService ? "5,000원" : "3,000원"}
              </BodyLarge>
            </div>
          </div>
        </div>

        {/* Submit Button - 인증 상태에 따른 처리 */}
        <div className="pb-8">
          <Button
            variant="primary"
            size="lg"
            className="w-full h-14 bg-[#E67E22] hover:bg-[#D35400] text-white font-bold rounded-xl"
            onClick={() => {
              executeWithAuth(
                // 로그인된 사용자: 바로 신청 처리
                () => {
                  alert("칼갈이 신청이 완료되었습니다!")
                  router.push("/usage-history")
                },
                // 게스트 사용자: 로그인 후 결제 진행
                () => {
                  const shouldLogin = confirm(
                    "결제를 위해 로그인이 필요합니다. 로그인하시겠습니까?"
                  )
                  if (shouldLogin) {
                    router.push("/login?redirect=/knife-request")
                  }
                },
                "결제 진행을 위해 로그인이 필요합니다."
              )
            }}
          >
            <AuthAware fallback="로그인 후 신청하기">
              칼갈이 신청하기
            </AuthAware>
          </Button>
          
          {/* 게스트 사용자용 안내 */}
          <AuthenticatedOnly
            fallback={
              <div className="mt-3 text-center">
                <CaptionMedium color="#666666">
                  로그인하시면 더 편리하게 이용하실 수 있습니다
                </CaptionMedium>
              </div>
            }
          />
        </div>
      </div>
    </>
  )
}
