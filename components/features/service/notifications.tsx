"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import BottomSheet from "@/components/ui/bottom-sheet"
import { Loader2, ChevronLeft, Bell, User, AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import { notificationService, type Notification } from "@/lib/notification-service"
import { useAuthStore } from "@/stores/auth-store"
import { useAuthModal } from "@/contexts/auth-modal-context"

export default function Notifications() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { openModal } = useAuthModal()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false)

  // 데이터 로드
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setIsLoading(false)
      return
    }

    loadNotifications()
  }, [isAuthenticated, user?.id])

  const loadNotifications = async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      
      const [notificationsData, unreadCountData] = await Promise.all([
        notificationService.getUserNotifications(user.id),
        notificationService.getUnreadCount(user.id)
      ])
      
      setNotifications(notificationsData)
      setUnreadCount(unreadCountData)
    } catch (error) {
      console.error('알림 로드 실패:', error)
      toast.error('알림을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!user?.id) return

    try {
      // 읽지 않은 알림이면 읽음 처리
      if (!notification.is_read) {
        await notificationService.markAsRead(notification.id, user.id)
        
        // 로컬 상태 업데이트
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      
      setSelectedNotification(notification)
      setIsBottomSheetOpen(true)
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error)
      toast.error('알림 처리 중 오류가 발생했습니다.')
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user?.id || unreadCount === 0) return

    try {
      setIsMarkingAllRead(true)
      await notificationService.markAllAsRead(user.id)
      
      // 로컬 상태 업데이트
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      )
      setUnreadCount(0)
      
      toast.success('모든 알림을 읽음 처리했습니다.')
    } catch (error) {
      console.error('전체 읽음 처리 실패:', error)
      toast.error('전체 읽음 처리 중 오류가 발생했습니다.')
    } finally {
      setIsMarkingAllRead(false)
    }
  }

  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false)
    setSelectedNotification(null)
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
            <h1 className="text-lg font-medium">알림</h1>
            <div className="w-6" />
          </div>

          {/* 비로그인 안내 */}
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">로그인이 필요해요</h3>
            <p className="text-sm text-gray-600 mb-6">
              알림을 확인하려면 로그인해 주세요.
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
            <h1 className="text-lg font-medium">알림</h1>
            <div className="w-6" />
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            {/* 헤더 */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">
                {unreadCount > 0 ? `안읽은 알림 ${unreadCount}개` : '모든 알림을 확인했습니다'}
              </span>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAllRead}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  {isMarkingAllRead ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    '전체 읽음'
                  )}
                </Button>
              )}
            </div>

            {/* 알림 목록 */}
            {notifications.length > 0 ? (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`cursor-pointer transition-all duration-200 ${
                      !notification.is_read 
                        ? 'border-orange-200 bg-orange-50 hover:bg-orange-100' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`text-2xl flex-shrink-0 ${
                          notificationService.getNotificationColor(notification.type) === 'orange' 
                            ? 'text-orange-500' 
                            : notificationService.getNotificationColor(notification.type) === 'blue'
                            ? 'text-blue-500'
                            : notificationService.getNotificationColor(notification.type) === 'purple'
                            ? 'text-purple-500'
                            : 'text-gray-500'
                        }`}>
                          {notificationService.getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                            )}
                            <h4 className="text-sm font-medium text-gray-800 truncate">
                              {notification.title}
                            </h4>
                          </div>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {notificationService.formatNotificationTime(notification.created_at)}
                            </span>
                            {notification.is_read && (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // 알림이 없을 때
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">아직 받은 알림이 없습니다</h3>
                <p className="text-sm text-gray-600 mb-6">
                  칼갈이 서비스를 이용하시면<br />
                  진행 상황을 알림으로 받아보실 수 있어요
                </p>
                <Button
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={() => router.push('/client/knife-request')}
                >
                  칼갈이 신청하기
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 알림 상세 바텀시트 */}
      <BottomSheet isOpen={isBottomSheetOpen} onClose={handleCloseBottomSheet}>
        {selectedNotification && (
          <div className="p-6 space-y-4">
            {/* 알림 헤더 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="text-3xl">
                  {notificationService.getNotificationIcon(selectedNotification.type)}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800">{selectedNotification.title}</h3>
            </div>

            {/* 알림 내용 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">
                {selectedNotification.message}
              </p>
            </div>

            {/* 배송 예상 시간 */}
            {selectedNotification.estimated_delivery_time && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">📅 예상 배송 시간</h4>
                <p className="text-blue-700">
                  {notificationService.formatDeliveryTime(selectedNotification.estimated_delivery_time)}
                </p>
              </div>
            )}

            {/* 알림 시간 */}
            <div className="text-center">
              <span className="text-sm text-gray-500">
                {notificationService.formatNotificationTime(selectedNotification.created_at)}
              </span>
            </div>

            {/* 예약 관련 알림이면 이용내역으로 이동 버튼 */}
            {selectedNotification.related_booking_id && (
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-3 mt-6"
                onClick={() => {
                  handleCloseBottomSheet()
                  router.push('/client/usage-history')
                }}
              >
                이용내역 보기
              </Button>
            )}
          </div>
        )}
      </BottomSheet>
    </>
  )
}