import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService, type Notification } from '@/lib/notification-service'
import { useAuthStore } from '@/stores/auth-store'

// Query Keys
export const notificationKeys = {
  all: ['notifications'] as const,
  list: (userId: string) => [...notificationKeys.all, 'list', userId] as const,
  unreadCount: (userId: string) => [...notificationKeys.all, 'unread', userId] as const,
}

// 알림 목록 조회
export function useNotifications() {
  const { user, isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: notificationKeys.list(user?.id || ''),
    queryFn: () => {
      if (!user?.id) return []
      return notificationService.getUserNotifications(user.id)
    },
    enabled: isAuthenticated && !!user?.id,
    refetchInterval: 10000, // 10초마다 새 알림 확인
    refetchIntervalInBackground: true, // 백그라운드에서도 계속 확인
  })
}

// 읽지 않은 알림 개수
export function useUnreadNotificationCount() {
  const { data: notifications = [] } = useNotifications()
  
  return {
    count: notifications.filter(n => !n.is_read).length,
    hasUnread: notifications.some(n => !n.is_read)
  }
}

// 알림 읽음 처리
export function useMarkAsRead() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: (notificationId: string) => {
      if (!user?.id) throw new Error('User not authenticated')
      return notificationService.markAsRead(notificationId, user.id)
    },
    onMutate: async (notificationId) => {
      // 이전 데이터 백업
      await queryClient.cancelQueries({
        queryKey: notificationKeys.list(user?.id || '')
      })
      
      const previousNotifications = queryClient.getQueryData(
        notificationKeys.list(user?.id || '')
      )
      
      // Optimistic update: 즉시 읽음 처리
      queryClient.setQueryData(
        notificationKeys.list(user?.id || ''),
        (old: Notification[] = []) => {
          return old.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true }
              : notification
          )
        }
      )
      
      return { previousNotifications }
    },
    onError: (err, notificationId, context) => {
      // 에러 시 롤백
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          notificationKeys.list(user?.id || ''),
          context.previousNotifications
        )
      }
    },
    onSettled: () => {
      // 서버와 동기화
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(user?.id || '')
      })
    }
  })
}

// 모든 알림 읽음 처리
export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: () => {
      if (!user?.id) throw new Error('User not authenticated')
      return notificationService.markAllAsRead(user.id)
    },
    onMutate: async () => {
      // 이전 데이터 백업
      await queryClient.cancelQueries({
        queryKey: notificationKeys.list(user?.id || '')
      })
      
      const previousNotifications = queryClient.getQueryData(
        notificationKeys.list(user?.id || '')
      )
      
      // Optimistic update: 모든 알림 즉시 읽음 처리
      queryClient.setQueryData(
        notificationKeys.list(user?.id || ''),
        (old: Notification[] = []) => {
          return old.map(notification => ({ 
            ...notification, 
            is_read: true 
          }))
        }
      )
      
      return { previousNotifications }
    },
    onError: (err, _, context) => {
      // 에러 시 롤백
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          notificationKeys.list(user?.id || ''),
          context.previousNotifications
        )
      }
    },
    onSettled: () => {
      // 서버와 동기화
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(user?.id || '')
      })
    }
  })
}

// 알림 삭제
export function useDeleteNotification() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: (notificationId: string) => {
      if (!user?.id) throw new Error('User not authenticated')
      // notificationService에 delete 메서드가 없다면 추가 필요
      return notificationService.deleteNotification?.(notificationId, user.id) 
        || Promise.resolve()
    },
    onMutate: async (notificationId) => {
      // 이전 데이터 백업
      await queryClient.cancelQueries({
        queryKey: notificationKeys.list(user?.id || '')
      })
      
      const previousNotifications = queryClient.getQueryData(
        notificationKeys.list(user?.id || '')
      )
      
      // Optimistic update: 즉시 삭제
      queryClient.setQueryData(
        notificationKeys.list(user?.id || ''),
        (old: Notification[] = []) => {
          return old.filter(notification => notification.id !== notificationId)
        }
      )
      
      return { previousNotifications }
    },
    onError: (err, notificationId, context) => {
      // 에러 시 롤백
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          notificationKeys.list(user?.id || ''),
          context.previousNotifications
        )
      }
    },
    onSettled: () => {
      // 서버와 동기화
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(user?.id || '')
      })
    }
  })
}