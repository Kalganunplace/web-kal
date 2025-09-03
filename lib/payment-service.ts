import { createClient } from '@/lib/auth/supabase'

export interface PaymentMethod {
  id: string
  name: string
  type: 'card' | 'bank_transfer' | 'mobile' | 'simple_pay'
  provider?: string
  icon_url?: string
  is_active: boolean
  display_order: number
  created_at: string
}

export interface Payment {
  id: string
  booking_id: string
  user_id: string
  payment_method_id?: string
  payment_key?: string
  order_id: string
  amount: number
  discount_amount: number
  insurance_amount: number
  final_amount: number
  currency: string
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded'
  payment_method_type?: string
  card_info?: {
    last4?: string
    brand?: string
    masked_number?: string
  }
  failure_reason?: string
  paid_at?: string
  cancelled_at?: string
  refunded_at?: string
  created_at: string
  updated_at: string
  payment_method?: PaymentMethod
  refunds?: Refund[]
}

export interface Refund {
  id: string
  payment_id: string
  refund_key?: string
  amount: number
  reason: string
  status: 'pending' | 'completed' | 'failed'
  requested_by?: string
  processed_at?: string
  created_at: string
  updated_at: string
}

export interface CreatePaymentData {
  booking_id: string
  payment_method_id?: string
  amount: number
  discount_amount?: number
  insurance_amount?: number
  payment_method_type?: string
}

export interface CreateRefundData {
  payment_id: string
  amount: number
  reason: string
}

export class PaymentService {
  private supabase = createClient()

  // 결제 방법 조회
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const { data, error } = await this.supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('결제 방법 조회 오류:', error)
      throw new Error('결제 방법을 불러올 수 없습니다.')
    }

    return data || []
  }

  // 결제 생성
  async createPayment(userId: string, paymentData: CreatePaymentData): Promise<Payment> {
    try {
      // 주문번호 생성
      const { data: orderResult, error: orderError } = await this.supabase
        .rpc('generate_order_id')

      if (orderError) {
        console.error('주문번호 생성 오류:', orderError)
        throw new Error('주문번호를 생성할 수 없습니다.')
      }

      const orderId = orderResult as string
      const finalAmount = paymentData.amount + (paymentData.insurance_amount || 0) - (paymentData.discount_amount || 0)

      // 결제 정보 생성
      const { data, error } = await this.supabase
        .from('payments')
        .insert([{
          booking_id: paymentData.booking_id,
          user_id: userId,
          payment_method_id: paymentData.payment_method_id,
          order_id: orderId,
          amount: paymentData.amount,
          discount_amount: paymentData.discount_amount || 0,
          insurance_amount: paymentData.insurance_amount || 0,
          final_amount: finalAmount,
          currency: 'KRW',
          status: 'pending',
          payment_method_type: paymentData.payment_method_type
        }])
        .select(`
          *,
          payment_method:payment_methods(*)
        `)
        .single()

      if (error) {
        console.error('결제 생성 오류:', error)
        throw new Error('결제 정보를 생성할 수 없습니다.')
      }

      return data
    } catch (error) {
      console.error('결제 생성 실패:', error)
      throw new Error('결제를 생성할 수 없습니다.')
    }
  }

  // 결제 상태 업데이트
  async updatePaymentStatus(paymentId: string, status: Payment['status'], data?: {
    payment_key?: string
    card_info?: Payment['card_info']
    failure_reason?: string
  }): Promise<void> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (status === 'paid') {
      updateData.paid_at = new Date().toISOString()
    } else if (status === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString()
    } else if (status === 'refunded') {
      updateData.refunded_at = new Date().toISOString()
    }

    if (data?.payment_key) {
      updateData.payment_key = data.payment_key
    }

    if (data?.card_info) {
      updateData.card_info = data.card_info
    }

    if (data?.failure_reason) {
      updateData.failure_reason = data.failure_reason
    }

    const { error } = await this.supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)

    if (error) {
      console.error('결제 상태 업데이트 오류:', error)
      throw new Error('결제 상태를 업데이트할 수 없습니다.')
    }
  }

  // 결제 조회
  async getPayment(paymentId: string): Promise<Payment | null> {
    const { data, error } = await this.supabase
      .from('payments')
      .select(`
        *,
        payment_method:payment_methods(*),
        refunds(*)
      `)
      .eq('id', paymentId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('결제 조회 오류:', error)
      throw new Error('결제 정보를 불러올 수 없습니다.')
    }

    return data
  }

  // 예약별 결제 조회
  async getPaymentByBooking(bookingId: string): Promise<Payment | null> {
    const { data, error } = await this.supabase
      .from('payments')
      .select(`
        *,
        payment_method:payment_methods(*),
        refunds(*)
      `)
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('예약 결제 조회 오류:', error)
      throw new Error('결제 정보를 불러올 수 없습니다.')
    }

    return data
  }

  // 사용자 결제 내역 조회
  async getUserPayments(userId: string, options: {
    page?: number
    limit?: number
    status?: Payment['status']
  } = {}): Promise<{ payments: Payment[]; totalCount: number }> {
    const { page = 1, limit = 20, status } = options

    let query = this.supabase
      .from('payments')
      .select(`
        *,
        payment_method:payment_methods(*),
        refunds(*)
      `, { count: 'exact' })
      .eq('user_id', userId)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error('사용자 결제 내역 조회 오류:', error)
      throw new Error('결제 내역을 불러올 수 없습니다.')
    }

    return {
      payments: data || [],
      totalCount: count || 0
    }
  }

  // 환불 생성
  async createRefund(userId: string, refundData: CreateRefundData): Promise<Refund> {
    try {
      // 결제 정보 확인
      const payment = await this.getPayment(refundData.payment_id)
      if (!payment || payment.user_id !== userId) {
        throw new Error('유효하지 않은 결제 정보입니다.')
      }

      if (payment.status !== 'paid') {
        throw new Error('결제 완료된 건만 환불 가능합니다.')
      }

      if (refundData.amount > payment.final_amount) {
        throw new Error('환불 금액이 결제 금액을 초과합니다.')
      }

      // 환불 생성
      const { data, error } = await this.supabase
        .from('refunds')
        .insert([{
          payment_id: refundData.payment_id,
          amount: refundData.amount,
          reason: refundData.reason,
          status: 'pending',
          requested_by: userId
        }])
        .select('*')
        .single()

      if (error) {
        console.error('환불 생성 오류:', error)
        throw new Error('환불 요청을 생성할 수 없습니다.')
      }

      // 결제 상태 업데이트 (부분환불인지 전체환불인지 확인)
      if (refundData.amount >= payment.final_amount) {
        await this.updatePaymentStatus(payment.id, 'refunded')
      }

      return data
    } catch (error) {
      console.error('환불 생성 실패:', error)
      throw new Error('환불 요청을 처리할 수 없습니다.')
    }
  }

  // 환불 상태 업데이트
  async updateRefundStatus(refundId: string, status: Refund['status']): Promise<void> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (status === 'completed') {
      updateData.processed_at = new Date().toISOString()
    }

    const { error } = await this.supabase
      .from('refunds')
      .update(updateData)
      .eq('id', refundId)

    if (error) {
      console.error('환불 상태 업데이트 오류:', error)
      throw new Error('환불 상태를 업데이트할 수 없습니다.')
    }
  }

  // 결제 상태 라벨
  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'pending': '결제 대기',
      'paid': '결제 완료',
      'failed': '결제 실패',
      'cancelled': '결제 취소',
      'refunded': '환불 완료'
    }
    return statusLabels[status] || status
  }

  // 결제 상태 색상
  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800',
      'refunded': 'bg-purple-100 text-purple-800'
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800'
  }

  // 환불 상태 라벨
  getRefundStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'pending': '환불 대기',
      'completed': '환불 완료',
      'failed': '환불 실패'
    }
    return statusLabels[status] || status
  }

  // 결제 방법 아이콘 매핑
  getPaymentMethodIcon(type: string, provider?: string): string {
    if (provider) {
      const providerIcons: { [key: string]: string } = {
        'toss': '💳',
        'kakao': '🟡',
        'naver': '🟢',
        'payco': '🔴'
      }
      return providerIcons[provider] || '💳'
    }

    const typeIcons: { [key: string]: string } = {
      'card': '💳',
      'bank_transfer': '🏦',
      'mobile': '📱',
      'simple_pay': '⚡'
    }
    return typeIcons[type] || '💳'
  }

  // 통화 포맷
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount)
  }

  // 날짜 포맷
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    })
  }

  // 날짜시간 포맷
  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    })
  }
}

export const paymentService = new PaymentService()