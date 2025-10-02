import { JWTService } from '@/lib/auth/jwt'
import { UnifiedAuthService } from '@/lib/auth/unified'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, name, verificationCode } = body

    if (!phone || !name || !verificationCode) {
      return NextResponse.json(
        { success: false, error: '전화번호, 이름, 인증번호를 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 클라이언트 회원가입 처리
    const result = await UnifiedAuthService.clientSignup({ phone, name, verificationCode })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    // JWT 토큰을 HttpOnly 쿠키로 설정
    const response = NextResponse.json({
      success: true,
      user: result.user
    })

    if (result.token) {
      console.log('Setting JWT token in cookie for new user:', result.user?.id)

      response.cookies.set('auth-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24시간
        path: '/'
      })

      console.log('JWT token set in cookie successfully')
    }

    return response
  } catch (error) {
    console.error('Client signup API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
