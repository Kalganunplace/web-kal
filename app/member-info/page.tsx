"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, BodySmall, CaptionMedium } from "@/components/ui/typography"

export default function MemberInfoPage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // 회원 정보 상태
  const [memberInfo, setMemberInfo] = useState({
    name: "칼가는곳",
    phone: "01000000000"
  })

  // 수정 중인 정보 상태
  const [editInfo, setEditInfo] = useState({
    name: memberInfo.name,
    phone: memberInfo.phone
  })

  const handleSave = async () => {
    setLoading(true)
    
    try {
      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 정보 업데이트
      setMemberInfo(editInfo)
      setIsEditing(false)
    } catch (error) {
      console.error("정보 수정 중 오류 발생:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditInfo({
      name: memberInfo.name,
      phone: memberInfo.phone
    })
    setIsEditing(false)
  }

  const handleWithdraw = () => {
    if (confirm("정말로 회원탈퇴를 하시겠습니까?")) {
      // 회원탈퇴 로직
      alert("회원탈퇴가 처리되었습니다.")
      router.push("/")
    }
  }

  return (
    <>
      <TopBanner
        title="회원 정보"
        onBackClick={() => router.back()}
      />

      <div className="flex-1 px-5 py-6 bg-gray-50">
        <div className="space-y-6">
          {/* 이름 입력 */}
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              이름
            </Label>
            {isEditing ? (
              <Input
                id="name"
                type="text"
                value={editInfo.name}
                onChange={(e) => setEditInfo({...editInfo, name: e.target.value})}
                className="w-full h-14 px-4 border border-gray-300 rounded-xl bg-white text-lg"
                placeholder="이름을 입력하세요"
              />
            ) : (
              <div className="w-full h-14 px-4 border border-gray-300 rounded-xl bg-gray-100 flex items-center">
                <BodyMedium color="#333333" className="text-lg">
                  {memberInfo.name}
                </BodyMedium>
              </div>
            )}
          </div>

          {/* 휴대폰 번호 입력 */}
          <div className="space-y-3">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              휴대폰 번호
            </Label>
            {isEditing ? (
              <Input
                id="phone"
                type="tel"
                value={editInfo.phone}
                onChange={(e) => setEditInfo({...editInfo, phone: e.target.value})}
                className="w-full h-14 px-4 border border-gray-300 rounded-xl bg-white text-lg"
                placeholder="휴대폰 번호를 입력하세요"
                maxLength={11}
              />
            ) : (
              <div className="w-full h-14 px-4 border border-gray-300 rounded-xl bg-gray-100 flex items-center">
                <BodyMedium color="#333333" className="text-lg">
                  {memberInfo.phone}
                </BodyMedium>
              </div>
            )}
          </div>

          {/* 버튼 영역 */}
          <div className="pt-8 space-y-4">
            {!isEditing ? (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full h-14 bg-[#E67E22] hover:bg-[#D35400] text-white font-bold rounded-xl text-lg"
                >
                  정보 수정하기
                </Button>
                
                <Button
                  onClick={() => router.push("/address-settings")}
                  variant="outline"
                  className="w-full h-14 border-gray-300 text-gray-700 font-medium rounded-xl text-lg hover:bg-gray-50"
                >
                  주소 설정
                </Button>
              </>
            ) : (
              <div className="flex gap-3">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 h-14 border-gray-300 text-gray-700 font-medium rounded-xl text-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  취소
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 h-14 bg-[#E67E22] hover:bg-[#D35400] text-white font-bold rounded-xl text-lg disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "저장 중..." : "저장"}
                </Button>
              </div>
            )}
          </div>

          {/* 회원탈퇴 버튼 */}
          <div className="pt-12 border-t border-gray-200">
            <button
              onClick={handleWithdraw}
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
    </>
  )
}