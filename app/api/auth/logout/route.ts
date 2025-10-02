import { JWTService } from '@/lib/auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Logging out user, clearing auth-token cookie')

    // 응답 생성 및 쿠키 삭제
    const response = NextResponse.json({
      success: true,
      message: '로그아웃되었습니다.'
    })

    // 쿠키 삭제
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // 즉시 만료
      path: '/'
    })

    console.log('JWT token cookie cleared successfully')

    return response
  } catch (error) {
    console.error('Logout API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
