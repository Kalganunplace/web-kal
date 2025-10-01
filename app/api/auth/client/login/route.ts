import { JWTService } from '@/lib/auth/jwt'
import { UnifiedAuthService } from '@/lib/auth/unified'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, verificationCode } = body

    if (!phone || !verificationCode) {
      return NextResponse.json(
        { success: false, error: '전화번호와 인증번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 클라이언트 로그인 처리
    const result = await UnifiedAuthService.clientLogin({ phone, verificationCode })

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
      try {
        console.log('Setting JWT token in cookie for user:', result.user?.id)
        JWTService.setTokenCookie(result.token, response)
        console.log('JWT token set in cookie successfully')
      } catch (cookieError) {
        console.error('JWT cookie setting failed:', cookieError)
        // 쿠키 설정 실패는 치명적이지 않으므로 에러를 throw하지 않음
      }
    }

    return response
  } catch (error) {
    console.error('Client login API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
