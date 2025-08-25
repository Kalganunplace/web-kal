"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TextButton } from "@/components/ui/text-button"
import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSocialLogin = async (provider: "kakao" | "naver") => {
    setIsLoading(true)

    // 소셜 로그인 로직 시뮬레이션
    setTimeout(() => {
      alert(`${provider === "kakao" ? "카카오" : "네이버"} 로그인 처리 중...`)
      setIsLoading(false)
      router.push("/")
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-[500px] mx-auto bg-white min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center p-4 border-b">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold ml-2">로그인</h1>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center p-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              칼가는곳에 오신 것을
            </h2>
            <h2 className="text-2xl font-bold text-gray-900">
              환영합니다! 🔪
            </h2>
            <p className="text-gray-600 mt-4">
              전문 장인이 직접 연마하는 칼갈이 서비스
            </p>
          </div>

          <Card className="border-0 shadow-none">
            <CardContent className="p-6 space-y-4">
              {/* 소셜 로그인 버튼들 */}
              <Button
                variant="kakao"
                size="lg"
                onClick={() => handleSocialLogin("kakao")}
                disabled={isLoading}
                className="w-full"
              >
                카카오 로그인
              </Button>

              <Button
                variant="naver"
                size="lg"
                onClick={() => handleSocialLogin("naver")}
                disabled={isLoading}
                className="w-full"
              >
                네이버 로그인
              </Button>

              <div className="flex items-center my-6">
                <Separator className="flex-1" />
                <span className="px-3 text-sm text-gray-500">또는</span>
                <Separator className="flex-1" />
              </div>

              {/* 기타 로그인 옵션 */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => alert("이메일 로그인 기능 준비 중")}
                  className="w-full"
                >
                  이메일로 로그인
                </Button>

                <Button
                  variant="white"
                  size="lg"
                  onClick={() => alert("전화번호 로그인 기능 준비 중")}
                  className="w-full"
                >
                  전화번호로 로그인
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 하단 링크들 */}
          <div className="flex justify-center space-x-4 text-center">
            <TextButton
              size="14"
              weight="regular"
              onClick={() => alert("회원가입 페이지로 이동")}
              className="text-gray-600 hover:text-orange-500"
            >
              회원가입
            </TextButton>
            <span className="text-gray-300">|</span>
            <TextButton
              size="14"
              weight="regular"
              onClick={() => alert("비밀번호 찾기 페이지로 이동")}
              className="text-gray-600 hover:text-orange-500"
            >
              비밀번호 찾기
            </TextButton>
          </div>

          {/* 게스트 이용 */}
          <div className="text-center pt-4">
            <TextButton
              size="16"
              weight="bold"
              onClick={() => router.push("/")}
              className="text-orange-500 hover:text-orange-600"
            >
              로그인 없이 둘러보기
            </TextButton>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center">
          <p className="text-xs text-gray-500">
            로그인하시면 <TextButton size="12" weight="bold" className="text-gray-700 hover:text-orange-500">이용약관</TextButton> 및{" "}
            <TextButton size="12" weight="bold" className="text-gray-700 hover:text-orange-500">개인정보처리방침</TextButton>에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}
