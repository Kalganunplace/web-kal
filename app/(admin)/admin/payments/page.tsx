"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Eye,
  Building2,
  Calendar,
  DollarSign,
  Users,
  Filter,
  Download,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

import { paymentService, type Payment, type ConfirmPaymentData } from "@/lib/payment-service"
import { useAdminAuth } from "@/hooks/useAdminAuth"

interface PaymentWithBooking extends Payment {
  bookings?: {
    id: string
    booking_date: string
    booking_time: string
    total_quantity: number
    users: {
      email: string
      user_metadata: any
    }
  }
}

export default function AdminPaymentsPage() {
  const { adminUser, isLoading: authLoading } = useAdminAuth()

  const [payments, setPayments] = useState<PaymentWithBooking[]>([])
  const [filteredPayments, setFilteredPayments] = useState<PaymentWithBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<Payment['payment_status'] | 'all'>('pending')
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithBooking | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  // 확인 폼 상태
  const [confirmationForm, setConfirmationForm] = useState<ConfirmPaymentData>({
    action_type: 'confirm',
    confirmation_note: '',
    confirmed_amount: 0,
    deposit_date: '',
    bank_transaction_id: ''
  })

  // 통계 데이터
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    failed: 0,
    total_amount: 0,
    today_confirmed: 0
  })

  // 데이터 로드
  const loadPayments = async () => {
    try {
      setIsLoading(true)

      const statusFilter = selectedStatus === 'all' ? undefined : selectedStatus
      const paymentsData = await paymentService.getPaymentsForAdmin(statusFilter, 100)

      setPayments(paymentsData)
      updateStats(paymentsData)
    } catch (error) {
      console.error('결제 목록 로드 실패:', error)
      toast.error('결제 목록을 불러올 수 없습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 통계 업데이트
  const updateStats = (paymentsData: PaymentWithBooking[]) => {
    const today = new Date().toDateString()

    const newStats = {
      pending: paymentsData.filter(p => p.payment_status === 'pending').length,
      confirmed: paymentsData.filter(p => p.payment_status === 'confirmed').length,
      failed: paymentsData.filter(p => p.payment_status === 'failed').length,
      total_amount: paymentsData
        .filter(p => p.payment_status === 'confirmed')
        .reduce((sum, p) => sum + p.amount, 0),
      today_confirmed: paymentsData
        .filter(p =>
          p.payment_status === 'confirmed' &&
          p.confirmed_at &&
          new Date(p.confirmed_at).toDateString() === today
        ).length
    }

    setStats(newStats)
  }

  // 검색 및 필터링
  useEffect(() => {
    let filtered = payments

    // 검색어 필터링
    if (searchQuery) {
      filtered = filtered.filter(payment =>
        payment.depositor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.bookings?.users?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredPayments(filtered)
  }, [payments, searchQuery])

  // 결제 확인/거부 처리
  const handlePaymentConfirmation = async () => {
    if (!selectedPayment || !adminUser?.id) return

    try {
      setIsConfirming(true)

      await paymentService.confirmPayment(
        selectedPayment.id,
        adminUser.id,
        confirmationForm
      )

      toast.success(
        confirmationForm.action_type === 'confirm'
          ? '결제가 확인되었습니다.'
          : '결제가 거부되었습니다.'
      )

      // 데이터 다시 로드
      await loadPayments()

      // 모달 닫기
      setSelectedPayment(null)
      resetConfirmationForm()

    } catch (error) {
      console.error('결제 확인 처리 실패:', error)
      toast.error('처리 중 오류가 발생했습니다.')
    } finally {
      setIsConfirming(false)
    }
  }

  // 확인 폼 초기화
  const resetConfirmationForm = () => {
    setConfirmationForm({
      action_type: 'confirm',
      confirmation_note: '',
      confirmed_amount: 0,
      deposit_date: '',
      bank_transaction_id: ''
    })
  }

  // 결제 상세 모달 열기
  const openPaymentDetail = (payment: PaymentWithBooking) => {
    setSelectedPayment(payment)
    setConfirmationForm({
      ...confirmationForm,
      confirmed_amount: payment.amount,
      deposit_date: format(new Date(), 'yyyy-MM-dd')
    })
  }

  // 초기 로드
  useEffect(() => {
    if (!authLoading && adminUser) {
      loadPayments()
    }
  }, [authLoading, adminUser, selectedStatus])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    )
  }

  if (!adminUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h2>
          <p className="text-gray-600">관리자 로그인이 필요합니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">결제 관리</h1>
          <p className="text-gray-600">입금 확인 및 결제 관리</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadPayments}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            내보내기
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-xs text-gray-500">입금 대기</p>
                <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-500">확인 완료</p>
                <p className="text-xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-xs text-gray-500">실패/거부</p>
                <p className="text-xl font-bold text-red-600">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500">총 결제액</p>
                <p className="text-lg font-bold text-blue-600">
                  {paymentService.formatPrice(stats.total_amount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-xs text-gray-500">오늘 확인</p>
                <p className="text-xl font-bold text-purple-600">{stats.today_confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="입금자명, 이메일, 결제 ID로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Tabs value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as any)}>
              <TabsList>
                <TabsTrigger value="all">전체</TabsTrigger>
                <TabsTrigger value="pending">대기</TabsTrigger>
                <TabsTrigger value="confirmed">완료</TabsTrigger>
                <TabsTrigger value="failed">실패</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* 결제 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>결제 목록 ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={paymentService.getPaymentStatusColor(payment.payment_status)}>
                          {paymentService.getPaymentStatusText(payment.payment_status)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {format(new Date(payment.created_at), 'M월 d일 HH:mm', { locale: ko })}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">입금자명</p>
                          <p className="font-medium">{payment.depositor_name || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">결제 금액</p>
                          <p className="font-bold text-orange-600">
                            {paymentService.formatPrice(payment.amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">고객 이메일</p>
                          <p className="font-medium text-sm">
                            {payment.bookings?.users?.email || '-'}
                          </p>
                        </div>
                      </div>

                      {payment.payment_note && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                          <strong>고객 메모:</strong> {payment.payment_note}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPaymentDetail(payment)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            상세
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>결제 확인</DialogTitle>
                            <DialogDescription>
                              입금 내역을 확인하고 결제를 승인 또는 거부하세요.
                            </DialogDescription>
                          </DialogHeader>

                          {selectedPayment && (
                            <div className="space-y-4">
                              {/* 결제 정보 */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>결제 ID</Label>
                                  <Input value={selectedPayment.id} readOnly />
                                </div>
                                <div>
                                  <Label>결제 금액</Label>
                                  <Input value={paymentService.formatPrice(selectedPayment.amount)} readOnly />
                                </div>
                                <div>
                                  <Label>입금자명</Label>
                                  <Input value={selectedPayment.depositor_name || ''} readOnly />
                                </div>
                                <div>
                                  <Label>주문자 이메일</Label>
                                  <Input value={selectedPayment.bookings?.users?.email || ''} readOnly />
                                </div>
                              </div>

                              <Separator />

                              {/* 확인 폼 */}
                              <div className="space-y-4">
                                <div>
                                  <Label>처리 유형</Label>
                                  <Tabs
                                    value={confirmationForm.action_type}
                                    onValueChange={(v) => setConfirmationForm({
                                      ...confirmationForm,
                                      action_type: v as any
                                    })}
                                  >
                                    <TabsList className="grid w-full grid-cols-3">
                                      <TabsTrigger value="confirm">승인</TabsTrigger>
                                      <TabsTrigger value="reject">거부</TabsTrigger>
                                      <TabsTrigger value="cancel">취소</TabsTrigger>
                                    </TabsList>
                                  </Tabs>
                                </div>

                                {confirmationForm.action_type === 'confirm' && (
                                  <>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>확인 금액</Label>
                                        <Input
                                          type="number"
                                          value={confirmationForm.confirmed_amount}
                                          onChange={(e) => setConfirmationForm({
                                            ...confirmationForm,
                                            confirmed_amount: Number(e.target.value)
                                          })}
                                        />
                                      </div>
                                      <div>
                                        <Label>입금 일자</Label>
                                        <Input
                                          type="date"
                                          value={confirmationForm.deposit_date}
                                          onChange={(e) => setConfirmationForm({
                                            ...confirmationForm,
                                            deposit_date: e.target.value
                                          })}
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <Label>거래번호 (선택)</Label>
                                      <Input
                                        value={confirmationForm.bank_transaction_id}
                                        onChange={(e) => setConfirmationForm({
                                          ...confirmationForm,
                                          bank_transaction_id: e.target.value
                                        })}
                                        placeholder="은행 거래번호를 입력하세요"
                                      />
                                    </div>
                                  </>
                                )}

                                <div>
                                  <Label>처리 메모</Label>
                                  <Textarea
                                    value={confirmationForm.confirmation_note}
                                    onChange={(e) => setConfirmationForm({
                                      ...confirmationForm,
                                      confirmation_note: e.target.value
                                    })}
                                    placeholder="처리 사유나 메모를 입력하세요"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedPayment(null)
                                resetConfirmationForm()
                              }}
                            >
                              취소
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  className={
                                    confirmationForm.action_type === 'confirm'
                                      ? 'bg-green-500 hover:bg-green-600'
                                      : 'bg-red-500 hover:bg-red-600'
                                  }
                                  disabled={isConfirming}
                                >
                                  {confirmationForm.action_type === 'confirm' ? '승인' : '거부/취소'}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>결제 처리 확인</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    이 작업은 되돌릴 수 없습니다. 정말로 {
                                      confirmationForm.action_type === 'confirm' ? '승인' : '거부/취소'
                                    }하시겠습니까?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>취소</AlertDialogCancel>
                                  <AlertDialogAction onClick={handlePaymentConfirmation}>
                                    확인
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {payment.payment_status === 'pending' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white px-3"
                            onClick={() => openPaymentDetail(payment)}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="px-3"
                            onClick={() => {
                              setSelectedPayment(payment)
                              setConfirmationForm({
                                ...confirmationForm,
                                action_type: 'reject'
                              })
                            }}
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}