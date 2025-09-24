"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import BottomSheet from "@/components/ui/bottom-sheet"
import { 
  Loader2, ChevronLeft, BarChart3, Users, Calendar, 
  Ticket, Star, Won, Bell, Settings, Search,
  TrendingUp, Package, MessageCircle, Shield 
} from "lucide-react"
import { toast } from "sonner"

import { adminService, type DashboardStats, type BookingManagement } from "@/lib/admin-service"

export default function AdminDashboard() {
  const router = useRouter()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [bookings, setBookings] = useState<BookingManagement[]>([])
  const [selectedBooking, setSelectedBooking] = useState<BookingManagement | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [isSendingNotification, setIsSendingNotification] = useState(false)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)
  const [isNotificationSheetOpen, setIsNotificationSheetOpen] = useState(false)

  // 데이터 로드
  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    loadBookings()
  }, [statusFilter, searchTerm])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const statsData = await adminService.getDashboardStats()
      setStats(statsData)
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error)
      toast.error('대시보드 데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadBookings = async () => {
    try {
      setIsLoadingBookings(true)
      const bookingsData = await adminService.getBookings({
        status: statusFilter || undefined,
        limit: 50
      })
      
      let filteredBookings = bookingsData.bookings
      
      // 검색 필터링
      if (searchTerm) {
        const query = searchTerm.toLowerCase()
        filteredBookings = filteredBookings.filter(booking => 
          booking.user?.name?.toLowerCase().includes(query) ||
          booking.user?.email?.toLowerCase().includes(query) ||
          booking.user?.phone?.includes(query) ||
          booking.id.toLowerCase().includes(query)
        )
      }
      
      setBookings(filteredBookings)
    } catch (error) {
      console.error('예약 목록 로드 실패:', error)
      toast.error('예약 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoadingBookings(false)
    }
  }

  // 예약 상태 변경
  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await adminService.updateBookingStatus(bookingId, newStatus)
      toast.success('예약 상태가 업데이트되었습니다.')
      loadBookings()
      
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus })
      }
    } catch (error) {
      console.error('예약 상태 업데이트 실패:', error)
      toast.error('예약 상태를 업데이트할 수 없습니다.')
    }
  }

  // 알림 발송
  const sendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      toast.error('제목과 내용을 모두 입력해주세요.')
      return
    }

    try {
      setIsSendingNotification(true)
      await adminService.sendBulkNotification({
        title: notificationTitle,
        message: notificationMessage,
        type: 'general'
      })
      
      toast.success('전체 사용자에게 알림이 발송되었습니다.')
      setNotificationTitle('')
      setNotificationMessage('')
      setIsNotificationSheetOpen(false)
    } catch (error) {
      console.error('알림 발송 실패:', error)
      toast.error('알림 발송 중 오류가 발생했습니다.')
    } finally {
      setIsSendingNotification(false)
    }
  }

  // 예약 상세 보기
  const viewBookingDetail = (booking: BookingManagement) => {
    setSelectedBooking(booking)
    setIsBottomSheetOpen(true)
  }

  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false)
    setSelectedBooking(null)
  }

  // 통계 카드 컴포넌트
  const StatCard = ({ title, value, icon, color, subtext }: {
    title: string
    value: string | number
    icon: React.ReactNode
    color: string
    subtext?: string
  }) => (
    <Card className="border-l-4" style={{ borderLeftColor: color }}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
          </div>
          <div className="text-3xl" style={{ color }}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )

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
          <div className="flex items-center justify-between p-4 border-b bg-orange-500 text-white">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-white hover:bg-orange-600">
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-lg font-medium">관리자 대시보드</h1>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsNotificationSheetOpen(true)}
              className="text-white hover:bg-orange-600"
            >
              <Bell className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 pb-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="overview">개요</TabsTrigger>
                <TabsTrigger value="bookings">예약</TabsTrigger>
                <TabsTrigger value="users">사용자</TabsTrigger>
              </TabsList>

              {/* 개요 탭 */}
              <TabsContent value="overview" className="mt-0">
                {stats && (
                  <div className="space-y-4">
                    {/* 주요 통계 */}
                    <div className="grid grid-cols-2 gap-3">
                      <StatCard
                        title="총 예약"
                        value={stats.total_bookings}
                        icon={<Calendar />}
                        color="#3B82F6"
                        subtext={`완료: ${stats.completed_bookings}`}
                      />
                      <StatCard
                        title="총 회원"
                        value={stats.total_users}
                        icon={<Users />}
                        color="#10B981"
                      />
                      <StatCard
                        title="총 매출"
                        value={adminService.formatCurrency(stats.total_revenue)}
                        icon={<Won />}
                        color="#F59E0B"
                      />
                      <StatCard
                        title="평균 평점"
                        value={`${stats.average_rating} ⭐`}
                        icon={<Star />}
                        color="#EF4444"
                        subtext={`${stats.total_reviews}개 리뷰`}
                      />
                    </div>

                    {/* 추가 통계 */}
                    <div className="grid grid-cols-2 gap-3">
                      <StatCard
                        title="활성 쿠폰"
                        value={stats.active_coupons}
                        icon={<Ticket />}
                        color="#8B5CF6"
                        subtext={`사용됨: ${stats.used_coupons}`}
                      />
                      <StatCard
                        title="오늘 알림"
                        value={stats.notifications_today}
                        icon={<Bell />}
                        color="#EC4899"
                      />
                    </div>

                    {/* 빠른 액션 */}
                    <div className="mt-6">
                      <h3 className="font-medium text-gray-800 mb-3">빠른 작업</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsNotificationSheetOpen(true)}
                          className="flex items-center gap-2"
                        >
                          <Bell className="w-4 h-4" />
                          전체 알림
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <BarChart3 className="w-4 h-4" />
                          상세 통계
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* 예약 관리 탭 */}
              <TabsContent value="bookings" className="mt-0">
                <div className="space-y-4">
                  {/* 필터 및 검색 */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="상태 전체" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">전체</SelectItem>
                          <SelectItem value="pending">접수 대기</SelectItem>
                          <SelectItem value="confirmed">접수 완료</SelectItem>
                          <SelectItem value="in_progress">작업 중</SelectItem>
                          <SelectItem value="completed">완료</SelectItem>
                          <SelectItem value="cancelled">취소됨</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="고객명, 이메일, 전화번호로 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* 예약 목록 */}
                  {isLoadingBookings ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                    </div>
                  ) : bookings.length > 0 ? (
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                      {bookings.map((booking) => (
                        <Card 
                          key={booking.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => viewBookingDetail(booking)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <Badge className={adminService.getStatusColor(booking.status)}>
                                {adminService.getStatusLabel(booking.status)}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {adminService.formatDate(booking.created_at)}
                              </span>
                            </div>
                            
                            <div className="text-sm space-y-1">
                              <p className="font-medium text-gray-800">
                                {booking.user?.name || '고객명 없음'}
                              </p>
                              <p className="text-gray-600">
                                {new Date(booking.booking_date).toLocaleDateString('ko-KR')} {booking.booking_time.slice(0, 5)}
                              </p>
                              <p className="text-orange-600 font-medium">
                                {adminService.formatCurrency(booking.total_amount)}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-500">예약이 없습니다</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* 사용자 관리 탭 */}
              <TabsContent value="users" className="mt-0">
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">사용자 관리</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    사용자 관리 기능은 준비 중입니다
                  </p>
                  <Button variant="outline">
                    곧 출시됩니다
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* 예약 상세 바텀시트 */}
      <BottomSheet isOpen={isBottomSheetOpen} onClose={handleCloseBottomSheet}>
        {selectedBooking && (
          <div className="p-6 space-y-4">
            {/* 예약 헤더 */}
            <div className="text-center">
              <Badge className={adminService.getStatusColor(selectedBooking.status)}>
                {adminService.getStatusLabel(selectedBooking.status)}
              </Badge>
              <h3 className="text-xl font-bold text-gray-800 mt-2">예약 상세</h3>
              <p className="text-sm text-gray-500">#{selectedBooking.id.slice(0, 8)}</p>
            </div>

            {/* 고객 정보 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">👤 고객 정보</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>이름: {selectedBooking.user?.name || '정보 없음'}</p>
                <p>이메일: {selectedBooking.user?.email || '정보 없음'}</p>
                <p>전화번호: {selectedBooking.user?.phone || '정보 없음'}</p>
              </div>
            </div>

            {/* 예약 정보 */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">📅 예약 정보</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>날짜: {new Date(selectedBooking.booking_date).toLocaleDateString('ko-KR')}</p>
                <p>시간: {selectedBooking.booking_time.slice(0, 5)}</p>
                <p>수량: {selectedBooking.total_quantity}개</p>
                <p>금액: {adminService.formatCurrency(selectedBooking.total_amount)}</p>
              </div>
            </div>

            {/* 주문 항목 */}
            {selectedBooking.booking_items && selectedBooking.booking_items.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-purple-800 mb-2">🔪 주문 항목</h4>
                <div className="space-y-1">
                  {selectedBooking.booking_items.map((item, index) => (
                    <div key={index} className="text-sm text-purple-700 flex justify-between">
                      <span>{item.knife_type?.name || '칼'} x {item.quantity}</span>
                      <span>{adminService.formatCurrency(item.unit_price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 특별 요청사항 */}
            {selectedBooking.special_instructions && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">📝 특별 요청사항</h4>
                <p className="text-sm text-yellow-700">{selectedBooking.special_instructions}</p>
              </div>
            )}

            {/* 상태 변경 */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">상태 변경</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateBookingStatus(selectedBooking.id, 'confirmed')}
                  disabled={selectedBooking.status === 'confirmed'}
                  className="text-blue-600 border-blue-300"
                >
                  접수 완료
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateBookingStatus(selectedBooking.id, 'in_progress')}
                  disabled={selectedBooking.status === 'in_progress'}
                  className="text-purple-600 border-purple-300"
                >
                  작업 중
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateBookingStatus(selectedBooking.id, 'completed')}
                  disabled={selectedBooking.status === 'completed'}
                  className="text-green-600 border-green-300"
                >
                  완료
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateBookingStatus(selectedBooking.id, 'cancelled')}
                  disabled={selectedBooking.status === 'cancelled'}
                  className="text-red-600 border-red-300"
                >
                  취소
                </Button>
              </div>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* 전체 알림 발송 바텀시트 */}
      <BottomSheet isOpen={isNotificationSheetOpen} onClose={() => setIsNotificationSheetOpen(false)}>
        <div className="p-6 space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">전체 알림 발송</h3>
            <p className="text-sm text-gray-500 mt-1">모든 사용자에게 알림을 보냅니다</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
              <Input
                placeholder="알림 제목을 입력하세요"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
              <Textarea
                placeholder="알림 내용을 입력하세요"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={sendNotification}
              disabled={isSendingNotification || !notificationTitle.trim() || !notificationMessage.trim()}
            >
              {isSendingNotification && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSendingNotification ? '발송 중...' : '전체 알림 발송'}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsNotificationSheetOpen(false)}
            >
              취소
            </Button>
          </div>
        </div>
      </BottomSheet>
    </>
  )
}