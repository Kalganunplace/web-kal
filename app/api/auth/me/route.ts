import { UnifiedAuthService } from '@/lib/auth/unified'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 🔍 디버깅: 쿠키 확인
    const cookies = request.cookies.getAll()
    const authToken = request.cookies.get('auth-token')
    console.log('[/api/auth/me] Cookies received:', cookies.map(c => c.name))
    console.log('[/api/auth/me] auth-token exists:', !!authToken)
    console.log('[/api/auth/me] auth-token length:', authToken?.value?.length || 0)
    console.log('[/api/auth/me] NODE_ENV:', process.env.NODE_ENV)

    // 현재 인증된 사용자 정보 조회
    const result = await UnifiedAuthService.getCurrentUser()

    if (!result.success) {
      console.log('[/api/auth/me] Auth failed:', result.error)
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      )
    }

    console.log('[/api/auth/me] Auth success:', result.user?.id)
    return NextResponse.json({
      success: true,
      user: result.user
    })
  } catch (error) {
    console.error('[/api/auth/me] Error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
