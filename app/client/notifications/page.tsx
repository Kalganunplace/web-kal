"use client"

import TopBanner from "@/components/ui/top-banner"
import { BodyMedium, BodySmall, BodyXSmall } from "@/components/ui/typography"
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
  useUnreadNotificationCount
} from '@/hooks/queries/use-notification'
import { format } from 'date-fns'
import { useState } from 'react'

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications()
  const { count: unreadCount } = useUnreadNotificationCount()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const handleExpand = (notificationId: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      newSet.add(notificationId)
      return newSet
    })
    // 읽음 처리
    if (!notifications.find(n => n.id === notificationId && n.is_read)) {
      markAsRead.mutate(notificationId)
    }
  }

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return
    markAllAsRead.mutate()
  }

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'yyyy.MM.dd')
  }

  // 예상 배송 시간 포맷
  const formatDeliveryTime = (notification: any) => {
    if (notification.estimated_delivery_time) {
      const date = new Date(notification.estimated_delivery_time)
      return format(date, 'yyyy.MM.dd HH:mm')
    }
    return null
  }

  const isExpanded = (notificationId: string) => {
    return expandedIds.has(notificationId)
  }

  // 알림 제목 기준으로 아이콘 매핑
  const getNotificationIcon = (title: string) => {
    if (title.includes('배송')) return '/icons/Icon_Delivery.png'
    if (title.includes('접수') || title.includes('예약')) return '/icons/Icon_Calendar.png'
    if (title.includes('확정') || title.includes('입금')) return '/icons/Icon_Check.png'
    if (title.includes('완료')) return '/icons/Icon_Check.png'
    if (title.includes('취소')) return '/icons/Icon_Check.png'
    if (title.includes('연마') || title.includes('칼갈이')) return '/icons/Icon_Knife_Board.png'
    if (title.includes('픽업') || title.includes('수거')) return '/icons/Icon_Box.png'
    if (title.includes('결제')) return '/icons/Icon_Card.png'
    if (title.includes('쿠폰') || title.includes('이벤트')) return '/icons/Icon_Gift.png'
    return '/icons/Icon_Bell.png'
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
      <div className="flex-1">
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
                className="bg-white p-4 shadow-[0px_5px_30px_0px_rgba(0,0,0,0.1)]"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <img src={getNotificationIcon(notification.title)} alt="" className="w-5 h-5" />
                    <BodyMedium color="#333333" className="font-bold">
                      {notification.title}
                    </BodyMedium>
                  </div>
                  <BodyXSmall color={notification.is_read ? "#767676" : "#E67E22"}>
                    {notification.is_read ? '읽음' : '안읽음'}
                  </BodyXSmall>
                </div>

                {/* Date */}
                <div className="mb-3 ml-7">
                  <BodyXSmall color="#767676">
                    {formatNotificationDate(notification.created_at)}
                  </BodyXSmall>
                </div>

                {/* Collapsed State - 자세히보기 버튼 */}
                {!isExpanded(notification.id) ? (
                  <div className="border-t border-[#B0B0B0] pt-3">
                    <button
                      onClick={() => handleExpand(notification.id)}
                      className="w-full text-center"
                    >
                      <BodySmall color="#767676">자세히보기</BodySmall>
                    </button>
                  </div>
                ) : (
                  // Expanded State - 메시지 내용 (흰 배경, 구분선)
                  <div className="border-t border-[#F0F0F0] pt-4">
                    <div className="flex flex-col items-center text-center gap-1">
                      <BodyMedium color="#333333" className="font-bold">
                        {notification.title}
                      </BodyMedium>
                      <BodySmall color="#767676">
                        {notification.message}
                      </BodySmall>
                      {/* TODO: 예상 배송 시간 데이터 연동 후 활성화
                      <BodySmall color="#E67E22">
                        예상 배송 시간: {formatDeliveryTime(notification) || '확인 중'}
                      </BodySmall>
                      */}
                    </div>
                  </div>
                )}
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
