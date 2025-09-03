import { createClient } from '@/lib/auth/supabase'

export interface InsuranceProduct {
  id: string
  name: string
  description: string
  coverage_amount: number
  premium_rate: number
  min_premium: number
  max_premium?: number
  coverage_details: {
    coverage_types: string[]
    exclusions: string[]
    processing_time: string
    required_documents: string[]
  }
  terms: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserInsurance {
  id: string
  user_id: string
  insurance_product_id: string
  booking_id: string
  premium_amount: number
  coverage_amount: number
  policy_number: string
  status: 'active' | 'expired' | 'claimed'
  start_date: string
  end_date?: string
  created_at: string
  updated_at: string
  insurance_product?: InsuranceProduct
  booking?: {
    booking_date: string
    total_amount: number
  }
}

export interface InsuranceClaim {
  id: string
  user_insurance_id: string
  claim_amount: number
  damage_description: string
  damage_photos: string[]
  claim_reason: string
  status: 'submitted' | 'reviewing' | 'approved' | 'denied' | 'paid'
  admin_notes?: string
  approved_amount?: number
  processed_at?: string
  created_at: string
  updated_at: string
  user_insurance?: UserInsurance
}

export interface CreateInsuranceClaimData {
  user_insurance_id: string
  claim_amount: number
  damage_description: string
  damage_photos: string[]
  claim_reason: string
}

export class InsuranceService {
  private supabase = createClient()

  // 보험 상품 조회
  async getInsuranceProducts(): Promise<InsuranceProduct[]> {
    const { data, error } = await this.supabase
      .from('insurance_products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('보험 상품 조회 오류:', error)
      throw new Error('보험 상품을 불러올 수 없습니다.')
    }

    return data || []
  }

  // 보험료 계산
  calculatePremium(serviceAmount: number, coverageAmount: number, premiumRate: number, minPremium: number, maxPremium?: number): number {
    // 서비스 금액 기준 보험료 계산
    let calculatedPremium = Math.max(serviceAmount, coverageAmount) * premiumRate

    // 최소 보험료 적용
    calculatedPremium = Math.max(calculatedPremium, minPremium)

    // 최대 보험료 적용 (있는 경우)
    if (maxPremium) {
      calculatedPremium = Math.min(calculatedPremium, maxPremium)
    }

    return Math.round(calculatedPremium)
  }

  // 사용자 보험 가입
  async subscribeInsurance(userId: string, data: {
    insurance_product_id: string
    booking_id: string
    coverage_amount: number
    premium_amount: number
  }): Promise<UserInsurance> {
    try {
      // 보험증권번호 생성
      const { data: policyResult, error: policyError } = await this.supabase
        .rpc('generate_policy_number')

      if (policyError) {
        console.error('보험증권번호 생성 오류:', policyError)
        throw new Error('보험증권번호를 생성할 수 없습니다.')
      }

      const policyNumber = policyResult as string

      // 보험 가입 데이터 삽입
      const { data: insuranceData, error } = await this.supabase
        .from('user_insurances')
        .insert([{
          user_id: userId,
          insurance_product_id: data.insurance_product_id,
          booking_id: data.booking_id,
          premium_amount: data.premium_amount,
          coverage_amount: data.coverage_amount,
          policy_number: policyNumber,
          status: 'active',
          start_date: new Date().toISOString(),
          // 보험 기간은 서비스 완료 후 30일로 설정
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }])
        .select(`
          *,
          insurance_product:insurance_products(*),
          booking:bookings(booking_date, total_amount)
        `)
        .single()

      if (error) {
        console.error('보험 가입 오류:', error)
        throw new Error('보험 가입 중 오류가 발생했습니다.')
      }

      return insuranceData
    } catch (error) {
      console.error('보험 가입 실패:', error)
      throw new Error('보험 가입을 처리할 수 없습니다.')
    }
  }

  // 사용자 보험 목록 조회
  async getUserInsurances(userId: string): Promise<UserInsurance[]> {
    const { data, error } = await this.supabase
      .from('user_insurances')
      .select(`
        *,
        insurance_product:insurance_products(*),
        booking:bookings(booking_date, total_amount)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('사용자 보험 목록 조회 오류:', error)
      throw new Error('보험 목록을 불러올 수 없습니다.')
    }

    return data || []
  }

  // 특정 예약의 보험 조회
  async getInsuranceByBooking(bookingId: string): Promise<UserInsurance | null> {
    const { data, error } = await this.supabase
      .from('user_insurances')
      .select(`
        *,
        insurance_product:insurance_products(*),
        booking:bookings(booking_date, total_amount)
      `)
      .eq('booking_id', bookingId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // 보험이 없는 경우
      }
      console.error('예약 보험 조회 오류:', error)
      throw new Error('보험 정보를 불러올 수 없습니다.')
    }

    return data
  }

  // 보험 청구 생성
  async createInsuranceClaim(userId: string, claimData: CreateInsuranceClaimData): Promise<InsuranceClaim> {
    try {
      // 사용자 보험 확인
      const { data: userInsurance, error: insuranceError } = await this.supabase
        .from('user_insurances')
        .select('*')
        .eq('id', claimData.user_insurance_id)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (insuranceError || !userInsurance) {
        throw new Error('유효하지 않은 보험 정보입니다.')
      }

      // 보험 청구 생성
      const { data, error } = await this.supabase
        .from('insurance_claims')
        .insert([{
          user_insurance_id: claimData.user_insurance_id,
          claim_amount: claimData.claim_amount,
          damage_description: claimData.damage_description,
          damage_photos: claimData.damage_photos,
          claim_reason: claimData.claim_reason,
          status: 'submitted'
        }])
        .select(`
          *,
          user_insurance:user_insurances(
            *,
            insurance_product:insurance_products(*),
            booking:bookings(booking_date, total_amount)
          )
        `)
        .single()

      if (error) {
        console.error('보험 청구 생성 오류:', error)
        throw new Error('보험 청구를 생성할 수 없습니다.')
      }

      return data
    } catch (error) {
      console.error('보험 청구 실패:', error)
      throw new Error('보험 청구를 처리할 수 없습니다.')
    }
  }

  // 사용자 보험 청구 목록 조회
  async getUserInsuranceClaims(userId: string): Promise<InsuranceClaim[]> {
    const { data, error } = await this.supabase
      .from('insurance_claims')
      .select(`
        *,
        user_insurance:user_insurances!inner(
          *,
          insurance_product:insurance_products(*),
          booking:bookings(booking_date, total_amount)
        )
      `)
      .eq('user_insurance.user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('보험 청구 목록 조회 오류:', error)
      throw new Error('보험 청구 목록을 불러올 수 없습니다.')
    }

    return data || []
  }

  // 보험 청구 상세 조회
  async getInsuranceClaim(userId: string, claimId: string): Promise<InsuranceClaim | null> {
    const { data, error } = await this.supabase
      .from('insurance_claims')
      .select(`
        *,
        user_insurance:user_insurances!inner(
          *,
          insurance_product:insurance_products(*),
          booking:bookings(booking_date, total_amount)
        )
      `)
      .eq('id', claimId)
      .eq('user_insurance.user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('보험 청구 상세 조회 오류:', error)
      throw new Error('보험 청구 정보를 불러올 수 없습니다.')
    }

    return data
  }

  // 보험 상태 라벨
  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'active': '보장중',
      'expired': '만료됨',
      'claimed': '청구됨'
    }
    return statusLabels[status] || status
  }

  // 보험 청구 상태 라벨
  getClaimStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'submitted': '접수됨',
      'reviewing': '검토중',
      'approved': '승인됨',
      'denied': '거부됨',
      'paid': '지급완료'
    }
    return statusLabels[status] || status
  }

  // 보험 청구 상태 색상
  getClaimStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'submitted': 'bg-blue-100 text-blue-800',
      'reviewing': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'denied': 'bg-red-100 text-red-800',
      'paid': 'bg-purple-100 text-purple-800'
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800'
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

export const insuranceService = new InsuranceService()