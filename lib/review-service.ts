import { createClient } from '@/lib/auth/supabase'

export interface Review {
  id: string
  user_id: string
  booking_id: string
  rating: number
  comment?: string
  service_quality_rating?: number
  delivery_rating?: number
  value_rating?: number
  photos?: string[]
  is_anonymous: boolean
  is_verified: boolean
  is_featured: boolean
  helpful_count: number
  created_at: string
  updated_at: string
  
  // Relations
  user?: {
    id: string
    name?: string
    email?: string
  }
  booking?: {
    id: string
    booking_date: string
    total_amount: number
    booking_items?: Array<{
      knife_type?: {
        name: string
      }
      quantity: number
    }>
  }
}

export interface CreateReviewData {
  booking_id: string
  rating: number
  comment?: string
  service_quality_rating?: number
  delivery_rating?: number
  value_rating?: number
  photos?: string[]
  is_anonymous?: boolean
}

export interface ReviewStats {
  total_reviews: number
  average_rating: number
  rating_distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  service_quality_average: number
  delivery_average: number
  value_average: number
}

export class ReviewService {
  private supabase = createClient()

  // 리뷰 작성
  async createReview(userId: string, data: CreateReviewData): Promise<Review> {
    // 이미 해당 예약에 대한 리뷰가 있는지 확인
    const existingReview = await this.getReviewByBooking(userId, data.booking_id)
    if (existingReview) {
      throw new Error('이미 해당 주문에 대한 리뷰를 작성하셨습니다.')
    }

    const { data: review, error } = await this.supabase
      .from('reviews')
      .insert({
        user_id: userId,
        booking_id: data.booking_id,
        rating: data.rating,
        comment: data.comment,
        service_quality_rating: data.service_quality_rating,
        delivery_rating: data.delivery_rating,
        value_rating: data.value_rating,
        photos: data.photos || [],
        is_anonymous: data.is_anonymous || false,
        is_verified: true // 실제 주문한 고객만 리뷰 작성 가능하므로 자동으로 verified
      })
      .select(`
        *,
        user:users(id, name, email),
        booking:bookings(
          id, booking_date, total_amount,
          booking_items(
            quantity,
            knife_type:knife_types(name)
          )
        )
      `)
      .single()

    if (error) {
      console.error('리뷰 생성 오류:', error)
      throw new Error('리뷰를 작성할 수 없습니다.')
    }

    return review
  }

  // 리뷰 수정
  async updateReview(userId: string, reviewId: string, data: Partial<CreateReviewData>): Promise<Review> {
    const { data: review, error } = await this.supabase
      .from('reviews')
      .update({
        rating: data.rating,
        comment: data.comment,
        service_quality_rating: data.service_quality_rating,
        delivery_rating: data.delivery_rating,
        value_rating: data.value_rating,
        photos: data.photos,
        is_anonymous: data.is_anonymous,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .eq('user_id', userId)
      .select(`
        *,
        user:users(id, name, email),
        booking:bookings(
          id, booking_date, total_amount,
          booking_items(
            quantity,
            knife_type:knife_types(name)
          )
        )
      `)
      .single()

    if (error) {
      console.error('리뷰 수정 오류:', error)
      throw new Error('리뷰를 수정할 수 없습니다.')
    }

    return review
  }

  // 리뷰 삭제
  async deleteReview(userId: string, reviewId: string): Promise<void> {
    const { error } = await this.supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', userId)

    if (error) {
      console.error('리뷰 삭제 오류:', error)
      throw new Error('리뷰를 삭제할 수 없습니다.')
    }
  }

  // 전체 리뷰 조회 (최신순, 평점순 등)
  async getReviews(options: {
    page?: number
    limit?: number
    orderBy?: 'created_at' | 'rating' | 'helpful_count'
    orderDirection?: 'asc' | 'desc'
    minRating?: number
    featuredOnly?: boolean
  } = {}): Promise<{ reviews: Review[]; totalCount: number }> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      orderDirection = 'desc',
      minRating,
      featuredOnly = false
    } = options

    let query = this.supabase
      .from('reviews')
      .select(`
        *,
        user:users(id, name, email),
        booking:bookings(
          id, booking_date, total_amount,
          booking_items(
            quantity,
            knife_type:knife_types(name)
          )
        )
      `, { count: 'exact' })

    // 필터 적용
    if (minRating) {
      query = query.gte('rating', minRating)
    }

    if (featuredOnly) {
      query = query.eq('is_featured', true)
    }

    // 정렬 및 페이징
    query = query
      .order(orderBy, { ascending: orderDirection === 'asc' })
      .range((page - 1) * limit, page * limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('리뷰 목록 조회 오류:', error)
      throw new Error('리뷰 목록을 불러올 수 없습니다.')
    }

    return {
      reviews: data || [],
      totalCount: count || 0
    }
  }

  // 특정 사용자의 리뷰 조회
  async getUserReviews(userId: string): Promise<Review[]> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select(`
        *,
        booking:bookings(
          id, booking_date, total_amount,
          booking_items(
            quantity,
            knife_type:knife_types(name)
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('사용자 리뷰 조회 오류:', error)
      throw new Error('사용자 리뷰를 불러올 수 없습니다.')
    }

    return data || []
  }

  // 특정 예약에 대한 리뷰 조회
  async getReviewByBooking(userId: string, bookingId: string): Promise<Review | null> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select(`
        *,
        booking:bookings(
          id, booking_date, total_amount,
          booking_items(
            quantity,
            knife_type:knife_types(name)
          )
        )
      `)
      .eq('user_id', userId)
      .eq('booking_id', bookingId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('예약 리뷰 조회 오류:', error)
      throw new Error('리뷰를 조회할 수 없습니다.')
    }

    return data
  }

  // 리뷰 통계
  async getReviewStats(): Promise<ReviewStats> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select('rating, service_quality_rating, delivery_rating, value_rating')

    if (error) {
      console.error('리뷰 통계 조회 오류:', error)
      throw new Error('리뷰 통계를 불러올 수 없습니다.')
    }

    const reviews = data || []
    const totalReviews = reviews.length

    if (totalReviews === 0) {
      return {
        total_reviews: 0,
        average_rating: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        service_quality_average: 0,
        delivery_average: 0,
        value_average: 0
      }
    }

    // 평점 분포 계산
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    reviews.forEach(review => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++
    })

    // 평균 계산
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews

    const serviceQualityRatings = reviews.filter(r => r.service_quality_rating).map(r => r.service_quality_rating!)
    const serviceQualityAverage = serviceQualityRatings.length > 0 
      ? serviceQualityRatings.reduce((sum, rating) => sum + rating, 0) / serviceQualityRatings.length
      : 0

    const deliveryRatings = reviews.filter(r => r.delivery_rating).map(r => r.delivery_rating!)
    const deliveryAverage = deliveryRatings.length > 0
      ? deliveryRatings.reduce((sum, rating) => sum + rating, 0) / deliveryRatings.length
      : 0

    const valueRatings = reviews.filter(r => r.value_rating).map(r => r.value_rating!)
    const valueAverage = valueRatings.length > 0
      ? valueRatings.reduce((sum, rating) => sum + rating, 0) / valueRatings.length
      : 0

    return {
      total_reviews: totalReviews,
      average_rating: Math.round(averageRating * 10) / 10,
      rating_distribution: ratingDistribution,
      service_quality_average: Math.round(serviceQualityAverage * 10) / 10,
      delivery_average: Math.round(deliveryAverage * 10) / 10,
      value_average: Math.round(valueAverage * 10) / 10
    }
  }

  // 리뷰 도움이 됐어요 토글
  async toggleReviewHelpful(userId: string, reviewId: string): Promise<{ isHelpful: boolean; helpfulCount: number }> {
    // 현재 상태 확인
    const { data: existingHelpful } = await this.supabase
      .from('review_helpful')
      .select('id')
      .eq('user_id', userId)
      .eq('review_id', reviewId)
      .single()

    let isHelpful: boolean

    if (existingHelpful) {
      // 이미 도움이 됐다고 표시한 경우 - 취소
      await this.supabase
        .from('review_helpful')
        .delete()
        .eq('user_id', userId)
        .eq('review_id', reviewId)

      isHelpful = false
    } else {
      // 도움이 됐다고 표시
      await this.supabase
        .from('review_helpful')
        .insert({
          user_id: userId,
          review_id: reviewId
        })

      isHelpful = true
    }

    // 도움이 됐어요 수 업데이트
    const { data: helpfulCount } = await this.supabase
      .from('review_helpful')
      .select('id', { count: 'exact' })
      .eq('review_id', reviewId)

    const count = helpfulCount?.length || 0

    await this.supabase
      .from('reviews')
      .update({ helpful_count: count })
      .eq('id', reviewId)

    return { isHelpful, helpfulCount: count }
  }

  // 리뷰 작성 가능한 예약 목록 조회
  async getReviewableBookings(userId: string): Promise<Array<{
    id: string
    booking_date: string
    total_amount: number
    booking_items: Array<{
      knife_type?: { name: string }
      quantity: number
    }>
    has_review: boolean
  }>> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select(`
        id, booking_date, total_amount,
        booking_items(
          quantity,
          knife_type:knife_types(name)
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('booking_date', { ascending: false })

    if (error) {
      console.error('리뷰 가능한 예약 조회 오류:', error)
      throw new Error('예약 목록을 불러올 수 없습니다.')
    }

    // 각 예약에 대해 리뷰 여부 확인
    const bookingsWithReviewStatus = await Promise.all(
      (data || []).map(async (booking) => {
        const review = await this.getReviewByBooking(userId, booking.id)
        return {
          ...booking,
          has_review: !!review
        }
      })
    )

    return bookingsWithReviewStatus
  }

  // 유틸리티 메소드
  formatReviewDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return '오늘'
    } else if (diffInDays === 1) {
      return '어제'
    } else if (diffInDays < 7) {
      return `${diffInDays}일 전`
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      })
    }
  }

  getStarDisplay(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  getRatingColor(rating: number): string {
    if (rating >= 4.5) return 'text-green-500'
    if (rating >= 3.5) return 'text-yellow-500'
    if (rating >= 2.5) return 'text-orange-500'
    return 'text-red-500'
  }

  getRatingDescription(rating: number): string {
    if (rating === 5) return '매우 만족'
    if (rating === 4) return '만족'
    if (rating === 3) return '보통'
    if (rating === 2) return '불만족'
    return '매우 불만족'
  }

  formatUserName(user?: { name?: string; email?: string }, isAnonymous?: boolean): string {
    if (isAnonymous || !user) {
      return '익명'
    }
    
    if (user.name) {
      // 이름 일부 마스킹 (예: 홍길동 -> 홍*동)
      if (user.name.length <= 2) {
        return user.name.charAt(0) + '*'
      } else {
        return user.name.charAt(0) + '*'.repeat(user.name.length - 2) + user.name.charAt(user.name.length - 1)
      }
    }
    
    if (user.email) {
      // 이메일 일부 마스킹 (예: user@example.com -> u***@example.com)
      const [local, domain] = user.email.split('@')
      return local.charAt(0) + '***@' + domain
    }
    
    return '익명'
  }
}

export const reviewService = new ReviewService()