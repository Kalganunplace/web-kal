"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import BottomSheet from "@/components/ui/bottom-sheet"
import { Loader2, ChevronLeft, ChevronRight, FileText, Shield, MapPin, Mail, Eye } from "lucide-react"
import { toast } from "sonner"

import { termsService, type Term } from "@/lib/terms-service"
import { useAuthStore } from "@/stores/auth-store"
import { useAuthModal } from "@/contexts/auth-modal-context"

interface TermAgreementState {
  [termId: string]: boolean
}

export default function TermsAgreement() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { openModal } = useAuthModal()

  const [terms, setTerms] = useState<Term[]>([])
  const [agreements, setAgreements] = useState<TermAgreementState>({})
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)

  // 약관별 아이콘 매핑
  const getTermIcon = (type: string) => {
    switch (type) {
      case 'service':
        return <FileText className="w-5 h-5" />
      case 'privacy':
        return <Shield className="w-5 h-5" />
      case 'location':
        return <MapPin className="w-5 h-5" />
      case 'marketing':
        return <Mail className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  // 데이터 로드
  useEffect(() => {
    const loadTerms = async () => {
      try {
        setIsLoading(true)
        const termsData = await termsService.getActiveTerms()
        setTerms(termsData)
        
        // 초기 동의 상태 설정 (모두 false)
        const initialAgreements: TermAgreementState = {}
        termsData.forEach(term => {
          initialAgreements[term.id] = false
        })
        setAgreements(initialAgreements)
      } catch (error) {
        console.error('약관 로드 실패:', error)
        toast.error('약관 정보를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadTerms()
  }, [])

  // 개별 약관 동의 토글
  const toggleAgreement = (termId: string) => {
    setAgreements(prev => ({
      ...prev,
      [termId]: !prev[termId]
    }))
  }

  // 전체 필수 약관 동의 토글
  const toggleAllRequired = () => {
    const requiredTerms = terms.filter(term => term.is_required)
    const allRequiredAgreed = requiredTerms.every(term => agreements[term.id])
    
    const newAgreements = { ...agreements }
    requiredTerms.forEach(term => {
      newAgreements[term.id] = !allRequiredAgreed
    })
    setAgreements(newAgreements)
  }

  // 전체 약관 동의 토글
  const toggleAll = () => {
    const allAgreed = terms.every(term => agreements[term.id])
    
    const newAgreements: TermAgreementState = {}
    terms.forEach(term => {
      newAgreements[term.id] = !allAgreed
    })
    setAgreements(newAgreements)
  }

  // 약관 상세 보기
  const viewTermDetail = (term: Term) => {
    setSelectedTerm(term)
    setIsBottomSheetOpen(true)
  }

  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false)
    setSelectedTerm(null)
  }

  // 동의 완료 처리
  const handleSubmit = async () => {
    if (!isAuthenticated || !user?.id) {
      openModal('login')
      return
    }

    // 필수 약관 동의 확인
    const requiredTerms = terms.filter(term => term.is_required)
    const hasAgreedToAllRequired = requiredTerms.every(term => agreements[term.id])

    if (!hasAgreedToAllRequired) {
      toast.error('필수 약관에 모두 동의해주세요.')
      return
    }

    try {
      setIsSubmitting(true)

      // 동의한 약관들 수집
      const agreedTerms = terms.filter(term => agreements[term.id])
      const agreementData = agreedTerms.map(term => ({
        term_id: term.id,
        is_agreed: true,
        version: term.version
      }))

      await termsService.createBulkTermAgreements(user.id, agreementData)
      
      toast.success('약관 동의가 완료되었습니다!')
      router.back()
    } catch (error) {
      console.error('약관 동의 처리 실패:', error)
      toast.error('약관 동의 처리 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 유효성 검사
  const requiredTerms = terms.filter(term => term.is_required)
  const hasAgreedToAllRequired = requiredTerms.every(term => agreements[term.id])
  const allRequiredAgreed = requiredTerms.every(term => agreements[term.id])
  const allAgreed = terms.every(term => agreements[term.id])

  // 로딩 중
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

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </Button>
            <h1 className="text-lg font-medium">약관 동의</h1>
            <div className="w-6" />
          </div>

          {/* Content */}
          <div className="p-4 pb-20 max-h-[80vh] overflow-y-auto">
            {/* 안내 메시지 */}
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-2">서비스 이용을 위한 약관 동의</h2>
              <p className="text-sm text-gray-600">
                칼가는곳 서비스 이용을 위해<br />
                아래 약관에 동의해주세요
              </p>
            </div>

            {/* 전체 동의 */}
            <Card className="mb-4 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={allAgreed}
                      onCheckedChange={toggleAll}
                      className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    />
                    <span className="font-medium text-gray-800">전체 동의</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 ml-7">
                  선택항목에 대한 동의 포함
                </p>
              </CardContent>
            </Card>

            {/* 필수 약관 전체 동의 */}
            {requiredTerms.length > 0 && (
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={allRequiredAgreed}
                        onCheckedChange={toggleAllRequired}
                        className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                      />
                      <span className="font-medium text-gray-800">필수항목 전체 동의</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 개별 약관 목록 */}
            <div className="space-y-3">
              {terms.map((term) => (
                <Card key={term.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={agreements[term.id] || false}
                          onCheckedChange={() => toggleAgreement(term.id)}
                          className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                        />
                        <div className="text-orange-500">
                          {getTermIcon(term.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {term.is_required && <span className="text-red-500">[필수]</span>}
                              {!term.is_required && <span className="text-gray-500">[선택]</span>}
                              {" "}{term.title}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            버전 {term.version}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewTermDetail(term)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 안내 사항 */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-800 mb-2">📋 안내사항</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• 필수 약관은 서비스 이용을 위해 반드시 동의가 필요합니다.</li>
                <li>• 선택 약관은 거부하셔도 서비스 이용이 가능합니다.</li>
                <li>• 약관은 마이페이지에서 언제든 다시 확인하실 수 있습니다.</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto">
            <Button
              className={`w-full py-3 rounded-lg ${
                hasAgreedToAllRequired 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={handleSubmit}
              disabled={isSubmitting || !hasAgreedToAllRequired}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting ? '처리 중...' : '동의하고 시작하기'}
            </Button>
          </div>
        </div>
      </div>

      {/* 약관 상세 바텀시트 */}
      <BottomSheet isOpen={isBottomSheetOpen} onClose={handleCloseBottomSheet}>
        {selectedTerm && (
          <div className="p-6 space-y-4">
            {/* 약관 헤더 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="text-orange-500 text-2xl">
                  {getTermIcon(selectedTerm.type)}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800">{selectedTerm.title}</h3>
              <p className="text-sm text-gray-500 mt-1">버전 {selectedTerm.version}</p>
            </div>

            {/* 약관 내용 */}
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {selectedTerm.content}
              </pre>
            </div>

            {/* 동의 버튼 */}
            <div className="space-y-3">
              <Button
                className={`w-full ${
                  agreements[selectedTerm.id] 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
                onClick={() => {
                  toggleAgreement(selectedTerm.id)
                  handleCloseBottomSheet()
                }}
              >
                {agreements[selectedTerm.id] ? '✓ 동의 완료' : '동의하기'}
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </>
  )
}