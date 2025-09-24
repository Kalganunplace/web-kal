import { supabase } from './supabase'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'admin' | 'staff'
  permissions: string[]
  is_active: boolean
  created_at: string
}

export interface AdminLoginCredentials {
  email: string
  password: string
}

export class AdminAuth {
  private static instance: AdminAuth
  private currentAdmin: AdminUser | null = null

  private constructor() {}

  static getInstance(): AdminAuth {
    if (!AdminAuth.instance) {
      AdminAuth.instance = new AdminAuth()
    }
    return AdminAuth.instance
  }

  async login(credentials: AdminLoginCredentials): Promise<{ success: boolean; admin?: AdminUser; error?: string }> {
    try {
      // 임시 하드코딩된 관리자 계정 (실제 운영시에는 데이터베이스 연동)
      const adminAccounts = [
        {
          id: '1',
          email: 'admin@kalganenungot.com',
          password: 'admin123!',
          name: '관리자',
          role: 'super_admin' as const,
          permissions: ['*'],
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: '2', 
          email: 'staff@kalganenungot.com',
          password: 'staff123!',
          name: '직원',
          role: 'staff' as const,
          permissions: ['bookings', 'customers', 'pricing'],
          is_active: true,
          created_at: new Date().toISOString()
        }
      ]

      const admin = adminAccounts.find(
        acc => acc.email === credentials.email && acc.password === credentials.password
      )

      if (!admin) {
        return { success: false, error: '이메일 또는 비밀번호가 잘못되었습니다.' }
      }

      if (!admin.is_active) {
        return { success: false, error: '비활성화된 계정입니다.' }
      }

      // 비밀번호를 제외한 정보만 저장
      const { password, ...adminUser } = admin
      this.currentAdmin = adminUser

      // localStorage에 세션 저장 (실제로는 JWT 토큰 사용 권장)
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_session', JSON.stringify({
          admin: adminUser,
          timestamp: Date.now()
        }))
      }

      return { success: true, admin: adminUser }
    } catch (error) {
      console.error('Admin login error:', error)
      return { success: false, error: '로그인 중 오류가 발생했습니다.' }
    }
  }

  async logout(): Promise<void> {
    this.currentAdmin = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_session')
    }
  }

  getCurrentAdmin(): AdminUser | null {
    if (this.currentAdmin) {
      return this.currentAdmin
    }

    // localStorage에서 세션 복원
    try {
      if (typeof window !== 'undefined') {
        const session = localStorage.getItem('admin_session')
        if (session) {
          const { admin, timestamp } = JSON.parse(session)
          
          // 24시간 세션 만료
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
            this.currentAdmin = admin
            return admin
          } else {
            this.logout()
          }
        }
      }
    } catch (error) {
      console.error('Session restore error:', error)
      this.logout()
    }

    return null
  }

  isAuthenticated(): boolean {
    return this.getCurrentAdmin() !== null
  }

  hasPermission(permission: string): boolean {
    const admin = this.getCurrentAdmin()
    if (!admin) return false
    
    // super_admin은 모든 권한
    if (admin.role === 'super_admin') return true
    
    // 와일드카드 권한 확인
    if (admin.permissions.includes('*')) return true
    
    // 특정 권한 확인
    return admin.permissions.includes(permission)
  }

  requireAuth(): AdminUser {
    const admin = this.getCurrentAdmin()
    if (!admin) {
      throw new Error('Authentication required')
    }
    return admin
  }

  requirePermission(permission: string): void {
    if (!this.hasPermission(permission)) {
      throw new Error(`Permission required: ${permission}`)
    }
  }
}

export const adminAuth = AdminAuth.getInstance()