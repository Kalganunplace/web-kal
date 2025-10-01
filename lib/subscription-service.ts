import { createClient } from '@/lib/auth/supabase'

export interface SubscriptionPlan {
  id: string
  name: string
  description?: string
  price: number
  billing_cycle: 'monthly' | 'quarterly' | 'yearly'
  max_services_per_cycle?: number
  features?: {
    free_delivery?: boolean
    weekend_service?: boolean
    priority_booking?: boolean
    emergency_service?: boolean
    annual_discount?: boolean
  }
  is_active: boolean
  created_at: string
}

export interface UserSubscription {
  id: string
  user_id: string
  subscription_plan_id: string
  status: 'active' | 'cancelled' | 'expired' | 'paused'
  started_at: string
  current_period_start: string
  current_period_end: string
  cancelled_at?: string
  services_used_this_cycle: number
  auto_renew: boolean
  created_at: string
  updated_at: string
  subscription_plan?: SubscriptionPlan
}

export interface CreateSubscriptionData {
  subscription_plan_id: string
  auto_renew?: boolean
}

export class SubscriptionService {
  private supabase = createClient()

  // 활성 구독 플랜 목록 조회
  async getActivePlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await this.supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true })

      if (error) {
        console.error('구독 플랜 조회 오류:', error)
        throw new Error('구독 플랜을 불러올 수 없습니다.')
      }

      return data || []
    } catch (error) {
      console.error('구독 플랜 조회 실패:', error)
      throw error
    }
  }

  // 사용자 구독 조회
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plan:subscription_plans (*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // 구독이 없는 경우
        }
        console.error('사용자 구독 조회 오류:', error)
        throw new Error('구독 정보를 조회할 수 없습니다.')
      }

      return data
    } catch (error) {
      console.error('사용자 구독 조회 실패:', error)
      throw error
    }
  }

  // 구독 생성
  async createSubscription(userId: string, subscriptionData: CreateSubscriptionData): Promise<UserSubscription> {
    try {
      // 플랜 정보 조회
      const { data: plan, error: planError } = await this.supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', subscriptionData.subscription_plan_id)
        .single()

      if (planError || !plan) {
        throw new Error('구독 플랜을 찾을 수 없습니다.')
      }

      // 구독 기간 계산
      const now = new Date()
      const periodEnd = new Date(now)
      
      switch (plan.billing_cycle) {
        case 'monthly':
          periodEnd.setMonth(periodEnd.getMonth() + 1)
          break
        case 'quarterly':
          periodEnd.setMonth(periodEnd.getMonth() + 3)
          break
        case 'yearly':
          periodEnd.setFullYear(periodEnd.getFullYear() + 1)
          break
      }

      // 구독 생성
      const { data: subscription, error: subError } = await this.supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          subscription_plan_id: subscriptionData.subscription_plan_id,
          status: 'active',
          started_at: now.toISOString(),
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          services_used_this_cycle: 0,
          auto_renew: subscriptionData.auto_renew ?? true
        })
        .select(`
          *,
          subscription_plan:subscription_plans (*)
        `)
        .single()

      if (subError) {
        console.error('구독 생성 오류:', subError)
        throw new Error('구독을 생성할 수 없습니다.')
      }

      return subscription
    } catch (error) {
      console.error('구독 생성 실패:', error)
      throw error
    }
  }

  // 구독 취소
  async cancelSubscription(subscriptionId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          auto_renew: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .eq('user_id', userId)

      if (error) {
        console.error('구독 취소 오류:', error)
        throw new Error('구독을 취소할 수 없습니다.')
      }
    } catch (error) {
      console.error('구독 취소 실패:', error)
      throw error
    }
  }

  // 구독 일시정지
  async pauseSubscription(subscriptionId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_subscriptions')
        .update({
          status: 'paused',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .eq('user_id', userId)

      if (error) {
        console.error('구독 일시정지 오류:', error)
        throw new Error('구독을 일시정지할 수 없습니다.')
      }
    } catch (error) {
      console.error('구독 일시정지 실패:', error)
      throw error
    }
  }

  // 구독 재개
  async resumeSubscription(subscriptionId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .eq('user_id', userId)
        .eq('status', 'paused')

      if (error) {
        console.error('구독 재개 오류:', error)
        throw new Error('구독을 재개할 수 없습니다.')
      }
    } catch (error) {
      console.error('구독 재개 실패:', error)
      throw error
    }
  }

  // 구독 사용 내역 업데이트
  async updateServiceUsage(subscriptionId: string, userId: string): Promise<void> {
    try {
      // 현재 구독 정보 조회
      const { data: subscription, error: getError } = await this.supabase
        .from('user_subscriptions')
        .select('services_used_this_cycle')
        .eq('id', subscriptionId)
        .eq('user_id', userId)
        .single()

      if (getError || !subscription) {
        throw new Error('구독 정보를 찾을 수 없습니다.')
      }

      // 사용 횟수 증가
      const { error: updateError } = await this.supabase
        .from('user_subscriptions')
        .update({
          services_used_this_cycle: subscription.services_used_this_cycle + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .eq('user_id', userId)

      if (updateError) {
        console.error('서비스 사용 내역 업데이트 오류:', updateError)
        throw new Error('서비스 사용 내역을 업데이트할 수 없습니다.')
      }
    } catch (error) {
      console.error('서비스 사용 내역 업데이트 실패:', error)
      throw error
    }
  }

  // 구독 플랜별 특징 텍스트 변환
  formatPlanFeatures(plan: SubscriptionPlan): string[] {
    const features: string[] = []
    
    if (plan.max_services_per_cycle) {
      features.push(`월 ${plan.max_services_per_cycle}회 칼갈이 서비스`)
    } else {
      features.push('무제한 칼갈이 서비스')
    }

    if (plan.features?.free_delivery) {
      features.push('무료 배송')
    }

    if (plan.features?.weekend_service) {
      features.push('주말 서비스 가능')
    }

    if (plan.features?.priority_booking) {
      features.push('예약 우선권')
    }

    if (plan.features?.emergency_service) {
      features.push('긴급 서비스')
    }

    if (plan.features?.annual_discount) {
      features.push('연간 할인 적용')
    }

    features.push('24시간 고객지원')

    return features
  }

  // 결제 주기 한글명
  getBillingCycleText(cycle: SubscriptionPlan['billing_cycle']): string {
    const cycleMap = {
      monthly: '월',
      quarterly: '분기',
      yearly: '연'
    }
    return cycleMap[cycle] || cycle
  }

  // 구독 상태 한글명
  getStatusText(status: UserSubscription['status']): string {
    const statusMap = {
      active: '활성',
      cancelled: '취소됨',
      expired: '만료됨',
      paused: '일시정지'
    }
    return statusMap[status] || status
  }

  // 다음 결제일 계산
  getNextPaymentDate(periodEnd: string): string {
    const date = new Date(periodEnd)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 가격 포맷팅
  formatPrice(price: number, cycle: SubscriptionPlan['billing_cycle']): string {
    const formattedPrice = price.toLocaleString('ko-KR')
    const cycleText = this.getBillingCycleText(cycle)
    return `${formattedPrice}원/${cycleText}`
  }
}

export const subscriptionService = new SubscriptionService()