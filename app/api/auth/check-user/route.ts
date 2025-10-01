import { getSupabaseClient } from '@/lib/auth/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = body

    if (!phone) {
      return NextResponse.json(
        { success: false, error: '전화번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 전화번호 포맷팅 (하이픈 제거)
    const formattedPhone = phone.replace(/-/g, '')

    // Supabase에서 사용자 확인
    const client = await getSupabaseClient()
    const { data: existingUser, error } = await client
      .from('users')
      .select('id')
      .eq('phone', formattedPhone)
      .maybeSingle()

    return NextResponse.json({
      success: true,
      exists: !!existingUser
    })
  } catch (error) {
    console.error('Check user API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
