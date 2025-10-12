"use client"

import MainLayout from "@/components/common/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { format, formatRelative } from 'date-fns'
import { ko } from 'date-fns/locale'
import { 
  useNotifications, 
  useUnreadNotificationCount,
  useMarkAsRead,
  useMarkAllAsRead 
} from '@/hooks/queries/use-notification'

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications()
  const { count: unreadCount } = useUnreadNotificationCount()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  const handleMarkAsRead = (notificationId: string) => {
    if (!notifications.find(n => n.id === notificationId && !n.is_read)) return
    markAsRead.mutate(notificationId)
  }

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return
    markAllAsRead.mutate()
  }

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    // 오늘이면 시:분만 표시
    if (diffInDays === 0) {
      return format(date, 'HH:mm', { locale: ko })
    }

    // 7일 이내면 요일과 시:분 표시
    if (diffInDays < 7) {
      const dayOfWeek = format(date, 'EEEE', { locale: ko })
      const time = format(date, 'HH:mm', { locale: ko })
      return `지난 ${dayOfWeek} ${time}`
    }

    // 그 이상이면 날짜와 시:분 표시
    return format(date, 'MM.dd HH:mm', { locale: ko })
  }

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'yyyy.MM.dd', { locale: ko })
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <h1 className="text-lg font-medium text-center">알림</h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600">
            {unreadCount > 0 ? `안읽은 알림 ${unreadCount}개` : '모든 알림을 확인했습니다'}
          </span>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="text-sm text-orange-500"
            >
              전체 읽기
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
            <p className="text-gray-500 text-sm">알림을 불러오는 중...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`${notification.is_read ? 'border-gray-100' : 'border-orange-100'} bg-white cursor-pointer`}
                onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {!notification.is_read && (
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        )}
                        <span className={`${notification.is_read ? 'text-gray-600' : 'text-orange-600'} font-medium text-sm`}>
                          {notification.title}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatNotificationDate(notification.created_at)}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatNotificationTime(notification.created_at)}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-700">{notification.message}</p>
                    {notification.type === 'delivery' && (
                      <p className="text-xs text-orange-600 mt-2">
                        칼이 안전하게 배송 중입니다
                      </p>
                    )}
                    {notification.type === 'booking' && (
                      <p className="text-xs text-blue-600 mt-2">
                        예약이 확정되었습니다
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🔔</span>
            </div>
            <p className="text-gray-500 text-sm">알림이 없습니다</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
