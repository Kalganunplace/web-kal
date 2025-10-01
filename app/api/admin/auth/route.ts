// 이 파일은 더 이상 사용되지 않습니다.
// /api/auth/admin/login을 사용하세요.
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'This endpoint is deprecated. Please use /api/auth/admin/login instead.'
    },
    { status: 410 }
  );
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'This endpoint is deprecated. Please use /api/auth/me instead.'
    },
    { status: 410 }
  );
}