import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/auth/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, code } = body

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: '전화번호와 인증번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 자체 인증 시스템을 사용하여 인증번호 검증
    const result = await supabase.verifyCode(phone, code)

    if (!result.success) {
      console.error('[Verify Code] Error:', result.error)
      return NextResponse.json(
        { success: false, error: result.error || '잘못된 인증번호입니다. 다시 입력해 주세요' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[Verify Code] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: '인증번호 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
