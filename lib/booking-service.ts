import { createClient } from '@/lib/auth/supabase'

export interface Booking {
  id: string
  user_id: string
  booking_date: string
  booking_time: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  total_quantity: number
  total_amount: number
  special_instructions?: string
  created_at: string
  updated_at: string
  booking_items?: BookingItem[]
}

export interface BookingItem {
  id: string
  booking_id: string
  knife_type_id: string
  quantity: number
  unit_price: number
  total_price: number
  knife_type?: KnifeType
}

export interface KnifeType {
  id: string
  name: string
  description?: string
  image_url?: string
  market_price: number
  discount_price: number
  care_instructions?: string
  additional_notes?: string
  is_active: boolean
  display_order: number
}

export interface CreateBookingData {
  booking_date: string
  booking_time: string
  items: {
    knife_type_id: string
    quantity: number
  }[]
  special_instructions?: string
}

export class BookingService {
  private supabase = createClient()

  async createBooking(userId: string, bookingData: CreateBookingData): Promise<Booking> {
    // 1. 칼 종류별 가격 조회
    const knifeTypeIds = bookingData.items.map(item => item.knife_type_id)
    const { data: knifeTypes, error: knifeError } = await this.supabase
      .from('knife_types')
      .select('*')
      .in('id', knifeTypeIds)
      .eq('is_active', true)

    if (knifeError) {
      console.error('칼 종류 조회 오류:', knifeError)
      throw new Error('칼 종류를 조회할 수 없습니다.')
    }

    // 2. 총 수량 및 금액 계산
    let totalQuantity = 0
    let totalAmount = 0
    const bookingItems = []

    for (const item of bookingData.items) {
      const knifeType = knifeTypes?.find(kt => kt.id === item.knife_type_id)
      if (!knifeType) {
        throw new Error(`칼 종류를 찾을 수 없습니다: ${item.knife_type_id}`)
      }

      const itemTotalPrice = knifeType.discount_price * item.quantity
      totalQuantity += item.quantity
      totalAmount += itemTotalPrice

      bookingItems.push({
        knife_type_id: item.knife_type_id,
        quantity: item.quantity,
        unit_price: knifeType.discount_price,
        total_price: itemTotalPrice
      })
    }

    // 3. 예약 생성
    const { data: booking, error: bookingError } = await this.supabase
      .from('bookings')
      .insert({
        user_id: userId,
        booking_date: bookingData.booking_date,
        booking_time: bookingData.booking_time,
        total_quantity: totalQuantity,
        total_amount: totalAmount,
        special_instructions: bookingData.special_instructions,
        status: 'pending'
      })
      .select()
      .single()

    if (bookingError) {
      console.error('예약 생성 오류:', bookingError)
      throw new Error('예약을 생성할 수 없습니다.')
    }

    // 4. 예약 상세 항목 생성
    const itemsWithBookingId = bookingItems.map(item => ({
      ...item,
      booking_id: booking.id
    }))

    const { data: createdItems, error: itemsError } = await this.supabase
      .from('booking_items')
      .insert(itemsWithBookingId)
      .select()

    if (itemsError) {
      console.error('예약 항목 생성 오류:', itemsError)
      // 예약도 함께 삭제
      await this.supabase.from('bookings').delete().eq('id', booking.id)
      throw new Error('예약 항목을 생성할 수 없습니다.')
    }

    // 5. 알림 생성
    await this.createBookingNotification(userId, booking.id, 'booking')

    return {
      ...booking,
      booking_items: createdItems
    }
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        booking_items (
          *,
          knife_type:knife_types (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('예약 목록 조회 오류:', error)
      throw new Error('예약 목록을 불러올 수 없습니다.')
    }

    return data || []
  }

  async getBookingById(bookingId: string, userId: string): Promise<Booking | null> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        booking_items (
          *,
          knife_type:knife_types (*)
        )
      `)
      .eq('id', bookingId)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('예약 조회 오류:', error)
      throw new Error('예약을 조회할 수 없습니다.')
    }

    return data
  }

  async updateBookingStatus(bookingId: string, status: Booking['status'], userId?: string): Promise<void> {
    const query = this.supabase
      .from('bookings')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', bookingId)

    if (userId) {
      query.eq('user_id', userId)
    }

    const { error } = await query

    if (error) {
      console.error('예약 상태 업데이트 오류:', error)
      throw new Error('예약 상태를 업데이트할 수 없습니다.')
    }

    // 상태 변경에 따른 알림 생성
    if (userId && status === 'confirmed') {
      await this.createBookingNotification(userId, bookingId, 'booking')
    }
  }

  async cancelBooking(bookingId: string, userId: string): Promise<void> {
    await this.updateBookingStatus(bookingId, 'cancelled', userId)
  }

  private async createBookingNotification(userId: string, bookingId: string, type: 'booking' | 'delivery'): Promise<void> {
    const notificationMessages = {
      booking: {
        title: '예약이 접수되었습니다!',
        message: '칼갈이 예약이 정상적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.'
      },
      delivery: {
        title: '칼이 배송중입니다!',
        message: '연마완료 안전하게 배송중이예요!'
      }
    }

    const notification = notificationMessages[type]

    const { error } = await this.supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: notification.title,
        message: notification.message,
        type,
        related_booking_id: bookingId,
        is_read: false
      })

    if (error) {
      console.error('알림 생성 오류:', error)
      // 알림 생성 실패는 예약 생성을 막지 않음
    }
  }
}

export const bookingService = new BookingService()