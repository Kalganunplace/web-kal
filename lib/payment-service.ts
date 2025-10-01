import { createClient } from '@/lib/auth/supabase'

export interface Payment {
  id: string
  booking_id: string
  user_id: string
  payment_method: 'bank_transfer' | 'card' | 'virtual_account'
  amount: number
  currency: string
  bank_name?: string
  account_number?: string
  account_holder?: string
  customer_bank_name?: string
  customer_account_number?: string
  depositor_name?: string
  deposit_deadline?: string
  payment_status: 'pending' | 'confirmed' | 'failed' | 'cancelled' | 'refunded'
  confirmed_by?: string
  confirmed_at?: string
  confirmation_note?: string
  payment_note?: string
  refund_reason?: string
  refund_amount?: number
  refunded_at?: string
  created_at: string
  updated_at: string
}

export interface PaymentBankAccount {
  id: string
  bank_name: string
  account_number: string
  account_holder: string
  is_active: boolean
  is_default: boolean
  description?: string
  display_order: number
  created_at: string
  updated_at: string
}

export interface PaymentConfirmation {
  id: string
  payment_id: string
  admin_user_id: string
  action_type: 'confirm' | 'reject' | 'cancel'
  previous_status: string
  new_status: string
  confirmation_note?: string
  confirmed_amount?: number
  deposit_date?: string
  bank_transaction_id?: string
  created_at: string
}

export interface CreatePaymentData {
  booking_id: string
  payment_method: 'bank_transfer' | 'card' | 'virtual_account'
  amount: number
  customer_bank_name?: string
  customer_account_number?: string
  depositor_name?: string
  payment_note?: string
}

export interface ConfirmPaymentData {
  action_type: 'confirm' | 'reject' | 'cancel'
  confirmation_note?: string
  confirmed_amount?: number
  deposit_date?: string
  bank_transaction_id?: string
}

export class PaymentService {
  private supabase = createClient()

  // 결제 생성
  async createPayment(userId: string, paymentData: CreatePaymentData): Promise<Payment> {
    try {
      // 기본 입금 계좌 정보 조회
      const defaultBankAccount = await this.getDefaultBankAccount()

      const { data: payment, error } = await this.supabase
        .from('payments')
        .insert({
          booking_id: paymentData.booking_id,
          user_id: userId,
          payment_method: paymentData.payment_method,
          amount: paymentData.amount,
          currency: 'KRW',
          customer_bank_name: paymentData.customer_bank_name,
          customer_account_number: paymentData.customer_account_number,
          depositor_name: paymentData.depositor_name,
          payment_note: paymentData.payment_note,
          payment_status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error('결제 생성 오류:', error)
        throw new Error('결제를 생성할 수 없습니다.')
      }

      return payment
    } catch (error) {
      console.error('결제 생성 실패:', error)
      throw error
    }
  }

  // 사용자별 결제 목록 조회
  async getUserPayments(userId: string): Promise<Payment[]> {
    try {
      const { data, error } = await this.supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('결제 목록 조회 오류:', error)
        throw new Error('결제 목록을 불러올 수 없습니다.')
      }

      return data || []
    } catch (error) {
      console.error('결제 목록 조회 실패:', error)
      throw error
    }
  }

  // 특정 결제 조회
  async getPaymentById(paymentId: string, userId?: string): Promise<Payment | null> {
    try {
      let query = this.supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query.single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        console.error('결제 조회 오류:', error)
        throw new Error('결제 정보를 조회할 수 없습니다.')
      }

      return data
    } catch (error) {
      console.error('결제 조회 실패:', error)
      throw error
    }
  }

  // 예약별 결제 조회
  async getPaymentByBookingId(bookingId: string, userId?: string): Promise<Payment | null> {
    try {
      let query = this.supabase
        .from('payments')
        .select('*')
        .eq('booking_id', bookingId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query.single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        console.error('결제 조회 오류:', error)
        throw new Error('결제 정보를 조회할 수 없습니다.')
      }

      return data
    } catch (error) {
      console.error('결제 조회 실패:', error)
      throw error
    }
  }

  // 결제 상태 업데이트 (사용자용)
  async updatePaymentStatus(paymentId: string, userId: string, status: Payment['payment_status'], note?: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('payments')
        .update({
          payment_status: status,
          payment_note: note,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)
        .eq('user_id', userId)

      if (error) {
        console.error('결제 상태 업데이트 오류:', error)
        throw new Error('결제 상태를 업데이트할 수 없습니다.')
      }
    } catch (error) {
      console.error('결제 상태 업데이트 실패:', error)
      throw error
    }
  }

  // 결제 확인 (관리자용)
  async confirmPayment(paymentId: string, adminUserId: string, confirmData: ConfirmPaymentData): Promise<void> {
    try {
      // 현재 결제 정보 조회
      const currentPayment = await this.getPaymentById(paymentId)
      if (!currentPayment) {
        throw new Error('결제 정보를 찾을 수 없습니다.')
      }

      // 새로운 상태 결정
      let newStatus: Payment['payment_status']
      switch (confirmData.action_type) {
        case 'confirm':
          newStatus = 'confirmed'
          break
        case 'reject':
          newStatus = 'failed'
          break
        case 'cancel':
          newStatus = 'cancelled'
          break
        default:
          throw new Error('유효하지 않은 액션 타입입니다.')
      }

      // 트랜잭션으로 결제 상태 업데이트와 확인 로그 생성
      const { error: paymentError } = await this.supabase
        .from('payments')
        .update({
          payment_status: newStatus,
          confirmed_by: confirmData.action_type === 'confirm' ? adminUserId : undefined,
          confirmed_at: confirmData.action_type === 'confirm' ? new Date().toISOString() : undefined,
          confirmation_note: confirmData.confirmation_note,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)

      if (paymentError) {
        console.error('결제 상태 업데이트 오류:', paymentError)
        throw new Error('결제 상태를 업데이트할 수 없습니다.')
      }

      // 결제 확인 시 예약 상태도 업데이트
      if (confirmData.action_type === 'confirm' && currentPayment.booking_id) {
        const { error: bookingError } = await this.supabase
          .from('bookings')
          .update({
            status: 'confirmed',
            updated_at: new Date().toISOString()
          })
          .eq('id', currentPayment.booking_id)
        
        if (bookingError) {
          console.error('예약 상태 업데이트 오류:', bookingError)
          // 예약 업데이트 실패는 결제 확인을 막지 않음
        }
      }

      // 확인 로그 생성
      const { error: logError } = await this.supabase
        .from('payment_confirmations')
        .insert({
          payment_id: paymentId,
          admin_user_id: adminUserId,
          action_type: confirmData.action_type,
          previous_status: currentPayment.payment_status,
          new_status: newStatus,
          confirmation_note: confirmData.confirmation_note,
          confirmed_amount: confirmData.confirmed_amount,
          deposit_date: confirmData.deposit_date,
          bank_transaction_id: confirmData.bank_transaction_id
        })

      if (logError) {
        console.error('확인 로그 생성 오류:', logError)
        // 로그 생성 실패는 결제 확인을 막지 않음
      }

    } catch (error) {
      console.error('결제 확인 실패:', error)
      throw error
    }
  }

  // 관리자용 결제 목록 조회 (상태별 필터링)
  async getPaymentsForAdmin(status?: Payment['payment_status'], limit?: number): Promise<Payment[]> {
    try {
      let query = this.supabase
        .from('payments')
        .select(`
          *,
          bookings!inner(
            id,
            booking_date,
            booking_time,
            total_quantity,
            users!inner(
              email,
              user_metadata
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('payment_status', status)
      }

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('관리자 결제 목록 조회 오류:', error)
        throw new Error('결제 목록을 불러올 수 없습니다.')
      }

      return data || []
    } catch (error) {
      console.error('관리자 결제 목록 조회 실패:', error)
      throw error
    }
  }

  // 입금 대기 결제 목록 조회
  async getPendingPayments(): Promise<Payment[]> {
    return this.getPaymentsForAdmin('pending')
  }

  // 활성 입금 계좌 목록 조회
  async getActiveBankAccounts(): Promise<PaymentBankAccount[]> {
    try {
      const { data, error } = await this.supabase
        .from('payment_bank_accounts')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) {
        console.error('입금 계좌 조회 오류:', error)
        // 기본 계좌 정보 반환
        return this.getDefaultBankAccounts()
      }

      // 데이터가 없으면 기본 계좌 정보 반환
      if (!data || data.length === 0) {
        return this.getDefaultBankAccounts()
      }

      return data
    } catch (error) {
      console.error('입금 계좌 조회 실패:', error)
      // 오류 시에도 기본 계좌 정보 반환
      return this.getDefaultBankAccounts()
    }
  }

  // 기본 계좌 정보 (비상용)
  private getDefaultBankAccounts(): PaymentBankAccount[] {
    return [
      {
        id: 'default-1',
        bank_name: '국민은행',
        account_number: '123456-78-901234',
        account_holder: '칼가는곳',
        is_active: true,
        is_default: true,
        description: '주요 입금 계좌입니다. 입금 후 고객센터(1588-0000)로 연락해주세요.',
        display_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'default-2',
        bank_name: '신한은행',
        account_number: '987654-32-109876',
        account_holder: '칼가는곳',
        is_active: true,
        is_default: false,
        description: '보조 입금 계좌입니다.',
        display_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }

  // 기본 입금 계좌 조회
  async getDefaultBankAccount(): Promise<PaymentBankAccount | null> {
    try {
      const { data, error } = await this.supabase
        .from('payment_bank_accounts')
        .select('*')
        .eq('is_active', true)
        .eq('is_default', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // 기본 계좌가 없으면 첫 번째 활성 계좌 반환
          const accounts = await this.getActiveBankAccounts()
          return accounts.length > 0 ? accounts[0] : null
        }
        console.error('기본 입금 계좌 조회 오류:', error)
        throw new Error('기본 입금 계좌를 불러올 수 없습니다.')
      }

      return data
    } catch (error) {
      console.error('기본 입금 계좌 조회 실패:', error)
      throw error
    }
  }

  // 결제 확인 로그 조회
  async getPaymentConfirmations(paymentId: string): Promise<PaymentConfirmation[]> {
    try {
      const { data, error } = await this.supabase
        .from('payment_confirmations')
        .select('*')
        .eq('payment_id', paymentId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('결제 확인 로그 조회 오류:', error)
        throw new Error('결제 확인 로그를 불러올 수 없습니다.')
      }

      return data || []
    } catch (error) {
      console.error('결제 확인 로그 조회 실패:', error)
      throw error
    }
  }

  // 금액 포맷팅
  formatPrice(amount: number): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  // 결제 상태 한글명
  getPaymentStatusText(status: Payment['payment_status']): string {
    const statusMap = {
      pending: '입금 대기',
      confirmed: '결제 완료',
      failed: '결제 실패',
      cancelled: '결제 취소',
      refunded: '환불 완료'
    }
    return statusMap[status] || status
  }

  // 결제 방법 한글명
  getPaymentMethodText(method: Payment['payment_method']): string {
    const methodMap = {
      bank_transfer: '무통장입금',
      card: '신용카드',
      virtual_account: '가상계좌'
    }
    return methodMap[method] || method
  }

  // 결제 상태 색상 클래스
  getPaymentStatusColor(status: Payment['payment_status']): string {
    const colorMap = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      refunded: 'bg-purple-100 text-purple-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  // 날짜 포맷팅
  formatDate(dateString: string): string {
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