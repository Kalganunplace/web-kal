import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

// Supabase JWT Secret 사용 (RLS 연동을 위해)
const secret = new TextEncoder().encode(
  process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export interface JWTPayload {
  userId: string
  userType: 'client' | 'admin'
  role?: string
  permissions?: string[]
  exp: number
  iat: number
}

export interface ClientJWTPayload extends JWTPayload {
  userType: 'client'
  phone: string
  name: string
  role?: string
  permissions?: string[]
}

export interface AdminJWTPayload extends JWTPayload {
  userType: 'admin'
  email?: string
  name: string
  role: string
  permissions: string[]
}

export class JWTService {
  /**
   * JWT 토큰 생성 (Supabase RLS 호환)
   */
  static async createToken(payload: any): Promise<string> {
    try {
      console.log('JWT createToken called with payload:', payload)
      console.log('JWT secret length:', secret.length)

      // JWT 토큰 생성 (Supabase 호환 필드 포함)
      const token = await new SignJWT({
        // Supabase RLS를 위한 필수 필드
        sub: payload.userId,  // ⭐ Supabase auth.uid()가 인식하는 필드
        role: 'authenticated', // ⭐ Supabase role (authenticated/anon)

        // 기존 커스텀 필드 (하위 호환성 유지)
        userId: payload.userId,
        userType: payload.userType,
        phone: payload.phone,
        email: payload.email,
        name: payload.name,
        user_role: payload.role, // admin의 role은 user_role로 저장 (Supabase role과 구분)
        permissions: payload.permissions
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret)

      console.log('JWT token created successfully, length:', token.length)
      return token
    } catch (error) {
      console.error('JWT createToken error:', error)
      throw error
    }
  }

  /**
   * JWT 토큰 검증
   */
  static async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      console.log('Verifying JWT token, length:', token.length)
      const { payload } = await jwtVerify(token, secret)
      console.log('JWT token verified successfully:', { userId: payload.userId, userType: payload.userType })
      return payload as JWTPayload
    } catch (error) {
      console.error('JWT verification failed:', error)
      if (error instanceof Error) {
        console.error('JWT error details:', error.message)
      }
      return null
    }
  }

  /**
   * 쿠키에서 토큰 가져오기
   */
  static async getTokenFromCookie(): Promise<string | null> {
    const cookieStore = await cookies()
    return cookieStore.get('auth-token')?.value || null
  }

  /**
   * 쿠키에 토큰 설정
   */
  static async setTokenCookie(token: string): Promise<void> {
    const maxAge = 24 * 60 * 60 // 24시간 (초 단위)

    try {
      const cookieStore = await cookies()
      cookieStore.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: maxAge,
        path: '/'
      })
      console.log('JWT token cookie set successfully')
    } catch (error) {
      console.error('Failed to set JWT token cookie:', error)
      throw error
    }
  }

  /**
   * 쿠키에서 토큰 삭제
   */
  static async clearTokenCookie(): Promise<void> {
    try {
      const cookieStore = await cookies()
      cookieStore.delete('auth-token')
      console.log('JWT token cookie cleared successfully')
    } catch (error) {
      console.error('Failed to clear JWT token cookie:', error)
      throw error
    }
  }

  /**
   * 현재 인증된 사용자 정보 가져오기 (서버사이드)
   */
  static async getCurrentUser(): Promise<JWTPayload | null> {
    const token = await this.getTokenFromCookie()
    if (!token) return null

    return await this.verifyToken(token)
  }

  /**
   * 클라이언트 사이드에서 토큰 가져오기
   */
  static getTokenFromClient(): string | null {
    if (typeof document === 'undefined') return null

    const cookies = document.cookie.split(';')
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='))

    if (tokenCookie) {
      return tokenCookie.split('=')[1]
    }

    return null
  }

  /**
   * 클라이언트 사이드에서 현재 사용자 정보 가져오기
   */
  static async getCurrentUserFromClient(): Promise<JWTPayload | null> {
    const token = this.getTokenFromClient()
    if (!token) return null

    return await this.verifyToken(token)
  }
}
