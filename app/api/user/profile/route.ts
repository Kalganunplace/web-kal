import { NextRequest, NextResponse } from 'next/server'
import { JWTService } from '@/lib/auth/jwt'
import { supabase } from '@/lib/auth/supabase'

/**
 * GET /api/user/profile
 * 사용자 프로필 조회 (JWT 토큰 기반)
 */
export async function GET(request: NextRequest) {
  try {
    // 쿠키에서 JWT 토큰 가져오기
    const jwtToken = await JWTService.getTokenFromCookie()

    if (!jwtToken) {
      return NextResponse.json(
        { success: false, error: '인증 토큰이 없습니다.' },
        { status: 401 }
      )
    }

    // JWT 토큰 검증
    const payload = await JWTService.verifyToken(jwtToken)

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      )
    }

    // Supabase에서 프로필 조회 (JWT 토큰 전달)
    const result = await supabase.getUserProfile(payload.userId, jwtToken)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { success: false, error: '프로필 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/user/profile
 * 사용자 정보 수정 (JWT 토큰 기반)
 */
export async function PUT(request: NextRequest) {
  try {
    // 쿠키에서 JWT 토큰 가져오기
    const jwtToken = await JWTService.getTokenFromCookie()

    if (!jwtToken) {
      return NextResponse.json(
        { success: false, error: '인증 토큰이 없습니다.' },
        { status: 401 }
      )
    }

    // JWT 토큰 검증
    const payload = await JWTService.verifyToken(jwtToken)

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      )
    }

    // 요청 본문 파싱
    const body = await request.json()
    const { name, phone } = body

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: '이름과 전화번호는 필수입니다.' },
        { status: 400 }
      )
    }

    // Supabase에서 사용자 정보 업데이트 (JWT 토큰 전달)
    const result = await supabase.updateUserInfo(payload.userId, name, phone, jwtToken)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { success: false, error: '프로필 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
