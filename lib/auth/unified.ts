import { AdminJWTPayload, ClientJWTPayload, JWTService } from './jwt'
import { supabase } from './supabase'

export interface AuthResult {
  success: boolean
  token?: string
  user?: any
  error?: string
}

export interface ClientLoginCredentials {
  phone: string
  verificationCode: string
}

export interface ClientSignupCredentials {
  phone: string
  name: string
  verificationCode: string
}

export interface AdminLoginCredentials {
  username: string
  password: string
}

export class UnifiedAuthService {
  /**
   * 클라이언트 로그인 (전화번호 + 인증코드)
   */
  static async clientLogin(credentials: ClientLoginCredentials): Promise<AuthResult> {
    try {
      console.log('Client login attempt:', { phone: credentials.phone, verificationCode: credentials.verificationCode })

      // Supabase를 통한 인증번호 검증 및 사용자 조회
      const response = await supabase.signIn(credentials.phone, credentials.verificationCode)

      console.log('Supabase signIn response:', response)

      if (!response.success || !response.data) {
        console.log('SignIn failed:', response.error)
        return { success: false, error: response.error || '로그인에 실패했습니다.' }
      }

      console.log('User data retrieved successfully:', response.data)

      // JWT 토큰 생성
      const token = await JWTService.createToken({
        userId: response.data.id,
        userType: 'client',
        phone: response.data.phone,
        name: response.data.name
      })

      console.log('JWT token created for client login')

      return {
        success: true,
        token,
        user: {
          ...response.data,
          type: 'client'
        }
      }
    } catch (error) {
      console.error('Client login error:', error)
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      return { success: false, error: '로그인 처리 중 오류가 발생했습니다.' }
    }
  }

  /**
   * 클라이언트 회원가입 (전화번호 + 인증코드)
   */
  static async clientSignup(credentials: ClientSignupCredentials): Promise<AuthResult> {
    try {
      // Supabase를 통한 회원가입
      const response = await supabase.signUp(credentials.phone, credentials.name, credentials.verificationCode)

      if (!response.success || !response.data) {
        return { success: false, error: response.error || '회원가입에 실패했습니다.' }
      }

      // JWT 토큰 생성
      const token = await JWTService.createToken({
        userId: response.data.id,
        userType: 'client',
        phone: response.data.phone,
        name: response.data.name
      })

      return {
        success: true,
        token,
        user: {
          ...response.data,
          type: 'client'
        }
      }
    } catch (error) {
      console.error('Client signup error:', error)
      return { success: false, error: '회원가입 처리 중 오류가 발생했습니다.' }
    }
  }

  /**
   * 관리자 로그인 (아이디 + 비밀번호)
   */
  static async adminLogin(credentials: AdminLoginCredentials): Promise<AuthResult> {
    try {
      console.log('[AdminLogin] Attempting login for username:', credentials.username)
      const { getSupabaseClient } = await import('./supabase')
      const client = await getSupabaseClient()
      const { compareSync } = await import('bcryptjs')

      // Supabase에서 관리자 조회
      const { data: admin, error } = await client
        .from('admins')
        .select('*')
        .eq('username', credentials.username)
        .eq('is_active', true)
        .single()

      console.log('[AdminLogin] Query result:', { admin: admin ? { id: admin.id, username: admin.username, role: admin.role } : null, error })

      if (error || !admin) {
        console.log('[AdminLogin] Admin not found or error:', error)
        return { success: false, error: '아이디 또는 비밀번호가 잘못되었습니다.' }
      }

      // 비밀번호 검증
      console.log('[AdminLogin] Verifying password...')
      const isValidPassword = compareSync(credentials.password, admin.password_hash)
      console.log('[AdminLogin] Password valid:', isValidPassword)
      if (!isValidPassword) {
        return { success: false, error: '아이디 또는 비밀번호가 잘못되었습니다.' }
      }

      // 마지막 로그인 시간 업데이트
      await client
        .from('admins')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', admin.id)

      // JWT 토큰 생성
      const token = await JWTService.createToken({
        userId: admin.id,
        userType: 'admin',
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.role === 'super_admin' ? ['*'] : []
      })

      return {
        success: true,
        token,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          type: 'admin'
        }
      }
    } catch (error) {
      console.error('Admin login error:', error)
      return { success: false, error: '로그인 중 오류가 발생했습니다.' }
    }
  }

  /**
   * 토큰 검증 및 사용자 정보 반환
   */
  static async verifyToken(token: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const payload = await JWTService.verifyToken(token)

      if (!payload) {
        return { success: false, error: '유효하지 않은 토큰입니다.' }
      }

      // 토큰 타입에 따라 사용자 정보 구성
      if (payload.userType === 'client') {
        const clientPayload = payload as ClientJWTPayload
        return {
          success: true,
          user: {
            id: clientPayload.userId,
            phone: clientPayload.phone,
            name: clientPayload.name,
            type: 'client'
          }
        }
      } else if (payload.userType === 'admin') {
        const adminPayload = payload as any // user_role 필드 접근을 위해 any 사용
        return {
          success: true,
          user: {
            id: adminPayload.userId,
            email: adminPayload.email,
            name: adminPayload.name,
            role: adminPayload.user_role || adminPayload.role, // user_role 우선, 하위 호환성 위해 role도 확인
            permissions: adminPayload.permissions,
            type: 'admin'
          }
        }
      }

      return { success: false, error: '알 수 없는 사용자 타입입니다.' }
    } catch (error) {
      console.error('Token verification error:', error)
      return { success: false, error: '토큰 검증 중 오류가 발생했습니다.' }
    }
  }

  /**
   * 현재 인증된 사용자 정보 가져오기 (서버사이드)
   */
  static async getCurrentUser(): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const token = await JWTService.getTokenFromCookie()
      if (!token) {
        return { success: false, error: '인증 토큰이 없습니다.' }
      }

      return await this.verifyToken(token)
    } catch (error) {
      console.error('Get current user error:', error)
      return { success: false, error: '사용자 정보 조회 중 오류가 발생했습니다.' }
    }
  }

  /**
   * 로그아웃 (토큰 무효화)
   */
  static async logout(): Promise<{ success: boolean }> {
    try {
      // 서버 사이드에서 쿠키 삭제
      await JWTService.clearTokenCookie()

      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false }
    }
  }

  /**
   * 권한 확인
   */
  static async hasPermission(permission: string): Promise<boolean> {
    try {
      const result = await this.getCurrentUser()
      if (!result.success || !result.user || result.user.type !== 'admin') {
        return false
      }

      const adminUser = result.user

      // super_admin은 모든 권한
      if (adminUser.role === 'super_admin') return true

      // 와일드카드 권한 확인
      if (adminUser.permissions?.includes('*')) return true

      // 특정 권한 확인
      return adminUser.permissions?.includes(permission) || false
    } catch (error) {
      console.error('Permission check error:', error)
      return false
    }
  }
}
