import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

function generateCouponCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const isUsed = searchParams.get('isUsed');
    const includeExpired = searchParams.get('includeExpired') === 'true';

    let query = supabase
      .from('user_coupons')
      .select(`
        *,
        coupon_type:coupon_types (*),
        user:users (*)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (isUsed !== null) {
      query = query.eq('is_used', isUsed === 'true');
    }

    if (!includeExpired) {
      query = query.gte('expires_at', new Date().toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userPhone, couponTypeId, adminId, issueReason } = body;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('phone', userPhone)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const { data: couponType, error: typeError } = await supabase
      .from('coupon_types')
      .select('*')
      .eq('id', couponTypeId)
      .single();

    if (typeError || !couponType) {
      return NextResponse.json(
        { success: false, error: 'Coupon type not found' },
        { status: 404 }
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (couponType.valid_days || 30));

    const couponData = {
      user_id: userData.id,
      coupon_type_id: couponTypeId,
      code: generateCouponCode(),
      expires_at: expiresAt.toISOString(),
      is_used: false
    };

    const { data: coupon, error: couponError } = await supabase
      .from('user_coupons')
      .insert([couponData])
      .select()
      .single();

    if (couponError) throw couponError;

    if (adminId) {
      await supabase
        .from('coupon_issue_logs')
        .insert([{
          coupon_id: coupon.id,
          admin_id: adminId,
          user_id: userData.id,
          coupon_type_id: couponTypeId,
          issue_reason: issueReason || '관리자 수동 발급'
        }]);
    }

    return NextResponse.json({ success: true, data: coupon });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('user_coupons')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}