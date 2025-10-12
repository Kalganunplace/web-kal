import { NextRequest, NextResponse } from 'next/server';
import { UnifiedAuthService } from '@/lib/auth/unified';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: '현재 비밀번호와 새 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: '새 비밀번호는 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 현재 인증된 사용자 확인
    const authResult = await UnifiedAuthService.getCurrentUser();
    if (!authResult.success || !authResult.user || authResult.user.type !== 'admin') {
      return NextResponse.json(
        { success: false, error: '인증되지 않았습니다.' },
        { status: 401 }
      );
    }

    const adminId = authResult.user.id;

    // Supabase에서 현재 관리자 정보 조회
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: admin, error: fetchError } = await supabase
      .from('admins')
      .select('password_hash, username')
      .eq('id', adminId)
      .single();

    if (fetchError || !admin) {
      return NextResponse.json(
        { success: false, error: '관리자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 현재 비밀번호 확인
    const isValidPassword = bcrypt.compareSync(currentPassword, admin.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: '현재 비밀번호가 일치하지 않습니다.' },
        { status: 400 }
      );
    }

    // 새 비밀번호 해시 생성
    const newPasswordHash = bcrypt.hashSync(newPassword, 10);

    // 비밀번호 업데이트
    const { error: updateError } = await supabase
      .from('admins')
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', adminId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: '비밀번호 변경 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
