import { createClient } from '@/lib/auth/supabase'

export interface DashboardStats {
  total_bookings: number
  completed_bookings: number
  total_users: number
  active_coupons: number
  used_coupons: number
  average_rating: number
  total_reviews: number
  total_revenue: number
  notifications_today: number
}

export interface BookingManagement {
  id: string
  user_id: string
  booking_date: string
  booking_time: string
  status: string
  total_amount: number
  total_quantity: number
  special_instructions?: string
  created_at: string
  user?: {
    name?: string
    email?: string
    phone?: string
  }
  address?: {
    address: string
    detail_address?: string
  }
  booking_items?: Array<{
    knife_type?: { name: string }
    quantity: number
    unit_price: number
  }>
}

export interface UserManagement {
  id: string
  name?: string
  email?: string
  phone?: string
  total_orders: number
  total_spent: number
  last_order_date?: string
  created_at: string
  is_active: boolean
}

export class AdminService {
  private supabase = createClient()

  // 대시보드 통계
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const { data, error } = await this.supabase
        .from('admin_dashboard_stats')
        .select('*')
        .single()

      if (error) {
        console.error('대시보드 통계 조회 오류:', error)
        // 뷰가 없으면 직접 계산
        return await this.calculateDashboardStats()
      }

      return data
    } catch (error) {
      console.error('대시보드 통계 오류:', error)
      return await this.calculateDashboardStats()
    }
  }

  private async calculateDashboardStats(): Promise<DashboardStats> {
    try {
      const [
        bookingsResult,
        completedBookingsResult,
        usersResult,
        activeCouponsResult,
        usedCouponsResult,
        reviewsResult,
        revenueResult,
        notificationsResult
      ] = await Promise.all([
        this.supabase.from('bookings').select('id', { count: 'exact', head: true }),
        this.supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        this.supabase.from('users').select('id', { count: 'exact', head: true }),
        this.supabase.from('coupons').select('id', { count: 'exact', head: true }).eq('is_active', true),
        this.supabase.from('user_coupons').select('id', { count: 'exact', head: true }).eq('is_used', true),
        this.supabase.from('reviews').select('rating'),
        this.supabase.from('bookings').select('total_amount').eq('status', 'completed'),
        this.supabase.from('notifications').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ])

      const averageRating = reviewsResult.data && reviewsResult.data.length > 0
        ? reviewsResult.data.reduce((sum, review) => sum + review.rating, 0) / reviewsResult.data.length
        : 0

      const totalRevenue = revenueResult.data?.reduce((sum, booking) => sum + booking.total_amount, 0) || 0

      return {
        total_bookings: bookingsResult.count || 0,
        completed_bookings: completedBookingsResult.count || 0,
        total_users: usersResult.count || 0,
        active_coupons: activeCouponsResult.count || 0,
        used_coupons: usedCouponsResult.count || 0,
        average_rating: Math.round(averageRating * 10) / 10,
        total_reviews: reviewsResult.data?.length || 0,
        total_revenue: totalRevenue,
        notifications_today: notificationsResult.count || 0
      }
    } catch (error) {
      console.error('통계 계산 오류:', error)
      throw new Error('대시보드 통계를 계산할 수 없습니다.')
    }
  }

  // 예약 관리
  async getBookings(options: {
    page?: number
    limit?: number
    status?: string
    dateFrom?: string
    dateTo?: string
  } = {}): Promise<{ bookings: BookingManagement[]; totalCount: number }> {
    const { page = 1, limit = 20, status, dateFrom, dateTo } = options

    let query = this.supabase
      .from('bookings')
      .select(`
        *,
        user:users(name, email, phone),
        address:addresses!bookings_address_id_fkey(address, detail_address),
        booking_items(
          quantity, unit_price,
          knife_type:knife_types(name)
        )
      `, { count: 'exact' })

    if (status) {
      query = query.eq('status', status)
    }

    if (dateFrom) {
      query = query.gte('booking_date', dateFrom)
    }

    if (dateTo) {
      query = query.lte('booking_date', dateTo)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error('예약 목록 조회 오류:', error)
      throw new Error('예약 목록을 불러올 수 없습니다.')
    }

    return {
      bookings: data || [],
      totalCount: count || 0
    }
  }

  async updateBookingStatus(bookingId: string, status: string, adminNote?: string): Promise<void> {
    const { error } = await this.supabase
      .from('bookings')
      .update({
        status,
        admin_note: adminNote,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)

    if (error) {
      console.error('예약 상태 업데이트 오류:', error)
      throw new Error('예약 상태를 업데이트할 수 없습니다.')
    }
  }

  // 사용자 관리
  async getUsers(options: {
    page?: number
    limit?: number
    search?: string
    sortBy?: 'created_at' | 'total_orders' | 'total_spent'
  } = {}): Promise<{ users: UserManagement[]; totalCount: number }> {
    const { page = 1, limit = 20, search, sortBy = 'created_at' } = options

    // 서브쿼리로 사용자별 주문 통계 계산
    const { data, error, count } = await this.supabase
      .rpc('get_user_management_data', {
        page_number: page,
        page_size: limit,
        search_term: search || '',
        sort_column: sortBy
      })

    if (error) {
      console.error('사용자 목록 조회 오류:', error)
      throw new Error('사용자 목록을 불러올 수 없습니다.')
    }

    return {
      users: data || [],
      totalCount: count || 0
    }
  }

  async toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('사용자 상태 업데이트 오류:', error)
      throw new Error('사용자 상태를 업데이트할 수 없습니다.')
    }
  }

  // 쿠폰 관리
  async getCoupons(page: number = 1, limit: number = 20): Promise<{ coupons: any[]; totalCount: number }> {
    const { data, error, count } = await this.supabase
      .from('coupons')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error('쿠폰 목록 조회 오류:', error)
      throw new Error('쿠폰 목록을 불러올 수 없습니다.')
    }

    return {
      coupons: data || [],
      totalCount: count || 0
    }
  }

  async toggleCouponStatus(couponId: string, isActive: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('coupons')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', couponId)

    if (error) {
      console.error('쿠폰 상태 업데이트 오류:', error)
      throw new Error('쿠폰 상태를 업데이트할 수 없습니다.')
    }
  }

  // 리뷰 관리
  async getReviews(options: {
    page?: number
    limit?: number
    featured?: boolean
    minRating?: number
  } = {}): Promise<{ reviews: any[]; totalCount: number }> {
    const { page = 1, limit = 20, featured, minRating } = options

    let query = this.supabase
      .from('reviews')
      .select(`
        *,
        user:users(name, email),
        booking:bookings(booking_date, total_amount)
      `, { count: 'exact' })

    if (featured !== undefined) {
      query = query.eq('is_featured', featured)
    }

    if (minRating) {
      query = query.gte('rating', minRating)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error('리뷰 목록 조회 오류:', error)
      throw new Error('리뷰 목록을 불러올 수 없습니다.')
    }

    return {
      reviews: data || [],
      totalCount: count || 0
    }
  }

  async toggleReviewFeatured(reviewId: string, isFeatured: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('reviews')
      .update({
        is_featured: isFeatured,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)

    if (error) {
      console.error('리뷰 상태 업데이트 오류:', error)
      throw new Error('리뷰 상태를 업데이트할 수 없습니다.')
    }
  }

  // 알림 관리
  async sendBulkNotification(data: {
    title: string
    message: string
    type: string
    user_ids?: string[]  // 특정 사용자들에게만 보낼 경우
  }): Promise<void> {
    try {
      let userIds: string[] = []

      if (data.user_ids && data.user_ids.length > 0) {
        userIds = data.user_ids
      } else {
        // 전체 사용자에게 발송
        const { data: users, error } = await this.supabase
          .from('users')
          .select('id')
          .eq('is_active', true)

        if (error) throw error
        userIds = users?.map(user => user.id) || []
      }

      // 각 사용자에게 알림 생성
      const notifications = userIds.map(userId => ({
        user_id: userId,
        title: data.title,
        message: data.message,
        type: data.type,
        is_read: false
      }))

      const { error: insertError } = await this.supabase
        .from('notifications')
        .insert(notifications)

      if (insertError) {
        console.error('대량 알림 발송 오류:', insertError)
        throw new Error('알림 발송 중 오류가 발생했습니다.')
      }

    } catch (error) {
      console.error('대량 알림 발송 실패:', error)
      throw new Error('알림을 발송할 수 없습니다.')
    }
  }

  // 통계 및 분석
  async getBookingTrends(days: number = 30): Promise<Array<{
    date: string
    bookings: number
    revenue: number
  }>> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await this.supabase
      .from('bookings')
      .select('booking_date, total_amount, status')
      .gte('booking_date', startDate.toISOString().split('T')[0])
      .order('booking_date')

    if (error) {
      console.error('예약 트렌드 조회 오류:', error)
      throw new Error('통계 데이터를 불러올 수 없습니다.')
    }

    // 날짜별로 그룹화
    const trendMap = new Map<string, { bookings: number; revenue: number }>()
    
    data?.forEach(booking => {
      const date = booking.booking_date
      const existing = trendMap.get(date) || { bookings: 0, revenue: 0 }
      
      existing.bookings++
      if (booking.status === 'completed') {
        existing.revenue += booking.total_amount
      }
      
      trendMap.set(date, existing)
    })

    return Array.from(trendMap.entries()).map(([date, stats]) => ({
      date,
      ...stats
    }))
  }

  // 유틸리티 메소드
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount)
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    })
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800'
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'pending': '접수 대기',
      'confirmed': '접수 완료',
      'in_progress': '작업 중',
      'completed': '완료',
      'cancelled': '취소됨'
    }
    return statusLabels[status] || status
  }
}

export const adminService = new AdminService()