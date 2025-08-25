// 실제 Supabase 클라이언트 구현
import { createClient } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  phone: string
  name: string
  created_at?: string
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

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey)

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
      const { data, error } = await supabaseClient.rpc('generate_verification_code', {
        p_phone: formattedPhone,
        p_type: 'phone_verification'
      })

      if (error) {
        console.error('인증번호 생성 오류:', error)
        return { success: false, error: '인증번호 생성에 실패했습니다.' }
      }

      // 실제로는 SMS 서비스를 통해 발송 (나중에 Twilio 연결)
      console.log(`[SMS] ${formattedPhone}로 인증번호 발송: ${data}`)
      
      return { success: true }
    } catch (error) {
      console.error('SMS 발송 오류:', error)
      return { success: false, error: '인증번호 발송에 실패했습니다.' }
    }
  }

  async verifyCode(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
    const formattedPhone = this.formatPhone(phone)
    
    try {
      const { data, error } = await supabaseClient.rpc('verify_code', {
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
    
    // 인증번호 검증
    const verification = await this.verifyCode(formattedPhone, verificationCode)
    if (!verification.success) {
      return { success: false, error: verification.error }
    }

    try {
      // 기존 사용자 확인
      const { data: existingUser } = await supabaseClient
        .from('users')
        .select('*')
        .eq('phone', formattedPhone)
        .single()

      if (existingUser) {
        return { success: false, error: '이미 가입된 전화번호입니다.' }
      }

      // 새 사용자 생성
      const { data: newUser, error } = await supabaseClient
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
      const { data: user, error } = await supabaseClient
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
}

export const supabase = new SupabaseAuthClient()