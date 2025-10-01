import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminAuth } from '@/middleware/admin-auth';
import { hashSync, genSaltSync } from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// 관리자 목록 조회 (슈퍼관리자만)
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    
    if (!auth.isValid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 권한 확인
    if (auth.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Super admin access required' },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from('admins')
      .select('id, email, phone, name, role, is_active, last_login_at, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 관리자 등록 (슈퍼관리자만)
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    
    if (!auth.isValid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 권한 확인
    if (auth.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Super admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, phone, name, password, role = 'admin' } = body;

    // 필수 필드 검증
    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, error: 'Email, name, and password are required' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // 전화번호 형식 검증 (선택사항)
    if (phone && !/^01[0-9]{8,9}$/.test(phone.replace(/-/g, ''))) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // 역할 검증
    const validRoles = ['super_admin', 'admin', 'manager'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    // 중복 확인
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .or(`email.eq.${email}${phone ? `,phone.eq.${phone}` : ''}`)
      .single();

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin with this email or phone already exists' },
        { status: 409 }
      );
    }

    // 비밀번호 해시
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);

    // 관리자 생성
    const { data, error } = await supabase
      .from('admins')
      .insert([{
        email,
        phone: phone || null,
        name,
        password_hash: hashedPassword,
        role,
        is_active: true
      }])
      .select('id, email, phone, name, role, created_at')
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Admin created successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 관리자 정보 수정 (슈퍼관리자만)
export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    
    if (!auth.isValid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 권한 확인
    if (auth.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Super admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, email, phone, name, password, role, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Admin ID is required' },
        { status: 400 }
      );
    }

    // 자기 자신의 super_admin 권한은 변경 불가
    if (id === auth.adminId && role && role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Cannot change your own super admin role' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email format' },
          { status: 400 }
        );
      }
      updateData.email = email;
    }

    if (phone !== undefined) {
      if (phone && !/^01[0-9]{8,9}$/.test(phone.replace(/-/g, ''))) {
        return NextResponse.json(
          { success: false, error: 'Invalid phone number format' },
          { status: 400 }
        );
      }
      updateData.phone = phone || null;
    }

    if (name) updateData.name = name;
    
    if (password) {
      const salt = genSaltSync(10);
      updateData.password_hash = hashSync(password, salt);
    }
    
    if (role) {
      const validRoles = ['super_admin', 'admin', 'manager'];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { success: false, error: 'Invalid role' },
          { status: 400 }
        );
      }
      updateData.role = role;
    }
    
    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    const { data, error } = await supabase
      .from('admins')
      .update(updateData)
      .eq('id', id)
      .select('id, email, phone, name, role, is_active')
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Admin updated successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 관리자 삭제(비활성화) (슈퍼관리자만)
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    
    if (!auth.isValid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 권한 확인
    if (auth.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Super admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Admin ID is required' },
        { status: 400 }
      );
    }

    // 자기 자신은 삭제 불가
    if (id === auth.adminId) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // 비활성화 처리 (완전 삭제 대신)
    const { data, error } = await supabase
      .from('admins')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      message: 'Admin deactivated successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}