"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BottomSheet from "@/components/ui/bottom-sheet"
import { Loader2, ChevronLeft, Ticket, Plus, Gift, Calendar, 
         AlertCircle, CheckCircle, Clock, Percent, Won, Copy } from "lucide-react"
import { toast } from "sonner"

import { couponService, type UserCoupon } from "@/lib/coupon-service"
import { useAuthStore } from "@/stores/auth-store"
import { useAuthModal } from "@/contexts/auth-modal-context"

export default function MyCoupons() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { openModal } = useAuthModal()

  const [availableCoupons, setAvailableCoupons] = useState<UserCoupon[]>([])
  const [usedCoupons, setUsedCoupons] = useState<UserCoupon[]>([])
  const [selectedCoupon, setSelectedCoupon] = useState<UserCoupon | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)

  // 데이터 로드
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setIsLoading(false)
      return
    }

    loadCoupons()
  }, [isAuthenticated, user?.id])

  const loadCoupons = async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      
      const allCoupons = await couponService.getUserCoupons(user.id, true)
      
      const available = allCoupons.filter(coupon => !coupon.is_used)
      const used = allCoupons.filter(coupon => coupon.is_used)
      
      setAvailableCoupons(available)
      setUsedCoupons(used)
    } catch (error) {
      console.error('쿠폰 로드 실패:', error)
      toast.error('쿠폰 정보를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 쿠폰 코드 등록
  const registerCoupon = async () => {
    if (!user?.id || !couponCode.trim()) {
      toast.error('쿠폰 코드를 입력해주세요.')
      return
    }

    try {
      setIsRegistering(true)
      
      const coupon = await couponService.getCouponByCode(couponCode.trim())
      
      if (!coupon) {
        toast.error('존재하지 않는 쿠폰 코드입니다.')
        return
      }

      await couponService.issueCouponToUser(user.id, coupon.id)
      
      toast.success('쿠폰이 성공적으로 등록되었습니다!')
      setCouponCode('')
      loadCoupons()
    } catch (error) {
      console.error('쿠폰 등록 실패:', error)
      toast.error('쿠폰 등록 중 오류가 발생했습니다.')
    } finally {
      setIsRegistering(false)
    }
  }

  // 쿠폰 상세 보기
  const viewCouponDetail = (coupon: UserCoupon) => {
    setSelectedCoupon(coupon)
    setIsBottomSheetOpen(true)
  }

  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false)
    setSelectedCoupon(null)
  }

  // 쿠폰 코드 복사
  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('쿠폰 코드가 복사되었습니다!')
  }

  // 쿠폰 카드 렌더링
  const renderCouponCard = (userCoupon: UserCoupon, showUsedInfo: boolean = false) => {
    const coupon = userCoupon.coupon!
    const statusColor = couponService.getCouponStatusColor(coupon, userCoupon)
    const statusLabel = couponService.getCouponStatusLabel(coupon, userCoupon)

    return (
      <Card 
        key={userCoupon.id}
        className={`cursor-pointer transition-all duration-200 ${
          userCoupon.is_used 
            ? 'opacity-60 border-gray-200' 
            : 'hover:shadow-md border-orange-200 bg-gradient-to-r from-orange-50 to-red-50'
        }`}
        onClick={() => viewCouponDetail(userCoupon)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                userCoupon.is_used ? 'bg-gray-400' : 'bg-orange-500'
              }`} />
              <Badge className={statusColor}>
                {statusLabel}
              </Badge>
            </div>
            <div className="text-orange-500">
              {coupon.type === 'percentage' ? <Percent className="w-4 h-4" /> : <Won className="w-4 h-4" />}
            </div>
          </div>

          <div className="mb-3">
            <h4 className="font-bold text-lg text-gray-800 mb-1">
              {couponService.formatDiscountValue(coupon)} 할인
            </h4>
            <p className="text-sm text-gray-600 line-clamp-2">
              {coupon.name}
            </p>
            {coupon.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                {coupon.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {coupon.min_order_amount ? `${couponService.formatPrice(coupon.min_order_amount)} 이상 주문시` : '제한 없음'}
            </span>
            <span>
              ~{couponService.formatExpiryDate(coupon.valid_until)}
            </span>
          </div>

          {showUsedInfo && userCoupon.used_at && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">사용일:</span>
                <span className="text-gray-600">
                  {new Date(userCoupon.used_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
              {userCoupon.discount_amount && (
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-gray-500">할인금액:</span>
                  <span className="text-green-600 font-medium">
                    -{couponService.formatPrice(userCoupon.discount_amount)}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // 비로그인 상태
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </Button>
            <h1 className="text-lg font-medium">내 쿠폰</h1>
            <div className="w-6" />
          </div>

          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">로그인이 필요해요</h3>
            <p className="text-sm text-gray-600 mb-6">
              내 쿠폰을 확인하려면 로그인해 주세요.
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
                onClick={() => router.back()}
              >
                나중에 가입
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

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </Button>
            <h1 className="text-lg font-medium">내 쿠폰</h1>
            <div className="w-6" />
          </div>

          {/* Coupon Code Registration */}
          <div className="p-4 bg-orange-50 border-b">
            <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              쿠폰 등록
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder="쿠폰 코드를 입력하세요"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && registerCoupon()}
              />
              <Button 
                onClick={registerCoupon}
                disabled={isRegistering || !couponCode.trim()}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {isRegistering ? <Loader2 className="w-4 h-4 animate-spin" /> : '등록'}
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            <Tabs defaultValue="available" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="available">
                  사용가능 ({availableCoupons.length})
                </TabsTrigger>
                <TabsTrigger value="used">
                  사용완료 ({usedCoupons.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="available" className="mt-0">
                {availableCoupons.length > 0 ? (
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                    {availableCoupons.map(userCoupon => renderCouponCard(userCoupon))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Ticket className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">사용 가능한 쿠폰이 없어요</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      쿠폰 코드를 등록하거나<br />
                      서비스를 이용해서 쿠폰을 받아보세요
                    </p>
                    <Button
                      className="bg-orange-500 hover:bg-orange-600"
                      onClick={() => router.push('/client/knife-request')}
                    >
                      칼갈이 신청하기
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="used" className="mt-0">
                {usedCoupons.length > 0 ? (
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                    {usedCoupons.map(userCoupon => renderCouponCard(userCoupon, true))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">사용한 쿠폰이 없어요</h3>
                    <p className="text-sm text-gray-600">
                      쿠폰을 사용하면<br />
                      여기에서 확인하실 수 있어요
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* 쿠폰 상세 바텀시트 */}
      <BottomSheet isOpen={isBottomSheetOpen} onClose={handleCloseBottomSheet}>
        {selectedCoupon && selectedCoupon.coupon && (
          <div className="p-6 space-y-4">
            {/* 쿠폰 헤더 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-3xl">
                  {selectedCoupon.coupon.type === 'percentage' ? (
                    <Percent className="w-8 h-8 text-orange-500" />
                  ) : (
                    <Won className="w-8 h-8 text-orange-500" />
                  )}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {couponService.formatDiscountValue(selectedCoupon.coupon)} 할인
              </h3>
              <p className="text-lg text-gray-600">{selectedCoupon.coupon.name}</p>
              <Badge className={couponService.getCouponStatusColor(selectedCoupon.coupon, selectedCoupon)}>
                {couponService.getCouponStatusLabel(selectedCoupon.coupon, selectedCoupon)}
              </Badge>
            </div>

            {/* 쿠폰 정보 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">📋 쿠폰 정보</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">할인 유형:</span>
                  <span className="text-gray-700">
                    {selectedCoupon.coupon.type === 'percentage' ? '비율 할인' : '금액 할인'}
                  </span>
                </div>
                
                {selectedCoupon.coupon.min_order_amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">최소 주문 금액:</span>
                    <span className="text-gray-700">
                      {couponService.formatPrice(selectedCoupon.coupon.min_order_amount)}
                    </span>
                  </div>
                )}
                
                {selectedCoupon.coupon.max_discount_amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">최대 할인 금액:</span>
                    <span className="text-gray-700">
                      {couponService.formatPrice(selectedCoupon.coupon.max_discount_amount)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-500">유효기간:</span>
                  <span className="text-gray-700">
                    {couponService.formatExpiryDate(selectedCoupon.coupon.valid_until)}까지
                  </span>
                </div>
              </div>
            </div>

            {/* 쿠폰 코드 */}
            {selectedCoupon.coupon.coupon_code && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  쿠폰 코드
                </h4>
                <div className="flex items-center justify-between bg-white rounded p-3 border border-blue-200">
                  <code className="text-sm font-mono text-blue-700">
                    {selectedCoupon.coupon.coupon_code}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyCouponCode(selectedCoupon.coupon!.coupon_code!)}
                    className="text-blue-600 border-blue-300"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* 사용 내역 */}
            {selectedCoupon.is_used && (
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  사용 내역
                </h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-green-600">사용일:</span>
                    <span className="text-green-700">
                      {selectedCoupon.used_at && new Date(selectedCoupon.used_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  {selectedCoupon.discount_amount && (
                    <div className="flex justify-between">
                      <span className="text-green-600">할인금액:</span>
                      <span className="text-green-700 font-medium">
                        -{couponService.formatPrice(selectedCoupon.discount_amount)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 주의사항 */}
            {selectedCoupon.coupon.description && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  주의사항
                </h4>
                <p className="text-sm text-yellow-700">
                  {selectedCoupon.coupon.description}
                </p>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="space-y-3">
              {!selectedCoupon.is_used && (
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  onClick={() => {
                    handleCloseBottomSheet()
                    router.push('/client/knife-request')
                  }}
                >
                  바로 사용하기
                </Button>
              )}
            </div>
          </div>
        )}
      </BottomSheet>
    </>
  )
}