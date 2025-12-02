"use client"

import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, BodySmall, BodyXSmall } from "@/components/ui/typography"
import { format } from 'date-fns'
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

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'yyyy.MM.dd')
  }

  // 예상 배송 시간 포맷 (알림 메타데이터에서 가져오거나 기본값)
  const formatDeliveryTime = (notification: any) => {
    if (notification.metadata?.estimated_delivery) {
      const date = new Date(notification.metadata.estimated_delivery)
      return format(date, 'yyyy.MM.dd HH:mm')
    }
    return null
  }

  return (
    <>
      <TopBanner title="알림" />

      {/* Subheader */}
      <div className="flex justify-between items-center px-5 py-4">
        <BodySmall color="#767676">
          안읽은 알림 {unreadCount}개
        </BodySmall>
        <button
          onClick={handleMarkAllAsRead}
          className="text-sm text-[#767676]"
        >
          전체 읽음
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#E67E22] border-t-transparent rounded-full animate-spin mb-4"></div>
            <BodySmall color="#767676">알림을 불러오는 중...</BodySmall>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-white rounded-xl p-4 cursor-pointer"
                onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {!notification.is_read && (
                      <span className="w-2 h-2 bg-[#E67E22] rounded-full flex-shrink-0"></span>
                    )}
                    <BodyMedium color="#333333" className="font-bold">
                      {notification.title}
                    </BodyMedium>
                  </div>
                  <BodyXSmall color="#767676">
                    {notification.is_read ? '읽음' : ''}
                  </BodyXSmall>
                </div>

                {/* Date */}
                <div className="mb-3">
                  <BodyXSmall color="#767676">
                    {formatNotificationDate(notification.created_at)}
                  </BodyXSmall>
                </div>

                {/* Message Content */}
                <div className="bg-[#F8F8F8] rounded-lg p-4">
                  <BodyMedium color="#333333" className="font-bold mb-1">
                    {notification.title}
                  </BodyMedium>
                  <BodySmall color="#767676">
                    {notification.message}
                  </BodySmall>

                  {/* Delivery Time if applicable */}
                  {notification.type === 'delivery' && (
                    <BodySmall color="#E67E22" className="mt-2">
                      예상 배송 시간: {formatDeliveryTime(notification) || '확인 중'}
                    </BodySmall>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🔔</span>
            </div>
            <BodySmall color="#767676">알림이 없습니다</BodySmall>
          </div>
        )}
      </div>

      {/* Bottom Safe Area */}
      <div className="h-20" />
    </>
  )
}
