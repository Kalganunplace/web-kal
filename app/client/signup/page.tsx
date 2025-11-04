"use client"

import BottomSheet from "@/components/ui/bottom-sheet"
import { ChevronRightIcon } from "@/components/ui/icon"
import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, BodySmall, CaptionLarge } from "@/components/ui/typography"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { supabase } from "@/lib/auth/supabase"
import { useAuth } from "@/stores/auth-store"

type Step = "form" | "verification" | "terms"
type FormField = "name" | "phone" | "verification"
type ValidationState = "valid" | "invalid" | "none"

interface FormData {
  name: string
  phone: string
  verification: string
}

interface FormErrors {
  name: string
  phone: string
  verification: string
}

interface TermsState {
  all: boolean
  service: boolean
  privacy: boolean
  location: boolean
  identity: boolean
  marketing: boolean
  ads: boolean
}

export default function SignupPage() {
  const router = useRouter()
  const { signUpClient } = useAuth()

  const [step, setStep] = useState<Step>("form")
  const [focusedField, setFocusedField] = useState<FormField | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    verification: ""
  })
  const [errors, setErrors] = useState<FormErrors>({
    name: "",
    phone: "",
    verification: ""
  })
  const [validation, setValidation] = useState<Record<FormField, ValidationState>>({
    name: "none",
    phone: "none",
    verification: "none"
  })
  const [showTerms, setShowTerms] = useState(false)
  const [terms, setTerms] = useState<TermsState>({
    all: false,
    service: false,
    privacy: false,
    location: false,
    identity: false,
    marketing: false,
    ads: false
  })
  const [verificationTimer, setVerificationTimer] = useState(180) // 3분
  const [canResendVerification, setCanResendVerification] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)

  // 입력 값 변경 핸들러
  const handleInputChange = (field: FormField, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // 실시간 유효성 검사
    if (field === "name" && value.length > 0) {
      const isValid = /^[가-힣]{2,}$/.test(value.replace(/\s/g, ""))
      setValidation(prev => ({ ...prev, name: isValid ? "valid" : "invalid" }))
      setErrors(prev => ({
        ...prev,
        name: isValid ? "" : "이름은 한글 2자 이상, 띄어쓰기 없이 입력해 주세요"
      }))
    }

    if (field === "phone" && value.length > 0) {
      const isValid = /^010\d{8}$/.test(value)
      setValidation(prev => ({ ...prev, phone: isValid ? "valid" : "invalid" }))
      setErrors(prev => ({
        ...prev,
        phone: isValid ? "" : "올바른 형식의 휴대폰 번호가 아닙니다"
      }))
    }

    if (field === "verification" && value.length > 0) {
      const isValid = /^\d{6}$/.test(value)
      setValidation(prev => ({ ...prev, verification: isValid ? "valid" : "invalid" }))
      setErrors(prev => ({
        ...prev,
        verification: isValid ? "" : "잘못된 인증번호입니다. 다시 입력해 주세요"
      }))
    }
  }

  // 포커스 핸들러
  const handleFocus = (field: FormField) => {
    setFocusedField(field)
  }

  const handleBlur = () => {
    setFocusedField(null)
  }

  // 인증번호 전송
  const handleSendVerification = async () => {
    if (validation.name === "valid" && validation.phone === "valid") {
      setLoading(true)

      try {
        const cleanPhone = formData.phone.replace(/-/g, '')

        // 먼저 기존 사용자 체크
        const checkResponse = await fetch('/api/auth/check-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone })
        })

        const checkData = await checkResponse.json()

        if (checkData.exists) {
          setErrors(prev => ({ ...prev, phone: "이미 가입된 전화번호입니다. 로그인 페이지로 이동해주세요." }))
          setValidation(prev => ({ ...prev, phone: "invalid" }))
          setLoading(false)
          return
        }

        // 인증번호 발송
        const response = await supabase.sendVerificationCode(cleanPhone)

        if (response.success) {
          setStep("verification")
          setVerificationTimer(180)
          setCanResendVerification(false)
          setVerificationSent(true)

          // 타이머 시작
          const timer = setInterval(() => {
            setVerificationTimer(prev => {
              if (prev <= 1) {
                clearInterval(timer)
                setCanResendVerification(true)
                return 0
              }
              return prev - 1
            })
          }, 1000)
        } else {
          setErrors(prev => ({ ...prev, phone: response.error || "인증번호 전송에 실패했습니다." }))
          setValidation(prev => ({ ...prev, phone: "invalid" }))
        }
      } catch (error) {
        setErrors(prev => ({ ...prev, phone: "네트워크 오류가 발생했습니다." }))
        setValidation(prev => ({ ...prev, phone: "invalid" }))
      } finally {
        setLoading(false)
      }
    }
  }

  // 약관 동의 토글
  const handleTermsToggle = (termType: keyof TermsState) => {
    if (termType === "all") {
      const newValue = !terms.all
      setTerms({
        all: newValue,
        service: newValue,
        privacy: newValue,
        location: newValue,
        identity: newValue,
        marketing: newValue,
        ads: newValue
      })
    } else {
      const newTerms = { ...terms, [termType]: !terms[termType] }
      const allRequired = newTerms.service && newTerms.privacy && newTerms.location && newTerms.identity
      const allOptional = newTerms.marketing && newTerms.ads
      newTerms.all = allRequired && allOptional
      setTerms(newTerms)
    }
  }

  // 시작하기 버튼
  const handleStart = () => {
    if (validation.verification === "valid") {
      setShowTerms(true)
    }
  }

  // 바텀시트 닫기
  const handleCloseTerms = () => {
    setShowTerms(false)
  }

  // 회원가입 완료
  const handleSignupComplete = async () => {
    const requiredTerms = terms.service && terms.privacy && terms.location && terms.identity
    if (requiredTerms && validation.verification === "valid") {
      setLoading(true)
      
      try {
        const cleanPhone = formData.phone.replace(/-/g, '')
        const result = await signUpClient(cleanPhone, formData.name, formData.verification)
        
        if (result.success) {
          setShowTerms(false)
          router.push("/") // 홈으로 이동
        } else {
          setErrors(prev => ({ ...prev, verification: result.error || "회원가입에 실패했습니다." }))
          setValidation(prev => ({ ...prev, verification: "invalid" }))
        }
      } catch (error) {
        setErrors(prev => ({ ...prev, verification: "회원가입 처리 중 오류가 발생했습니다." }))
        setValidation(prev => ({ ...prev, verification: "invalid" }))
      } finally {
        setLoading(false)
      }
    }
  }

  // 버튼 활성화 상태
  const isVerificationButtonEnabled = validation.name === "valid" && validation.phone === "valid"
  const isStartButtonEnabled = validation.verification === "valid"
  const isConfirmButtonEnabled = terms.service && terms.privacy && terms.location && terms.identity

  // 타이머 형식 변환
  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col min-h-screen bg-white relative">
      {/* TopBanner */}
      <TopBanner title="회원가입" onBackClick={() => router.push('/client/login')} />

      {/* Form Content */}
      <div className="flex flex-col gap-5 px-5 py-5 flex-1">
        {/* 이름 입력 */}
        <div className="flex flex-col gap-2">
          <BodyMedium color="#333333">이름을 입력해 주세요</BodyMedium>
          <div className="relative">
            <input
              type="text"
              placeholder="휴대폰 번호에 등록된 이름을 입력해 주세요"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              onFocus={() => handleFocus("name")}
              onBlur={handleBlur}
              className={`w-full h-12 px-5 rounded-[10px] border-2 outline-none text-sm font-bold text-[#333333] placeholder:text-[#B0B0B0] ${
                focusedField === "name" ? "border-[#E67E22] bg-white" :
                validation.name === "invalid" ? "border-[#FF4500] bg-white" :
                "border-[#D9D9D9] bg-white"
              }`}
            />
            {validation.name === "invalid" && (
              <div className="mt-1">
                <CaptionLarge color="#FF4500">{errors.name}</CaptionLarge>
              </div>
            )}
          </div>
        </div>

        {/* 휴대폰 번호 입력 */}
        <div className="flex flex-col gap-2">
          <BodyMedium color="#333333">휴대폰 번호를 입력해 주세요</BodyMedium>
          <div className="relative">
            <input
              type="tel"
              placeholder="휴대폰 번호(- 없이 숫자만 입력)"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              onFocus={() => handleFocus("phone")}
              onBlur={handleBlur}
              className={`w-full h-12 px-5 rounded-[10px] border-2 outline-none text-sm font-bold text-[#333333] placeholder:text-[#B0B0B0] ${
                focusedField === "phone" ? "border-[#E67E22] bg-white" :
                validation.phone === "invalid" ? "border-[#FF4500] bg-white" :
                "border-[#D9D9D9] bg-white"
              }`}
            />
            {validation.phone === "invalid" && (
              <div className="mt-1">
                <CaptionLarge color="#FF4500">{errors.phone}</CaptionLarge>
              </div>
            )}
          </div>
        </div>

        {/* 인증번호 입력 (verification 단계에서만 표시) */}
        {step === "verification" && (
          <div className="flex flex-col gap-2">
            <BodyMedium color="#333333">인증번호를 입력해 주세요</BodyMedium>
            <div className="relative">
              <input
                type="text"
                placeholder="인증번호 6자리"
                value={formData.verification}
                onChange={(e) => handleInputChange("verification", e.target.value)}
                onFocus={() => handleFocus("verification")}
                onBlur={handleBlur}
                maxLength={6}
                className={`w-full h-12 px-5 rounded-[10px] border-2 outline-none text-sm font-bold text-[#333333] placeholder:text-[#B0B0B0] ${
                  focusedField === "verification" ? "border-[#E67E22] bg-white" :
                  validation.verification === "invalid" ? "border-[#FF4500] bg-white" :
                  "border-[#D9D9D9] bg-white"
                }`}
              />
              {validation.verification === "invalid" && (
                <div className="mt-1">
                  <CaptionLarge color="#FF4500">{errors.verification}</CaptionLarge>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Buttons */}
      <div className="flex flex-col gap-3 px-5 pb-8">
        {step === "form" && (
          <button
            onClick={handleSendVerification}
            disabled={!isVerificationButtonEnabled || loading}
            className={`w-full h-14 rounded-lg font-bold text-lg ${
              isVerificationButtonEnabled && !loading
                ? "bg-[#E67E22] text-white shadow-[0px_5px_30px_0px_rgba(0,0,0,0.1)]"
                : "bg-[#B0B0B0] text-white"
            }`}
          >
            {loading ? "인증번호 발송 중..." : "인증번호 받기"}
          </button>
        )}

        {step === "verification" && (
          <>
            {canResendVerification ? (
              <button
                onClick={handleSendVerification}
                className="w-full h-14 rounded-lg bg-[#F2F2F2] text-[#E67E22] font-bold text-lg shadow-[0px_5px_30px_0px_rgba(0,0,0,0.1)]"
              >
                인증번호 재전송
              </button>
            ) : (
              <button
                disabled
                className="w-full h-14 rounded-lg bg-[#B0B0B0] text-white font-bold text-lg"
              >
                {formatTimer(verificationTimer)} 후 인증번호 재전송
              </button>
            )}

            <button
              onClick={handleStart}
              disabled={!isStartButtonEnabled}
              className={`w-full h-14 rounded-lg font-bold text-lg ${
                isStartButtonEnabled
                  ? "bg-[#E67E22] text-white shadow-[0px_5px_30px_0px_rgba(0,0,0,0.1)]"
                  : "bg-[#B0B0B0] text-white"
              }`}
            >
              시작하기
            </button>
          </>
        )}
      </div>

      {/* Terms Bottom Sheet */}
      <BottomSheet
        isOpen={showTerms}
        onClose={handleCloseTerms}
        className="max-h-[512px]"
      >
        <div className="flex flex-col gap-5 p-6">
          {/* Header */}
          <div className="flex flex-col gap-5">
            <BodyMedium color="#333333">서비스 약관 동의하기</BodyMedium>

            {/* 모두 동의 */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTermsToggle("all")}
                  className={`w-9 h-9 rounded-[3.375px] border-2 flex items-center justify-center ${
                    terms.all ? "border-[#E67E22] bg-[#E67E22]" : "border-[#E67E22] bg-white"
                  }`}
                >
                  {terms.all && (
                    <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                      <path d="M1 3L4 6L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                <BodyMedium color="#333333">모두 동의</BodyMedium>
              </div>

              <BodySmall color="#767676">
                서비스 이용에 필수적인 개인정보 수집 및 이용, 본인확인, 위치정보 수집 및 이용, 마케팅 정보 수신(선택), 맞춤형 광고 수신(선택)을 포함합니다
              </BodySmall>
            </div>
          </div>

          {/* 구분선 */}
          <div className="w-full h-px bg-[#767676]" />

          {/* 개별 약관 */}
          <div className="flex flex-col gap-4 max-h-60 overflow-y-auto">
            {[
              { key: "service" as keyof TermsState, text: "(필수) 서비스 이용 약관", required: true },
              { key: "privacy" as keyof TermsState, text: "(필수) 개인정보 수집 및 이용", required: true },
              { key: "location" as keyof TermsState, text: "(필수) 위치기반 서비스 이용약관", required: true },
              { key: "identity" as keyof TermsState, text: "(필수) 본인확인서비스 동의사항", required: true },
              { key: "marketing" as keyof TermsState, text: "(선택) 마케팅 정보 동의 수신 동의", required: false },
              { key: "ads" as keyof TermsState, text: "(선택) 맞춤형 광고 목적 개인정보 수집 및 이용", required: false }
            ].map((term) => (
              <div key={term.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTermsToggle(term.key)}
                    className="w-6 h-6 flex items-center justify-center"
                  >
                    <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                      <path
                        d="M1 3L4 6L9 1"
                        stroke={terms[term.key] ? "#E67E22" : "#767676"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <BodySmall color="#333333">{term.text}</BodySmall>
                </div>
                <ChevronRightIcon size={24} className="text-[#767676]" />
              </div>
            ))}
          </div>

          {/* 확인 버튼 */}
          <button
            onClick={handleSignupComplete}
            disabled={!isConfirmButtonEnabled || loading}
            className={`w-full h-12 rounded-md font-bold text-base ${
              isConfirmButtonEnabled && !loading
                ? "bg-[#E67E22] text-white shadow-[0px_5px_30px_0px_rgba(0,0,0,0.1)]"
                : "bg-[#B0B0B0] text-white"
            }`}
          >
            {loading ? "회원가입 중..." : "확인"}
          </button>
        </div>
      </BottomSheet>

    </div>
  )
}
