"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import TopBanner from "@/components/ui/top-banner"
import BottomSheet from "@/components/ui/bottom-sheet"
import { Button } from "@/components/ui/button"
import { BodyMedium, BodySmall, CaptionMedium, Heading3 } from "@/components/ui/typography"
import { useAuthHydration } from "@/hooks/use-auth-hydration"

interface MemberInfo {
  name: string
  phone: string
}

export default function MemberInfoPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthHydration()
  const [dataLoading, setDataLoading] = useState(true)
  const [isWithdrawBottomSheetOpen, setIsWithdrawBottomSheetOpen] = useState(false)

  // 회원 정보 상태
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null)

  // 사용자 프로필 정보 로드
  useEffect(() => {
    if (user && !authLoading && user.type === 'client') {
      // API를 통해 프로필 조회
      fetch('/api/user/profile', {
        method: 'GET',
        credentials: 'include'
      })
        .then(res => res.json())
        .then(response => {
          if (response.success && response.data) {
            setMemberInfo({
              name: response.data.name || '',
              phone: response.data.phone || ''
            })
          } else {
            console.error('프로필 조회 실패:', response.error)
          }
        })
        .catch(error => {
          console.error('프로필 조회 오류:', error)
        })
        .finally(() => {
          setDataLoading(false)
        })
    } else if (!authLoading && !user) {
      // 로그인하지 않은 경우 홈으로 리다이렉트
      router.push('/')
    }
  }, [user, authLoading, router])

  const handleWithdrawClick = () => {
    setIsWithdrawBottomSheetOpen(true)
  }

  const handleWithdrawConfirm = () => {
    // 회원탈퇴 로직
    alert("회원탈퇴가 처리되었습니다.")
    setIsWithdrawBottomSheetOpen(false)
    router.push("/")
  }

  const handleWithdrawCancel = () => {
    setIsWithdrawBottomSheetOpen(false)
  }

  // 로딩 중이거나 사용자 정보가 없는 경우
  if (authLoading || dataLoading || !memberInfo) {
    return (
      <>
        <TopBanner
          title="회원 정보"
          onBackClick={() => router.back()}
        />
        <div className="flex-1 flex items-center justify-center px-5 py-20 bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-400 rounded-full animate-spin mb-4"></div>
            <BodyMedium color="#666666">회원 정보를 불러오는 중...</BodyMedium>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBanner
        title="회원 정보"
        onBackClick={() => router.back()}
      />

      <div className="flex-1 px-5 py-6 bg-gray-50">
        <div className="space-y-6">
          {/* 이름 (읽기 전용) */}
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              이름
            </Label>
            <div className="w-full h-14 px-4 border border-gray-300 rounded-xl bg-gray-100 flex items-center">
              <BodyMedium color="#333333" className="text-lg">
                {memberInfo.name}
              </BodyMedium>
            </div>
          </div>

          {/* 휴대폰 번호 (읽기 전용) */}
          <div className="space-y-3">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              휴대폰 번호
            </Label>
            <div className="w-full h-14 px-4 border border-gray-300 rounded-xl bg-gray-100 flex items-center">
              <BodyMedium color="#333333" className="text-lg">
                {memberInfo.phone}
              </BodyMedium>
            </div>
          </div>

          {/* 회원탈퇴 버튼 */}
          <div className="pt-12 border-t border-gray-200">
            <button
              onClick={handleWithdrawClick}
              className="w-full py-4 text-center"
            >
              <BodySmall color="#999999" className="underline">
                회원탈퇴
              </BodySmall>
            </button>
          </div>

          {/* 안내 텍스트 */}
          <div className="bg-blue-50 rounded-xl p-4">
            <CaptionMedium color="#4A90E2" className="text-center">
              정보 수정 후에는 다시 인증이 필요할 수 있습니다.
            </CaptionMedium>
          </div>
        </div>

        {/* Spacer for bottom navigation */}
        <div className="h-20" />
      </div>

      {/* 회원탈퇴 확인 바텀시트 */}
      <BottomSheet
        isOpen={isWithdrawBottomSheetOpen}
        onClose={handleWithdrawCancel}
      >
        <div className="p-6 space-y-6">
          <div className="text-center space-y-3">
            <div className="text-5xl">⚠️</div>
            <Heading3 color="#333333" className="font-bold">
              정말로 탈퇴하시겠습니까?
            </Heading3>
            <BodyMedium color="#666666">
              탈퇴 시 모든 정보가 삭제되며,<br />
              복구할 수 없습니다.
            </BodyMedium>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleWithdrawConfirm}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl"
            >
              탈퇴하기
            </Button>
            <Button
              onClick={handleWithdrawCancel}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 font-bold py-3 rounded-xl"
            >
              취소
            </Button>
          </div>
        </div>
      </BottomSheet>
    </>
  )
}