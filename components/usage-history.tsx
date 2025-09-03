"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import BottomSheet from "@/components/ui/bottom-sheet"
import { Loader2, ChevronLeft, ChevronRight, Calendar, PocketKnifeIcon as Knife, User, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

import { bookingService, type Booking } from "@/lib/booking-service"
import { knifeService } from "@/lib/knife-service"
import { useAuthStore } from "@/stores/auth-store"
import { useAuthModal } from "@/contexts/auth-modal-context"

export default function UsageHistory() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { openModal } = useAuthModal()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 데이터 로드
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setIsLoading(false)
      return
    }

    loadBookings()
  }, [isAuthenticated, user?.id])

  const loadBookings = async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      const bookingsData = await bookingService.getUserBookings(user.id)
      setBookings(bookingsData)
    } catch (error) {
      console.error('이용내역 로드 실패:', error)
      toast.error('이용내역을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    if (!user?.id) return

    try {
      setIsRefreshing(true)
      await loadBookings()
      toast.success('이용내역을 새로고침했습니다.')
    } catch (error) {
      toast.error('새로고침 중 오류가 발생했습니다.')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsBottomSheetOpen(true)
  }

  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false)
    setSelectedBooking(null)
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!user?.id) return

    try {
      await bookingService.cancelBooking(bookingId, user.id)
      toast.success('예약이 취소되었습니다.')
      
      // 로컬 상태 업데이트
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      )
      
      handleCloseBottomSheet()
    } catch (error) {
      console.error('예약 취소 실패:', error)
      toast.error('예약 취소 중 오류가 발생했습니다.')
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: '접수 대기', color: 'bg-yellow-100 text-yellow-800' }
      case 'confirmed':
        return { label: '접수 완료', color: 'bg-blue-100 text-blue-800' }
      case 'in_progress':
        return { label: '작업 중', color: 'bg-purple-100 text-purple-800' }
      case 'completed':
        return { label: '완료', color: 'bg-green-100 text-green-800' }
      case 'cancelled':
        return { label: '취소됨', color: 'bg-red-100 text-red-800' }
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800' }
    }
  }

  const canCancelBooking = (booking: Booking): boolean => {
    return booking.status === 'pending' || booking.status === 'confirmed'
  }

  const formatBookingItems = (booking: Booking): string => {
    if (!booking.booking_items || booking.booking_items.length === 0) {
      return '칼 정보 없음'
    }

    return booking.booking_items
      .map(item => `${item.knife_type?.name || '칼'} ${item.quantity}개`)
      .join(', ')
  }

  // 비로그인 상태
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </Button>
            <h1 className="text-lg font-medium">이용내역</h1>
            <div className="w-6" />
          </div>

          {/* 비로그인 안내 */}
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">로그인이 필요해요</h3>
            <p className="text-sm text-gray-600 mb-6">
              이용내역을 확인하려면 로그인해 주세요.
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
            <h1 className="text-lg font-medium">이용내역</h1>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            {bookings.length > 0 ? (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                {bookings.map((booking) => {
                  const statusInfo = getStatusInfo(booking.status)
                  
                  return (
                    <Card 
                      key={booking.id}
                      className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                      onClick={() => handleBookingClick(booking)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={`${statusInfo.color} text-xs`}>
                            {statusInfo.label}
                          </Badge>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {format(new Date(booking.booking_date), 'yyyy년 MM월 dd일 EEEE', { locale: ko })} {booking.booking_time.slice(0, 5)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Knife className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 line-clamp-1">
                              {formatBookingItems(booking)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-sm text-gray-500">
                              총 {booking.total_quantity}개
                            </span>
                            <span className="text-lg font-bold text-orange-500">
                              {knifeService.formatPrice(booking.total_amount)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              // 이용내역이 없을 때
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Knife className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">아직 이용내역이 없어요</h3>
                <p className="text-sm text-gray-600 mb-6">
                  칼갈이 서비스를 신청하시면<br />
                  이용내역을 확인하실 수 있어요
                </p>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={() => router.push('/knife-request')}
                >
                  칼갈이 신청하기
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 이용내역 상세 바텀시트 */}
      <BottomSheet isOpen={isBottomSheetOpen} onClose={handleCloseBottomSheet}>
        {selectedBooking && (
          <div className="p-6 space-y-4">
            {/* 예약 정보 헤더 */}
            <div className="text-center">
              <Badge className={`${getStatusInfo(selectedBooking.status).color} mb-3`}>
                {getStatusInfo(selectedBooking.status).label}
              </Badge>
              <h3 className="text-xl font-bold text-gray-800">예약 상세 정보</h3>
            </div>

            {/* 예약 날짜/시간 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">📅 예약 일시</h4>
              <p className="text-gray-700">
                {format(new Date(selectedBooking.booking_date), 'yyyy년 MM월 dd일 EEEE', { locale: ko })}
              </p>
              <p className="text-gray-700">
                {selectedBooking.booking_time.slice(0, 5)} 수거 예정
              </p>
            </div>

            {/* 주문 항목 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">🔪 주문 항목</h4>
              <div className="space-y-2">
                {selectedBooking.booking_items?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{item.knife_type?.name || '칼'}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {item.quantity}개 × {knifeService.formatPrice(item.unit_price)}
                      </span>
                    </div>
                    <span className="font-medium text-orange-500">
                      {knifeService.formatPrice(item.total_price)}
                    </span>
                  </div>
                )) || (
                  <p className="text-gray-600">주문 항목 정보가 없습니다.</p>
                )}
                
                <div className="border-t pt-2 mt-3">
                  <div className="flex items-center justify-between font-bold">
                    <span>총 금액</span>
                    <span className="text-lg text-orange-500">
                      {knifeService.formatPrice(selectedBooking.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 특별 요청사항 */}
            {selectedBooking.special_instructions && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">📝 특별 요청사항</h4>
                <p className="text-blue-700">{selectedBooking.special_instructions}</p>
              </div>
            )}

            {/* 예약 일시 */}
            <div className="text-center text-sm text-gray-500">
              {format(new Date(selectedBooking.created_at), 'yyyy.MM.dd HH:mm', { locale: ko })} 예약
            </div>

            {/* 액션 버튼들 */}
            <div className="space-y-3">
              {canCancelBooking(selectedBooking) && (
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                >
                  예약 취소
                </Button>
              )}
              
              {selectedBooking.status === 'completed' && (
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  onClick={() => {
                    handleCloseBottomSheet()
                    router.push('/knife-request')
                  }}
                >
                  재주문하기
                </Button>
              )}
            </div>
          </div>
        )}
      </BottomSheet>
    </>
  )
}