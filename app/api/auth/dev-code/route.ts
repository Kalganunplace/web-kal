import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth/supabase'

export async function POST(req: NextRequest) {
  // 개발 환경에서만 동작
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }

  try {
    const { phone } = await req.json()
    
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // 전화번호 정규화 (하이픈 제거)
    const formattedPhone = phone.replace(/[^0-9]/g, '')
    
    // Supabase 클라이언트 생성
    const supabase = createClient()
    
    // 가장 최근의 미사용 인증코드 조회
    const { data, error } = await supabase
      .from('verification_codes')
      .select('code, expires_at')
      .eq('phone', formattedPhone)
      .eq('used', false)
      .eq('type', 'phone_verification')
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error || !data) {
      console.log('No valid verification code found:', error)
      return NextResponse.json(
        { error: 'No valid verification code found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      data: {
        code: data.code,
        expires_at: data.expires_at
      }
    })
  } catch (error) {
    console.error('Error fetching dev code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}