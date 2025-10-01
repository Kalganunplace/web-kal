"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CaptionMedium } from "@/components/ui/typography"
import { supabase } from "@/lib/auth/supabase"
import { useAuth } from "@/stores/auth-store"
import { useAuthHydration } from "@/hooks/use-auth-hydration"
import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type LoginStep = "phone" | "verification"

export default function LoginPage() {
  const router = useRouter()
  const { signInClient } = useAuth()
  const { isAuthenticated, isReady } = useAuthHydration()
  const [step, setStep] = useState<LoginStep>("phone")
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState("")
  const [timer, setTimer] = useState(180) // 3분
  const [canResend, setCanResend] = useState(false)
  const [devCode, setDevCode] = useState<string | null>(null) // 개발용 인증코드 표시
  
  // URL에서 redirect 파라미터 가져오기 (LoginPrompt와 일관성 유지)
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const returnUrl = searchParams?.get('redirect') || searchParams?.get('returnUrl') || '/'

  // 이미 로그인된 사용자는 리디렉션
  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace(returnUrl)
    }
  }, [isReady, isAuthenticated, returnUrl, router])

  // 타이머 관리
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (step === "verification" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [step, timer])

  const handleSendVerification = async () => {
    if (!phone.trim()) {
      setError("전화번호를 입력해주세요.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await supabase.sendVerificationCode(phone)

      if (response.success) {
        setStep("verification")
        setTimer(180)
        setCanResend(false)
        
        // 개발 환경에서는 DB에서 인증코드 가져와서 표시
        if (process.env.NODE_ENV === 'development') {
          try {
            const { data } = await fetch('/api/auth/dev-code', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone })
            }).then(res => res.json())
            
            if (data?.code) {
              setDevCode(data.code)
            }
          } catch (err) {
            console.log('개발용 인증코드 조회 실패')
          }
        }
      } else {
        setError(response.error || "인증번호 발송에 실패했습니다.")
      }
    } catch (err) {
      setError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndLogin = async () => {
    if (!verificationCode.trim()) {
      setError("인증번호를 입력해주세요.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await signInClient(phone, verificationCode)

      if (result.success) {
        router.push(returnUrl)
      } else {
        setError(result.error || "로그인에 실패했습니다.")
      }
    } catch (err) {
      setError("로그인 처리 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!canResend) return

    setLoading(true)
    setError("")

    try {
      const response = await supabase.sendVerificationCode(phone)

      if (response.success) {
        setTimer(180)
        setCanResend(false)
        setVerificationCode("")
      } else {
        setError(response.error || "인증번호 재발송에 실패했습니다.")
      }
    } catch (err) {
      setError("서버 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // 로딩 중이거나 이미 인증된 사용자는 로딩 표시
  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (step === "phone") {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-[500px] mx-auto bg-white min-h-screen flex flex-col">
          {/* Header */}
          <div className="flex items-center p-4 border-b">
            <button onClick={() => router.back()} className="p-2 -ml-2">
              <ChevronLeft size={24} />
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
                전화번호로 간편하게 로그인하세요
              </p>
            </div>

            <Card className="border-0 shadow-none">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">전화번호</label>
                  <Input
                    type="tel"
                    placeholder="010-1234-5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    className="text-lg h-12"
                  />
                </div>

                {error && (
                  <div className="text-red-500 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleSendVerification}
                  disabled={loading || !phone.trim()}
                  className="w-full h-12 text-lg bg-[#E67E22] hover:bg-[#D35400]"
                >
                  {loading ? "처리 중..." : "인증번호 발송"}
                </Button>
              </CardContent>
            </Card>

            {/* 게스트 이용 */}
            <div className="text-center pt-4">
              <button
                onClick={() => router.push("/")}
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                로그인 없이 둘러보기
              </button>
            </div>

            {/* 회원가입 링크 */}
            <div className="text-center">
              <span className="text-gray-600">계정이 없으신가요? </span>
              <button
                onClick={() => router.push("/signup")}
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                회원가입
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 인증번호 입력 단계
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-[500px] mx-auto bg-white min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center p-4 border-b">
          <button onClick={() => setStep("phone")} className="p-2 -ml-2">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold ml-2">인증번호 입력</h1>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center p-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-gray-900">
              인증번호를 입력해주세요
            </h2>
            <p className="text-gray-600">
              <span className="font-medium text-orange-500">{phone}</span>으로<br />
              발송된 인증번호를 입력해주세요
            </p>
          </div>

          <Card className="border-0 shadow-none">
            <CardContent className="p-6 space-y-4">
              {/* 개발 환경에서 인증코드 표시 */}
              {process.env.NODE_ENV === 'development' && devCode && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-600 text-sm font-semibold">🔧 개발 모드</span>
                  </div>
                  <div className="text-center">
                    <span className="text-gray-600 text-sm">인증번호: </span>
                    <span className="text-2xl font-bold text-yellow-600 tracking-widest">
                      {devCode}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setVerificationCode(devCode)
                    }}
                    className="w-full mt-2 text-sm text-yellow-700 hover:text-yellow-800 underline"
                  >
                    자동 입력
                  </button>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">인증번호</label>
                <Input
                  type="text"
                  placeholder="6자리 숫자 입력"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  disabled={loading}
                  className="text-lg h-12 text-center tracking-widest"
                  maxLength={6}
                />
              </div>

              {/* 타이머 및 재발송 */}
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600">
                  {timer > 0 ? (
                    <span>남은 시간: <span className="text-orange-500 font-medium">{formatTime(timer)}</span></span>
                  ) : (
                    <span className="text-red-500">인증시간이 만료되었습니다</span>
                  )}
                </div>
                <button
                  onClick={handleResendCode}
                  disabled={!canResend || loading}
                  className={`font-medium ${
                    canResend && !loading
                      ? "text-orange-500 hover:text-orange-600"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  재발송
                </button>
              </div>

              {error && (
                <div className="text-red-500 text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={handleVerifyAndLogin}
                disabled={loading || !verificationCode.trim() || verificationCode.length !== 6}
                className="w-full h-12 text-lg bg-[#E67E22] hover:bg-[#D35400]"
              >
                {loading ? "처리 중..." : "로그인"}
              </Button>

              {/* 전화번호 변경 */}
              <div className="text-center">
                <CaptionMedium color="#666666">전화번호가 틀렸나요?</CaptionMedium>
                <button
                  onClick={() => {
                    setStep("phone")
                    setError("")
                    setVerificationCode("")
                    setTimer(180)
                    setCanResend(false)
                  }}
                  className="text-orange-500 hover:text-orange-600 font-medium ml-2"
                >
                  번호 변경
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
