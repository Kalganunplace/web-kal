import { createClient } from '@/lib/auth/supabase'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'booking' | 'delivery' | 'promotion' | 'general'
  is_read: boolean
  related_booking_id?: string
  estimated_delivery_time?: string
  created_at: string
}

export interface CreateNotificationData {
  user_id: string
  title: string
  message: string
  type?: 'booking' | 'delivery' | 'promotion' | 'general'
  related_booking_id?: string
  estimated_delivery_time?: string
}

export class NotificationService {
  private supabase = createClient()

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('알림 목록 조회 오류:', error)
      throw new Error('알림을 불러올 수 없습니다.')
    }

    return data || []
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('읽지 않은 알림 조회 오류:', error)
      throw new Error('읽지 않은 알림을 불러올 수 없습니다.')
    }

    return data || []
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('읽지 않은 알림 수 조회 오류:', error)
      return 0
    }

    return count || 0
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) {
      console.error('알림 읽음 처리 오류:', error)
      throw new Error('알림 상태를 업데이트할 수 없습니다.')
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('전체 알림 읽음 처리 오류:', error)
      throw new Error('전체 알림 상태를 업데이트할 수 없습니다.')
    }
  }

  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const { data: notification, error } = await this.supabase
      .from('notifications')
      .insert({
        user_id: data.user_id,
        title: data.title,
        message: data.message,
        type: data.type || 'general',
        related_booking_id: data.related_booking_id,
        estimated_delivery_time: data.estimated_delivery_time,
        is_read: false
      })
      .select()
      .single()

    if (error) {
      console.error('알림 생성 오류:', error)
      throw new Error('알림을 생성할 수 없습니다.')
    }

    return notification
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) {
      console.error('알림 삭제 오류:', error)
      throw new Error('알림을 삭제할 수 없습니다.')
    }
  }

  async getNotificationById(notificationId: string, userId: string): Promise<Notification | null> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('알림 조회 오류:', error)
      throw new Error('알림을 조회할 수 없습니다.')
    }

    return data
  }

  // 알림 타입별 템플릿
  generateNotificationContent(type: string, data: any): { title: string; message: string } {
    switch (type) {
      case 'booking_confirmed':
        return {
          title: '예약이 확정되었습니다!',
          message: `칼갈이 예약이 확정되었습니다. 예약 날짜: ${data.date || ''}`
        }
      
      case 'pickup_scheduled':
        return {
          title: '수거 예정 안내',
          message: `내일 ${data.time || ''}에 칼을 수거하러 방문예정입니다.`
        }
      
      case 'sharpening_started':
        return {
          title: '연마 작업 시작!',
          message: '전문 장인이 칼 연마 작업을 시작했습니다. 완료까지 1-2일 소요됩니다.'
        }
      
      case 'sharpening_completed':
        return {
          title: '연마 작업 완료!',
          message: '칼 연마가 완료되었습니다. 곧 안전하게 배송해드리겠습니다.'
        }
      
      case 'delivery_started':
        return {
          title: '칼이 배송중입니다!',
          message: '연마완료 안전하게 배송중이예요!'
        }
      
      case 'delivery_completed':
        return {
          title: '배송 완료!',
          message: '칼갈이 서비스가 완료되었습니다. 이용해 주셔서 감사합니다!'
        }
      
      case 'coupon_issued':
        return {
          title: '새로운 쿠폰이 발급되었습니다!',
          message: `${data.couponName || '할인 쿠폰'}이 발급되었습니다. 마이페이지에서 확인하세요.`
        }
      
      case 'promotion':
        return {
          title: data.title || '특별 이벤트 안내',
          message: data.message || '새로운 프로모션을 확인해보세요!'
        }
      
      default:
        return {
          title: data.title || '알림',
          message: data.message || '새로운 알림이 있습니다.'
        }
    }
  }

  // 알림 타입별 아이콘 반환
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'booking':
        return '📅'
      case 'delivery':
        return '🚚'
      case 'promotion':
        return '🎉'
      case 'general':
      default:
        return '📢'
    }
  }

  // 알림 타입별 색상 반환
  getNotificationColor(type: string): string {
    switch (type) {
      case 'booking':
        return 'blue'
      case 'delivery':
        return 'orange'
      case 'promotion':
        return 'purple'
      case 'general':
      default:
        return 'gray'
    }
  }

  // 시간 포맷팅
  formatNotificationTime(createdAt: string): string {
    const now = new Date()
    const notificationTime = new Date(createdAt)
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) {
      return '방금 전'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`
    } else if (diffInMinutes < 1440) { // 24시간
      const diffInHours = Math.floor(diffInMinutes / 60)
      return `${diffInHours}시간 전`
    } else if (diffInMinutes < 10080) { // 7일
      const diffInDays = Math.floor(diffInMinutes / 1440)
      return `${diffInDays}일 전`
    } else {
      return notificationTime.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      })
    }
  }

  // 배송 예상 시간 포맷팅
  formatDeliveryTime(deliveryTime?: string): string {
    if (!deliveryTime) return ''
    
    const date = new Date(deliveryTime)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    })
  }
}

export const notificationService = new NotificationService()