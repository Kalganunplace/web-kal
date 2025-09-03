import { createClient } from '@/lib/auth/supabase'

export interface Coupon {
  id: string
  name: string
  description?: string
  coupon_code?: string
  type: 'fixed' | 'percentage'
  value: number
  min_order_amount?: number
  max_discount_amount?: number
  usage_limit: number
  used_count: number
  is_stackable: boolean
  target_knife_types?: string[]
  is_first_order_only: boolean
  valid_from: string
  valid_until: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserCoupon {
  id: string
  user_id: string
  coupon_id: string
  coupon_code?: string
  is_used: boolean
  used_at?: string
  discount_amount?: number
  original_order_amount?: number
  final_order_amount?: number
  booking_id?: string
  created_at: string
  coupon?: Coupon
}

export interface CouponCategory {
  id: string
  name: string
  description?: string
  icon?: string
  color: string
  order_index: number
  is_active: boolean
  created_at: string
}

export interface CouponEvent {
  id: string
  title: string
  description?: string
  event_type: string
  coupon_template: any
  is_active: boolean
  start_date?: string
  end_date?: string
  target_conditions?: any
  created_at: string
  updated_at: string
}

export interface CouponShare {
  id: string
  coupon_id: string
  shared_by_user_id: string
  shared_to_user_id?: string
  share_code: string
  share_method: string
  is_used: boolean
  used_at?: string
  created_at: string
}

export interface CreateCouponData {
  name: string
  description?: string
  coupon_code?: string
  type: 'fixed' | 'percentage'
  value: number
  min_order_amount?: number
  max_discount_amount?: number
  usage_limit?: number
  is_stackable?: boolean
  target_knife_types?: string[]
  is_first_order_only?: boolean
  valid_from: string
  valid_until: string
}

export class CouponService {
  private supabase = createClient()

  // 쿠폰 관리
  async getCoupon(couponId: string): Promise<Coupon | null> {
    const { data, error } = await this.supabase
      .from('coupons')
      .select('*')
      .eq('id', couponId)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('쿠폰 조회 오류:', error)
      throw new Error('쿠폰을 조회할 수 없습니다.')
    }

    return data
  }

  async getCouponByCode(couponCode: string): Promise<Coupon | null> {
    const { data, error } = await this.supabase
      .from('coupons')
      .select('*')
      .eq('coupon_code', couponCode)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('쿠폰 코드 조회 오류:', error)
      throw new Error('쿠폰을 조회할 수 없습니다.')
    }

    return data
  }

  async getActiveCoupons(): Promise<Coupon[]> {
    const now = new Date().toISOString()
    
    const { data, error } = await this.supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .lte('valid_from', now)
      .gte('valid_until', now)
      .lt('used_count', this.supabase.rpc('usage_limit'))
      .order('created_at', { ascending: false })

    if (error) {
      console.error('활성 쿠폰 조회 오류:', error)
      throw new Error('쿠폰 목록을 불러올 수 없습니다.')
    }

    return data || []
  }

  async createCoupon(data: CreateCouponData): Promise<Coupon> {
    const { data: coupon, error } = await this.supabase
      .from('coupons')
      .insert({
        name: data.name,
        description: data.description,
        coupon_code: data.coupon_code,
        type: data.type,
        value: data.value,
        min_order_amount: data.min_order_amount || 0,
        max_discount_amount: data.max_discount_amount,
        usage_limit: data.usage_limit || 1,
        is_stackable: data.is_stackable || false,
        target_knife_types: data.target_knife_types,
        is_first_order_only: data.is_first_order_only || false,
        valid_from: data.valid_from,
        valid_until: data.valid_until,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('쿠폰 생성 오류:', error)
      throw new Error('쿠폰을 생성할 수 없습니다.')
    }

    return coupon
  }

  // 사용자 쿠폰 관리
  async getUserCoupons(userId: string, includeUsed: boolean = false): Promise<UserCoupon[]> {
    let query = this.supabase
      .from('user_coupons')
      .select(`
        *,
        coupon:coupons(*)
      `)
      .eq('user_id', userId)

    if (!includeUsed) {
      query = query.eq('is_used', false)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('사용자 쿠폰 조회 오류:', error)
      throw new Error('쿠폰 목록을 불러올 수 없습니다.')
    }

    return data || []
  }

  async getAvailableUserCoupons(userId: string, orderAmount?: number, knifeTypes?: string[]): Promise<UserCoupon[]> {
    const userCoupons = await this.getUserCoupons(userId, false)
    const now = new Date()

    return userCoupons.filter(userCoupon => {
      const coupon = userCoupon.coupon
      if (!coupon) return false

      // 유효기간 확인
      const validFrom = new Date(coupon.valid_from)
      const validUntil = new Date(coupon.valid_until)
      if (now < validFrom || now > validUntil) return false

      // 최소 주문 금액 확인
      if (orderAmount && coupon.min_order_amount && orderAmount < coupon.min_order_amount) return false

      // 특정 칼 종류 제한 확인
      if (coupon.target_knife_types && coupon.target_knife_types.length > 0 && knifeTypes) {
        const hasTargetKnife = knifeTypes.some(type => coupon.target_knife_types!.includes(type))
        if (!hasTargetKnife) return false
      }

      return true
    })
  }

  async issueCouponToUser(userId: string, couponId: string): Promise<UserCoupon> {
    const { data: userCoupon, error } = await this.supabase
      .from('user_coupons')
      .insert({
        user_id: userId,
        coupon_id: couponId,
        is_used: false
      })
      .select(`
        *,
        coupon:coupons(*)
      `)
      .single()

    if (error) {
      console.error('사용자 쿠폰 발급 오류:', error)
      throw new Error('쿠폰을 발급할 수 없습니다.')
    }

    return userCoupon
  }

  async useCoupon(userCouponId: string, bookingId: string, discountAmount: number, originalAmount: number): Promise<void> {
    const { error } = await this.supabase
      .from('user_coupons')
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
        booking_id: bookingId,
        discount_amount: discountAmount,
        original_order_amount: originalAmount,
        final_order_amount: originalAmount - discountAmount
      })
      .eq('id', userCouponId)

    if (error) {
      console.error('쿠폰 사용 오류:', error)
      throw new Error('쿠폰을 사용할 수 없습니다.')
    }

    // 쿠폰 사용 횟수 증가
    await this.supabase.rpc('increment_coupon_usage', { coupon_id: userCouponId })
  }

  // 쿠폰 할인 계산
  calculateDiscount(coupon: Coupon, orderAmount: number): number {
    let discount = 0

    if (coupon.type === 'fixed') {
      discount = coupon.value
    } else if (coupon.type === 'percentage') {
      discount = Math.floor(orderAmount * (coupon.value / 100))
    }

    // 최대 할인 금액 제한
    if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
      discount = coupon.max_discount_amount
    }

    // 주문 금액을 초과할 수 없음
    if (discount > orderAmount) {
      discount = orderAmount
    }

    return discount
  }

  // 쿠폰 검증
  async validateCoupon(userId: string, couponId: string, orderAmount: number, knifeTypes?: string[]): Promise<{
    isValid: boolean
    error?: string
    discount?: number
  }> {
    try {
      const userCoupons = await this.getUserCoupons(userId, false)
      const userCoupon = userCoupons.find(uc => uc.coupon_id === couponId)

      if (!userCoupon) {
        return { isValid: false, error: '보유하지 않은 쿠폰입니다.' }
      }

      if (userCoupon.is_used) {
        return { isValid: false, error: '이미 사용된 쿠폰입니다.' }
      }

      const coupon = userCoupon.coupon!
      const now = new Date()

      // 유효기간 확인
      if (now < new Date(coupon.valid_from) || now > new Date(coupon.valid_until)) {
        return { isValid: false, error: '쿠폰 사용 기간이 아닙니다.' }
      }

      // 최소 주문 금액 확인
      if (coupon.min_order_amount && orderAmount < coupon.min_order_amount) {
        return { 
          isValid: false, 
          error: `최소 주문 금액 ${this.formatPrice(coupon.min_order_amount)} 이상일 때 사용 가능합니다.` 
        }
      }

      // 특정 칼 종류 제한 확인
      if (coupon.target_knife_types && coupon.target_knife_types.length > 0 && knifeTypes) {
        const hasTargetKnife = knifeTypes.some(type => coupon.target_knife_types!.includes(type))
        if (!hasTargetKnife) {
          return { isValid: false, error: '해당 쿠폰은 특정 칼 종류에만 적용됩니다.' }
        }
      }

      const discount = this.calculateDiscount(coupon, orderAmount)
      return { isValid: true, discount }

    } catch (error) {
      console.error('쿠폰 검증 오류:', error)
      return { isValid: false, error: '쿠폰 검증 중 오류가 발생했습니다.' }
    }
  }

  // 자동 쿠폰 발급 (이벤트 기반)
  async processAutoCouponEvents(userId: string, eventType: string, data?: any): Promise<UserCoupon[]> {
    try {
      const { data: events, error } = await this.supabase
        .from('coupon_events')
        .select('*')
        .eq('event_type', eventType)
        .eq('is_active', true)

      if (error) {
        console.error('쿠폰 이벤트 조회 오류:', error)
        return []
      }

      const issuedCoupons: UserCoupon[] = []

      for (const event of events) {
        try {
          // 이미 해당 이벤트 쿠폰을 받았는지 확인
          const existingCoupon = await this.supabase
            .from('user_coupons')
            .select('id')
            .eq('user_id', userId)
            .eq('coupon_code', `${event.event_type}_${userId}`)
            .single()

          if (existingCoupon.data) continue // 이미 발급받음

          // 쿠폰 템플릿으로 쿠폰 생성
          const template = event.coupon_template
          const coupon = await this.createCoupon({
            name: template.name || event.title,
            description: `${event.description} (자동 발급)`,
            coupon_code: `${event.event_type}_${userId}_${Date.now()}`,
            type: template.type,
            value: template.value,
            min_order_amount: template.min_order_amount,
            max_discount_amount: template.max_discount_amount,
            usage_limit: 1,
            valid_from: new Date().toISOString(),
            valid_until: new Date(Date.now() + (template.valid_days || 30) * 24 * 60 * 60 * 1000).toISOString()
          })

          // 사용자에게 쿠폰 발급
          const userCoupon = await this.issueCouponToUser(userId, coupon.id)
          issuedCoupons.push(userCoupon)

        } catch (error) {
          console.error('개별 쿠폰 이벤트 처리 오류:', error)
        }
      }

      return issuedCoupons

    } catch (error) {
      console.error('자동 쿠폰 발급 오류:', error)
      return []
    }
  }

  // 유틸리티 메소드
  formatPrice(amount: number): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount)
  }

  formatDiscountValue(coupon: Coupon): string {
    if (coupon.type === 'fixed') {
      return this.formatPrice(coupon.value)
    } else {
      return `${coupon.value}%`
    }
  }

  getCouponStatusColor(coupon: Coupon, userCoupon?: UserCoupon): string {
    if (userCoupon?.is_used) {
      return 'bg-gray-100 text-gray-500'
    }

    const now = new Date()
    const validUntil = new Date(coupon.valid_until)
    const daysUntilExpiry = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry <= 3) {
      return 'bg-red-100 text-red-600'
    } else if (daysUntilExpiry <= 7) {
      return 'bg-orange-100 text-orange-600'
    } else {
      return 'bg-green-100 text-green-600'
    }
  }

  getCouponStatusLabel(coupon: Coupon, userCoupon?: UserCoupon): string {
    if (userCoupon?.is_used) {
      return '사용완료'
    }

    const now = new Date()
    const validUntil = new Date(coupon.valid_until)
    const daysUntilExpiry = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry <= 0) {
      return '만료됨'
    } else if (daysUntilExpiry <= 3) {
      return `${daysUntilExpiry}일 남음`
    } else if (daysUntilExpiry <= 7) {
      return `${daysUntilExpiry}일 남음`
    } else {
      return '사용가능'
    }
  }

  formatExpiryDate(validUntil: string): string {
    const date = new Date(validUntil)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    })
  }
}

export const couponService = new CouponService()