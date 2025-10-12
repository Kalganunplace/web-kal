"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Building2,
  ChevronLeft,
  Copy,
  Clock,
  AlertCircle,
  CheckCircle2,
  Phone,
  MessageCircle
} from "lucide-react"
import { toast } from "sonner"
import { format, addHours } from "date-fns"
import { ko } from "date-fns/locale"

import { paymentService, type Payment, type PaymentBankAccount } from "@/lib/payment-service"
import { useAuthStore } from "@/stores/auth-store"
import { NoBankAccountState } from "@/components/common/empty-state"

function BankTransferContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuthStore()

  const paymentId = searchParams.get('payment_id')

  const [payment, setPayment] = useState<Payment | null>(null)
  const [bankAccounts, setBankAccounts] = useState<PaymentBankAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [depositCompleted, setDepositCompleted] = useState(false)

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated || !user?.id || !paymentId) {
        router.push('/client/login')
        return
      }

      try {
        setIsLoading(true)

        // 결제 정보 조회
        const paymentData = await paymentService.getPaymentById(paymentId, user.id)
        if (!paymentData) {
          toast.error('결제 정보를 찾을 수 없습니다.')
          router.push('/client/usage-history')
          return
        }

        if (paymentData.payment_method !== 'bank_transfer') {
          toast.error('무통장입금 결제가 아닙니다.')
          router.push('/client/usage-history')
          return
        }

        setPayment(paymentData)

        // 입금 계좌 정보 조회 (저희 계좌) - API를 통해 조회
        const response = await fetch('/api/bank-accounts')
        const result = await response.json()
        const accounts = result.success ? result.data : []
        setBankAccounts(accounts)

      } catch (error) {
        console.error('데이터 로드 실패:', error)
        toast.error('정보를 불러오는 중 오류가 발생했습니다.')
        router.push('/client/usage-history')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [paymentId, isAuthenticated, user?.id, router])

  // 계좌번호 복사
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${type}이(가) 복사되었습니다.`)
    } catch (error) {
      toast.error('복사에 실패했습니다.')
    }
  }

  // 입금 완료 처리
  const handleDepositCompleted = async () => {
    if (!payment || !user?.id) return

    try {
      await paymentService.updatePaymentStatus(
        payment.id,
        user.id,
        'pending',
        '고객이 입금 완료를 신고했습니다.'
      )
      setDepositCompleted(true)
      toast.success('입금 완료가 접수되었습니다. 확인 후 연락드리겠습니다.')
    } catch (error) {
      console.error('입금 완료 처리 실패:', error)
      toast.error('입금 완료 처리 중 오류가 발생했습니다.')
    }
  }

  // 마감 시간 계산
  const getDeadlineInfo = () => {
    if (!payment?.deposit_deadline) return null

    const deadline = new Date(payment.deposit_deadline)
    const now = new Date()
    const isExpired = deadline < now
    const timeLeft = deadline.getTime() - now.getTime()
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

    return {
      deadline,
      isExpired,
      hoursLeft,
      minutesLeft,
      displayTime: format(deadline, 'M월 d일 HH:mm', { locale: ko })
    }
  }

  const deadlineInfo = getDeadlineInfo()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        </div>
      </div>
    )
  }

  if (!payment) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <h1 className="text-lg font-medium">무통장입금</h1>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="p-4 pb-20 max-h-[80vh] overflow-y-auto space-y-4">
          {/* 상태 표시 */}
          <Card className="border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2">
                {depositCompleted ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-green-700">입금 완료 접수됨</span>
                  </>
                ) : payment.payment_status === 'confirmed' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-green-700">결제 완료</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-orange-700">입금 대기 중</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 입금 마감 시간 */}
          {deadlineInfo && !depositCompleted && payment.payment_status === 'pending' && (
            <Card className={deadlineInfo.isExpired ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className={`w-4 h-4 ${deadlineInfo.isExpired ? 'text-red-500' : 'text-yellow-600'}`} />
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${deadlineInfo.isExpired ? 'text-red-800' : 'text-yellow-800'}`}>
                      {deadlineInfo.isExpired ? '입금 마감 시간이 지났습니다' : '입금 마감 시간'}
                    </p>
                    <p className={`text-xs ${deadlineInfo.isExpired ? 'text-red-600' : 'text-yellow-700'}`}>
                      {deadlineInfo.displayTime}
                      {!deadlineInfo.isExpired && (
                        <span className="ml-2">
                          (약 {deadlineInfo.hoursLeft}시간 {deadlineInfo.minutesLeft}분 남음)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {deadlineInfo.isExpired && (
                  <p className="text-xs text-red-600 mt-2">
                    고객센터로 연락하여 주문을 재개해 주세요.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* 결제 금액 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">결제 금액</span>
                <span className="text-xl font-bold text-orange-500">
                  {paymentService.formatPrice(payment.amount)}
                </span>
              </div>
              {payment.depositor_name && (
                <div className="flex justify-between items-center mt-2 pt-2 border-t">
                  <span className="text-gray-600 text-sm">입금자명</span>
                  <span className="font-medium">{payment.depositor_name}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 고객 계좌 정보 */}
          {payment.customer_bank_name && payment.customer_account_number && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 mb-3">입금할 계좌 정보</h3>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{payment.customer_bank_name}</p>
                      <p className="text-lg font-mono text-gray-800">
                        {payment.customer_account_number}
                      </p>
                      <p className="text-sm text-gray-600">
                        예금주: {payment.depositor_name}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(payment.customer_account_number!, '계좌번호')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  위 계좌에서 아래 금액만큼 저희 계좌로 입금해주세요.
                </p>
              </CardContent>
            </Card>
          )}

          {/* 저희 입금 계좌 정보 */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">입금받을 계좌 (저희 계좌)</h3>

            {bankAccounts.length === 0 ? (
              <NoBankAccountState
                onAddAccount={() => router.push('/client/customer-service')}
              />
            ) : (
              bankAccounts.map((account) => (
              <Card key={account.id} className="border-2 border-gray-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-lg">{account.bank_name}</span>
                    </div>
                    {account.is_default && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                        주계좌
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* 계좌번호 */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">계좌번호</p>
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <span className="text-lg font-mono font-bold text-gray-800">
                          {account.account_number}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(account.account_number, '계좌번호')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* 예금주 */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">예금주</p>
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium text-gray-800">{account.account_holder}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(account.account_holder, '예금주')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* 입금 금액 */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">입금 금액</p>
                      <div className="flex items-center justify-between bg-orange-50 p-3 rounded-lg">
                        <span className="text-lg font-bold text-orange-600">
                          {paymentService.formatPrice(payment.amount)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(payment.amount.toString(), '입금 금액')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {account.description && (
                    <p className="text-xs text-gray-500 mt-3 p-2 bg-blue-50 rounded">
                      {account.description}
                    </p>
                  )}
                </CardContent>
              </Card>
              ))
            )}
          </div>

          {/* 입금 안내 */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <h4 className="font-medium text-orange-900 mb-2">입금 안내</h4>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• 위에 표시된 고객님의 계좌에서 정확한 금액을 입금해주세요.</li>
                <li>• 입금자명은 '{payment.depositor_name}'으로 표시됩니다.</li>
                <li>• 입금 후 자동으로 확인되어 서비스가 진행됩니다.</li>
                <li>• 주문 후 24시간 이내에 입금 완료해 주시기 바랍니다.</li>
              </ul>
            </CardContent>
          </Card>

          {/* 입금 완료 버튼 */}
          {!depositCompleted && payment.payment_status === 'pending' && !deadlineInfo?.isExpired && (
            <Button
              onClick={handleDepositCompleted}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
            >
              입금 완료
            </Button>
          )}

          {/* 고객센터 연락 */}
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">문의사항이 있으신가요?</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => window.location.href = 'tel:1588-0000'}
                >
                  <Phone className="w-4 h-4" />
                  전화 문의
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => router.push('/client/customer-service')}
                >
                  <MessageCircle className="w-4 h-4" />
                  1:1 문의
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                평일 09:00 - 18:00 (점심시간 12:00 - 13:00 제외)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function BankTransferPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
          ⏳
        </div>
      </div>
    }>
      <BankTransferContent />
    </Suspense>
  )
}