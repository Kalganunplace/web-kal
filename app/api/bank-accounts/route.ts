import { NextResponse } from 'next/server'
import { paymentService } from '@/lib/payment-service'

/**
 * 공개 API: 활성 계좌 목록 조회
 * 클라이언트가 결제 시 사용할 수 있는 계좌 정보를 제공합니다.
 * 인증 불필요 (공개 정보)
 */
export async function GET() {
  try {
    const bankAccounts = await paymentService.getActiveBankAccounts()

    return NextResponse.json({
      success: true,
      data: bankAccounts
    })
  } catch (error) {
    console.error('Bank accounts API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: '계좌 정보를 불러오는 중 오류가 발생했습니다.'
      },
      { status: 500 }
    )
  }
}
