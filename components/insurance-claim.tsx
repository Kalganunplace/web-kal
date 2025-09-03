"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  ChevronLeft, 
  Shield, 
  AlertCircle, 
  Camera, 
  X, 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

import { 
  insuranceService, 
  type UserInsurance, 
  type InsuranceClaim,
  type CreateInsuranceClaimData 
} from "@/lib/insurance-service"
import { useAuthStore } from "@/stores/auth-store"
import { useAuthModal } from "@/contexts/auth-modal-context"

interface InsuranceClaimProps {
  userInsuranceId?: string
  onBack?: () => void
}

export default function InsuranceClaim({ userInsuranceId, onBack }: InsuranceClaimProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { openModal } = useAuthModal()

  const [userInsurance, setUserInsurance] = useState<UserInsurance | null>(null)
  const [claimAmount, setClaimAmount] = useState('')
  const [damageDescription, setDamageDescription] = useState('')
  const [claimReason, setClaimReason] = useState('')
  const [damagePhotos, setDamagePhotos] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 청구 사유 옵션
  const claimReasons = [
    '작업 중 파손',
    '운송 중 분실',
    '운송 중 손상',
    '화재/침수',
    '도난',
    '기타'
  ]

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return
    }

    if (userInsuranceId) {
      loadUserInsurance()
    }
  }, [isAuthenticated, user?.id, userInsuranceId])

  const loadUserInsurance = async () => {
    if (!user?.id || !userInsuranceId) return

    try {
      setIsLoading(true)
      
      const insurances = await insuranceService.getUserInsurances(user.id)
      const insurance = insurances.find(ins => ins.id === userInsuranceId)
      
      if (!insurance) {
        toast.error('해당 보험 정보를 찾을 수 없습니다.')
        handleBack()
        return
      }

      if (insurance.status !== 'active') {
        toast.error('활성화된 보험만 청구 가능합니다.')
        handleBack()
        return
      }

      setUserInsurance(insurance)
    } catch (error) {
      console.error('보험 정보 로드 실패:', error)
      toast.error('보험 정보를 불러올 수 없습니다.')
      handleBack()
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  const handleReasonSelect = (reason: string) => {
    setClaimReason(reason)
  }

  const addPhoto = () => {
    toast.info('사진 업로드 기능은 준비 중입니다.')
  }

  const removePhoto = (index: number) => {
    setDamagePhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!user?.id || !userInsurance) {
      openModal('login')
      return
    }

    // 유효성 검사
    const amount = parseInt(claimAmount.replace(/,/g, ''))
    if (!amount || amount <= 0) {
      toast.error('청구 금액을 입력해주세요.')
      return
    }

    if (amount > userInsurance.coverage_amount) {
      toast.error(`청구 금액이 보장금액(${insuranceService.formatCurrency(userInsurance.coverage_amount)})을 초과합니다.`)
      return
    }

    if (!claimReason) {
      toast.error('청구 사유를 선택해주세요.')
      return
    }

    if (!damageDescription.trim()) {
      toast.error('손상 내용을 상세히 작성해주세요.')
      return
    }

    if (damageDescription.trim().length < 20) {
      toast.error('손상 내용을 20자 이상 작성해주세요.')
      return
    }

    try {
      setIsSubmitting(true)

      const claimData: CreateInsuranceClaimData = {
        user_insurance_id: userInsurance.id,
        claim_amount: amount,
        damage_description: damageDescription.trim(),
        damage_photos: damagePhotos,
        claim_reason: claimReason
      }

      await insuranceService.createInsuranceClaim(user.id, claimData)
      
      toast.success('보험 청구가 성공적으로 접수되었습니다!')
      handleBack()
    } catch (error) {
      console.error('보험 청구 실패:', error)
      toast.error('보험 청구 처리 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (value: string) => {
    const number = parseInt(value.replace(/,/g, ''))
    if (isNaN(number)) return ''
    return number.toLocaleString('ko-KR')
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '')
    if (/^\d*$/.test(value)) {
      setClaimAmount(formatCurrency(value))
    }
  }

  // 비로그인 상태
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="p-6 text-center">
            <Shield className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">로그인이 필요해요</h3>
            <p className="text-sm text-gray-600 mb-6">
              보험 청구를 하려면 로그인해 주세요.
            </p>
            <div className="space-y-3">
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={() => openModal('login')}
              >
                로그인
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleBack}
              >
                돌아가기
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        </div>
      </div>
    )
  }

  if (!userInsurance) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">보험 정보를 찾을 수 없습니다</h3>
            <Button onClick={handleBack}>돌아가기</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <h1 className="text-lg font-medium">보험 청구</h1>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="p-4 pb-20 max-h-[80vh] overflow-y-auto">
          {/* 보험 정보 */}
          <Card className="mb-4 bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-orange-600" />
                <h3 className="font-medium text-orange-800">보험 정보</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-orange-700">보험증권번호</span>
                  <span className="font-medium text-orange-800">{userInsurance.policy_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-700">보장금액</span>
                  <span className="font-medium text-orange-800">
                    {insuranceService.formatCurrency(userInsurance.coverage_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-700">보장기간</span>
                  <span className="font-medium text-orange-800">
                    {insuranceService.formatDate(userInsurance.start_date)} ~ {' '}
                    {userInsurance.end_date ? insuranceService.formatDate(userInsurance.end_date) : '미정'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 청구 금액 */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <Label htmlFor="claim-amount" className="text-sm font-medium text-gray-700 mb-2 block">
                청구 금액
              </Label>
              <div className="relative">
                <Input
                  id="claim-amount"
                  placeholder="청구할 금액을 입력하세요"
                  value={claimAmount}
                  onChange={handleAmountChange}
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  원
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                최대 {insuranceService.formatCurrency(userInsurance.coverage_amount)}까지 청구 가능
              </p>
            </CardContent>
          </Card>

          {/* 청구 사유 */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                청구 사유
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {claimReasons.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => handleReasonSelect(reason)}
                    className={`p-2 rounded-lg text-sm border transition-colors ${
                      claimReason === reason
                        ? 'bg-orange-100 border-orange-300 text-orange-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 손상 내용 */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <Label htmlFor="damage-description" className="text-sm font-medium text-gray-700 mb-2 block">
                손상 내용 상세 설명
              </Label>
              <Textarea
                id="damage-description"
                placeholder="손상이 발생한 경위와 상태를 자세히 설명해 주세요. 언제, 어떤 상황에서 손상이 발생했는지 구체적으로 작성하면 빠른 처리에 도움이 됩니다."
                value={damageDescription}
                onChange={(e) => setDamageDescription(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>최소 20자 이상 작성해주세요</span>
                <span>{damageDescription.length}/1000</span>
              </div>
            </CardContent>
          </Card>

          {/* 사진 첨부 */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                손상 사진 (필수)
              </Label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {damagePhotos.map((photo, index) => (
                  <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img src={photo} alt={`손상 사진 ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {damagePhotos.length < 5 && (
                  <button
                    onClick={addPhoto}
                    className="aspect-square bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Camera className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">추가</span>
                  </button>
                )}
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-yellow-700">
                    <p className="font-medium mb-1">사진 촬영 안내</p>
                    <ul className="space-y-1 text-yellow-600">
                      <li>• 손상 부위가 명확히 보이도록 촬영</li>
                      <li>• 전체적인 상태와 세부적인 손상 모두 촬영</li>
                      <li>• 최대 5장까지 업로드 가능</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 처리 안내 */}
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-2">청구 처리 안내</p>
                  <ul className="space-y-1">
                    <li>• 접수 후 3-5 영업일 내 검토 완료</li>
                    <li>• 추가 서류 요청 시 빠른 제출 협조</li>
                    <li>• 승인 후 2-3 영업일 내 보상금 지급</li>
                    <li>• 처리 현황은 마이페이지에서 확인 가능</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto">
          <Button
            className={`w-full py-3 rounded-lg ${
              claimAmount && claimReason && damageDescription.length >= 20
                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleSubmit}
            disabled={
              isSubmitting || 
              !claimAmount || 
              !claimReason || 
              damageDescription.length < 20
            }
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSubmitting ? '청구 처리 중...' : '청구 신청'}
          </Button>
        </div>
      </div>
    </div>
  )
}