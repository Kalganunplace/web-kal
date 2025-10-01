import { JWTService } from '@/lib/auth/jwt'
import { UnifiedAuthService } from '@/lib/auth/unified'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: '아이디와 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 관리자 로그인 처리
    const result = await UnifiedAuthService.adminLogin({ username, password })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      )
    }

    // 응답 생성
    const response = NextResponse.json({
      success: true,
      user: result.user
    })

    // JWT 토큰을 HttpOnly 쿠키로 설정
    if (result.token) {
      JWTService.setTokenCookie(result.token, response)
    }

    return response
  } catch (error) {
    console.error('Admin login API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
