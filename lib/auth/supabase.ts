// 실제 Supabase 클라이언트 구현 - Lazy Loading
import type { SupabaseClient } from '@supabase/supabase-js'

// Lazy loading을 위한 동적 import
// Note: anon key용 기본 클라이언트만 캐싱 (JWT 클라이언트는 매번 새로 생성)
let supabaseAnonClientInstance: SupabaseClient<Database> | null = null

/**
 * Supabase 클라이언트 생성 (JWT 토큰 지원)
 * @param jwtToken - 선택적 JWT 토큰 (제공 시 RLS에서 auth.uid() 사용 가능)
 */
export async function getSupabaseClient(jwtToken?: string): Promise<SupabaseClient<Database>> {
  const { createClient } = await import('@supabase/supabase-js')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hrsqcroirtzbdoeheyxy.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhyc3Fjcm9pcnR6YmRvZWhleXh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNjEyNjUsImV4cCI6MjA2NjkzNzI2NX0.hoVI2aI4rJncvo_9w5ZTNTqtsdjWEdCnxzsvBAb7-cw'

  // JWT 토큰이 제공된 경우: 인증된 클라이언트 생성 (RLS 활성화)
  if (jwtToken) {
    console.log('Creating authenticated Supabase client with JWT token')
    return createClient<Database>(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${jwtToken}`
        }
      }
    })
  }

  // JWT 없는 경우: anon key 클라이언트 재사용 (로그인/회원가입용)
  if (!supabaseAnonClientInstance) {
    console.log('Creating anon Supabase client (no JWT)')
    supabaseAnonClientInstance = createClient<Database>(supabaseUrl, supabaseKey)
  }
  return supabaseAnonClientInstance
}

export interface AuthUser {
  id: string
  phone: string
  name: string
  created_at?: string
}

export interface UserProfile extends AuthUser {
  couponCount: number
  subscriptionStatus: 'none' | 'active' | 'expired'
  notificationEnabled: boolean
  totalServices: number
  memberGrade: 'bronze' | 'silver' | 'gold' | 'platinum'
}

interface AuthResponse {
  success: boolean
  data?: AuthUser
  error?: string
}

interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          phone: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          phone: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          phone?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      verification_codes: {
        Row: {
          id: string
          phone: string
          code: string
          type: string
          expires_at: string
          used: boolean
          created_at: string
        }
        Insert: {
          id?: string
          phone: string
          code: string
          type?: string
          expires_at: string
          used?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          phone?: string
          code?: string
          type?: string
          expires_at?: string
          used?: boolean
          created_at?: string
        }
      }
    }
  }
}


class SupabaseAuthClient {
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  private isValidPhone(phone: string): boolean {
    // 한국 휴대폰 번호 패턴 검증
    const phoneRegex = /^010-?\d{4}-?\d{4}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  private formatPhone(phone: string): string {
    // 전화번호 정규화 (하이픈 제거)
    return phone.replace(/[^0-9]/g, '')
  }

  async sendVerificationCode(phone: string): Promise<{ success: boolean; error?: string }> {
    const formattedPhone = this.formatPhone(phone)

    if (!this.isValidPhone(formattedPhone)) {
      return { success: false, error: '올바른 전화번호 형식이 아닙니다.' }
    }

    try {
      // 데이터베이스 함수를 통해 인증번호 생성
      const client = await getSupabaseClient()
      const { data, error } = await client.rpc('generate_verification_code', {
        p_phone: formattedPhone,
        p_type: 'phone_verification'
      })

      if (error) {
        console.error('인증번호 생성 오류:', error)
        return { success: false, error: '인증번호 생성에 실패했습니다.' }
      }

      // SMS 서비스를 통해 발송
      const { SMSService } = await import('@/lib/sms/sms-service')
      const smsSent = await SMSService.sendVerificationCode(formattedPhone, data)
      
      if (!smsSent) {
        console.error('SMS 발송 실패')
        // 개발 환경에서는 콘솔에도 출력
        if (process.env.NODE_ENV === 'development') {
          console.log(`[DEV] 인증번호: ${data}`)
        }
      }

      return { success: true }
    } catch (error) {
      console.error('SMS 발송 오류:', error)
      return { success: false, error: '인증번호 발송에 실패했습니다.' }
    }
  }

  async verifyCode(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
    const formattedPhone = this.formatPhone(phone)

    try {
      const client = await getSupabaseClient()
      const { data, error } = await client.rpc('verify_code', {
        p_phone: formattedPhone,
        p_code: code,
        p_type: 'phone_verification'
      })

      if (error) {
        console.error('인증번호 검증 오류:', error)
        return { success: false, error: '인증번호 검증에 실패했습니다.' }
      }

      if (!data) {
        return { success: false, error: '인증번호가 올바르지 않거나 만료되었습니다.' }
      }

      return { success: true }
    } catch (error) {
      console.error('인증 검증 오류:', error)
      return { success: false, error: '인증번호 검증 중 오류가 발생했습니다.' }
    }
  }

  async signUp(phone: string, name: string, verificationCode: string): Promise<AuthResponse> {
    const formattedPhone = this.formatPhone(phone)

    // 인증번호는 이미 verify-code API에서 검증되었으므로 여기서는 검증하지 않음
    // (검증하면 이미 사용된 코드로 인식되어 실패함)

    try {
      // 기존 사용자 확인
      const client = await getSupabaseClient()
      const { data: existingUser } = await client
        .from('users')
        .select('*')
        .eq('phone', formattedPhone)
        .single()

      if (existingUser) {
        return { success: false, error: '이미 가입된 전화번호입니다.' }
      }

      // 새 사용자 생성
      const { data: newUser, error } = await client
        .from('users')
        .insert({
          phone: formattedPhone,
          name: name.trim()
        })
        .select()
        .single()

      if (error) {
        console.error('사용자 생성 오류:', error)
        return { success: false, error: '회원가입에 실패했습니다.' }
      }

      const user: AuthUser = {
        id: newUser.id,
        phone: newUser.phone,
        name: newUser.name,
        created_at: newUser.created_at
      }

      return { success: true, data: user }
    } catch (error) {
      console.error('회원가입 오류:', error)
      return { success: false, error: '회원가입 처리 중 오류가 발생했습니다.' }
    }
  }

  async signIn(phone: string, verificationCode: string): Promise<AuthResponse> {
    const formattedPhone = this.formatPhone(phone)

    // 인증번호 검증
    const verification = await this.verifyCode(formattedPhone, verificationCode)
    if (!verification.success) {
      return { success: false, error: verification.error }
    }

    try {
      // 사용자 조회
      const client = await getSupabaseClient()
      const { data: user, error } = await client
        .from('users')
        .select('*')
        .eq('phone', formattedPhone)
        .single()

      if (error || !user) {
        return { success: false, error: '가입되지 않은 전화번호입니다.' }
      }

      const authUser: AuthUser = {
        id: user.id,
        phone: user.phone,
        name: user.name,
        created_at: user.created_at
      }

      return { success: true, data: authUser }
    } catch (error) {
      console.error('로그인 오류:', error)
      return { success: false, error: '로그인 처리 중 오류가 발생했습니다.' }
    }
  }

  async getUserProfile(userId: string, jwtToken?: string): Promise<{ success: boolean; data?: UserProfile; error?: string }> {
    try {
      const client = await getSupabaseClient(jwtToken)

      // 실제 데이터베이스에서 사용자 프로필 조회
      const { data: userData, error: userError } = await client
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('사용자 조회 오류:', userError)
        return { success: false, error: '사용자 정보를 찾을 수 없습니다.' }
      }

      // 사용자 프로필 정보 조회
      const { data: profileData, error: profileError } = await client
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (profileError) {
        console.error('프로필 조회 오류:', profileError)
        return { success: false, error: '프로필 조회 중 오류가 발생했습니다.' }
      }

      // 프로필이 없으면 기본값으로 생성
      if (!profileData) {
        const { data: newProfile, error: createError } = await client
          .from('user_profiles')
          .insert([{
            id: userId,
            coupon_count: 0,
            subscription_status: 'none',
            notification_enabled: true,
            total_services: 0,
            member_grade: 'bronze'
          }])
          .select('*')
          .single()

        if (createError) {
          console.error('프로필 생성 오류:', createError)
          return { success: false, error: '프로필 생성 중 오류가 발생했습니다.' }
        }

        return {
          success: true,
          data: {
            id: userId,
            phone: userData.phone,
            name: userData.name,
            created_at: userData.created_at,
            couponCount: newProfile?.coupon_count || 0,
            subscriptionStatus: newProfile?.subscription_status || 'none',
            notificationEnabled: newProfile?.notification_enabled || true,
            totalServices: newProfile?.total_services || 0,
            memberGrade: newProfile?.member_grade || 'bronze'
          }
        }
      }

      // 기존 프로필 데이터 반환
      return {
        success: true,
        data: {
          id: userId,
          phone: userData.phone,
          name: userData.name,
          created_at: userData.created_at,
          couponCount: profileData.coupon_count || 0,
          subscriptionStatus: profileData.subscription_status || 'none',
          notificationEnabled: profileData.notification_enabled || true,
          totalServices: profileData.total_services || 0,
          memberGrade: profileData.member_grade || 'bronze'
        }
      }
    } catch (error) {
      console.error('프로필 조회 오류:', error)
      return { success: false, error: '프로필 조회 중 오류가 발생했습니다.' }
    }
  }

  async updateUserInfo(userId: string, name: string, phone: string, jwtToken?: string): Promise<{ success: boolean; data?: AuthUser; error?: string }> {
    const formattedPhone = this.formatPhone(phone)

    if (!this.isValidPhone(formattedPhone)) {
      return { success: false, error: '올바른 전화번호 형식이 아닙니다.' }
    }

    try {
      // 다른 사용자가 같은 전화번호를 사용하는지 확인
      const client = await getSupabaseClient(jwtToken)
      const { data: existingUser } = await client
        .from('users')
        .select('id')
        .eq('phone', formattedPhone)
        .neq('id', userId)
        .single()

      if (existingUser) {
        return { success: false, error: '이미 사용 중인 전화번호입니다.' }
      }

      // 사용자 정보 업데이트
      const { data: updatedUser, error } = await client
        .from('users')
        .update({
          name: name.trim(),
          phone: formattedPhone,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('사용자 정보 업데이트 오류:', error)
        return { success: false, error: '정보 수정에 실패했습니다.' }
      }

      const authUser: AuthUser = {
        id: updatedUser.id,
        phone: updatedUser.phone,
        name: updatedUser.name,
        created_at: updatedUser.created_at
      }

      return { success: true, data: authUser }
    } catch (error) {
      console.error('정보 수정 오류:', error)
      return { success: false, error: '정보 수정 처리 중 오류가 발생했습니다.' }
    }
  }
}

export const supabase = new SupabaseAuthClient()

// Supabase 클라이언트 싱글톤 인스턴스
let browserSupabaseClient: any = null

// Supabase 클라이언트 생성 함수 export (싱글톤 패턴)
export function createClient() {
  if (browserSupabaseClient) {
    return browserSupabaseClient
  }

  const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  browserSupabaseClient = createSupabaseClient(supabaseUrl, supabaseKey)
  return browserSupabaseClient
}
