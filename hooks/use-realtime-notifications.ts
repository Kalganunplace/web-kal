import { useEffect } from 'react'
import { createClient } from '@/lib/auth/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Supabase Realtime을 사용하여 실시간 알림을 수신하는 Hook
 *
 * @param userId - 현재 로그인한 사용자 ID
 *
 * 기능:
 * 1. notifications 테이블의 INSERT 이벤트를 실시간 구독
 * 2. 새 알림이 생성되면 React Query 캐시 무효화 (자동 재조회)
 * 3. 브라우저 알림 표시 (권한이 있는 경우)
 * 4. Toast 메시지 표시
 *
 * 사용법:
 * ```typescript
 * const { user } = useIsAuthenticated()
 * useRealtimeNotifications(user?.id)
 * ```
 */
export function useRealtimeNotifications(userId?: string) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    if (!userId) {
      console.log('[Realtime] No userId, skipping subscription')
      return
    }

    console.log('[Realtime] Starting notification subscription for user:', userId)

    // Realtime 채널 생성 및 구독
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('[Realtime] New notification received:', payload.new)

          const notification = payload.new as any

          // 1. React Query 캐시 무효화 - 알림 목록 자동 재조회
          queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
          queryClient.invalidateQueries({ queryKey: ['unread-count', userId] })

          // 2. Toast 메시지 표시
          toast(notification.title, {
            description: notification.message,
            duration: 5000,
            // action: notification.related_booking_id ? {
            //   label: '확인',
            //   onClick: () => {
            //     // 알림 관련 페이지로 이동
            //     window.location.href = `/client/usage-history`
            //   }
            // } : undefined
          })

          // 3. 브라우저 알림 표시 (권한이 있는 경우)
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(notification.title, {
                body: notification.message,
                icon: '/logo.png',
                badge: '/logo.png',
                tag: notification.id, // 같은 알림 중복 방지
                requireInteraction: false, // 자동으로 닫힘
              })
            } catch (error) {
              console.error('[Realtime] Failed to show browser notification:', error)
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status)
      })

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      console.log('[Realtime] Unsubscribing from notifications')
      supabase.removeChannel(channel)
    }
  }, [userId, queryClient, supabase])
}

/**
 * 브라우저 알림 권한을 요청하는 유틸리티 함수
 *
 * 사용법:
 * ```typescript
 * await requestNotificationPermission()
 * ```
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return 'denied'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission
  }

  return Notification.permission
}
