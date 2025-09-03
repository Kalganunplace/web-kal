import { createClient } from '@/lib/auth/supabase'

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
  created_at: string
  updated_at: string
}

export interface KnifeTypeWithCouponPrice extends KnifeType {
  coupon_price?: number
  coupon_discount?: number
}

export class KnifeService {
  private supabase = createClient()

  async getAllKnifeTypes(): Promise<KnifeType[]> {
    const { data, error } = await this.supabase
      .from('knife_types')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('칼 종류 조회 오류:', error)
      throw new Error('칼 종류를 불러올 수 없습니다.')
    }

    return data || []
  }

  async getKnifeTypeById(id: string): Promise<KnifeType | null> {
    const { data, error } = await this.supabase
      .from('knife_types')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('칼 종류 조회 오류:', error)
      throw new Error('칼 종류를 조회할 수 없습니다.')
    }

    return data
  }

  async getKnifeTypesWithCouponPrice(userId?: string): Promise<KnifeTypeWithCouponPrice[]> {
    const knifeTypes = await this.getAllKnifeTypes()

    if (!userId) {
      return knifeTypes.map(knife => ({ ...knife }))
    }

    // 사용자의 활성 쿠폰 조회
    const { data: userCoupons } = await this.supabase
      .from('coupons')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())

    return knifeTypes.map(knife => {
      const applicableCoupons = userCoupons?.filter(coupon => {
        // 최소 주문 금액 체크
        return knife.discount_price >= (coupon.min_order_amount || 0)
      }) || []

      if (applicableCoupons.length === 0) {
        return { ...knife }
      }

      // 가장 할인이 큰 쿠폰 선택
      let bestDiscount = 0
      let couponPrice = knife.discount_price

      for (const coupon of applicableCoupons) {
        let discount = 0
        
        if (coupon.discount_amount) {
          discount = coupon.discount_amount
        } else if (coupon.discount_percent) {
          discount = Math.floor(knife.discount_price * coupon.discount_percent / 100)
          // 최대 할인 금액 적용
          if (coupon.max_discount_amount) {
            discount = Math.min(discount, coupon.max_discount_amount)
          }
        }

        if (discount > bestDiscount) {
          bestDiscount = discount
        }
      }

      if (bestDiscount > 0) {
        couponPrice = Math.max(0, knife.discount_price - bestDiscount)
      }

      return {
        ...knife,
        coupon_price: couponPrice,
        coupon_discount: bestDiscount
      }
    })
  }

  async searchKnifeTypes(query: string): Promise<KnifeType[]> {
    const { data, error } = await this.supabase
      .from('knife_types')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('칼 종류 검색 오류:', error)
      throw new Error('칼 종류를 검색할 수 없습니다.')
    }

    return data || []
  }

  // 관리자용 함수들 (향후 사용)
  async createKnifeType(knifeTypeData: Omit<KnifeType, 'id' | 'created_at' | 'updated_at'>): Promise<KnifeType> {
    const { data, error } = await this.supabase
      .from('knife_types')
      .insert(knifeTypeData)
      .select()
      .single()

    if (error) {
      console.error('칼 종류 생성 오류:', error)
      throw new Error('칼 종류를 생성할 수 없습니다.')
    }

    return data
  }

  async updateKnifeType(id: string, updates: Partial<KnifeType>): Promise<KnifeType> {
    const { data, error } = await this.supabase
      .from('knife_types')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('칼 종류 업데이트 오류:', error)
      throw new Error('칼 종류를 업데이트할 수 없습니다.')
    }

    return data
  }

  async deleteKnifeType(id: string): Promise<void> {
    // 실제로는 삭제하지 않고 비활성화
    const { error } = await this.supabase
      .from('knife_types')
      .update({ 
        is_active: false, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)

    if (error) {
      console.error('칼 종류 삭제 오류:', error)
      throw new Error('칼 종류를 삭제할 수 없습니다.')
    }
  }

  // 가격 계산 유틸리티 함수들
  calculateTotalPrice(items: { knife_type_id: string; quantity: number }[], knifeTypes: KnifeType[]): number {
    let total = 0
    
    for (const item of items) {
      const knifeType = knifeTypes.find(kt => kt.id === item.knife_type_id)
      if (knifeType) {
        total += knifeType.discount_price * item.quantity
      }
    }
    
    return total
  }

  calculateTotalQuantity(items: { knife_type_id: string; quantity: number }[]): number {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0
    }).format(price)
  }

  // 칼 종류별 추천 관리 방법 제공
  getCareRecommendations(knifeType: KnifeType): string[] {
    const basicCare = [
      '사용 후 즉시 세척하기',
      '완전히 건조시킨 후 보관',
      '정기적인 연마로 날카로움 유지'
    ]

    const specificCare: { [key: string]: string[] } = {
      '일반식도류': [...basicCare, '도마와 함께 보관 금지', '날 보호캡 사용 권장'],
      '정육도': [...basicCare, '기름기 완전 제거 필수', '별도 보관으로 교차 오염 방지'],
      '회칼': [...basicCare, '생선 비린내 제거', '전용 칼집 사용 권장'],
      '일반가위': ['관절 부분 정기적 오일링', '날 부분 분리 청소', '건조한 곳에 보관'],
      '과도류': [...basicCare, '작은 크기로 인한 분실 주의', '어린이 손 닿지 않는 곳 보관']
    }

    return specificCare[knifeType.name] || basicCare
  }
}

export const knifeService = new KnifeService()