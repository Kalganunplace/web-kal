import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('payment_bank_accounts')
      .select('*')
      .order('is_default', { ascending: false });

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

    // 필수 필드 확인
    if (!body.bank_name || !body.account_number || !body.account_holder) {
      return NextResponse.json(
        { success: false, error: '은행명, 계좌번호, 예금주는 필수 항목입니다.' },
        { status: 400 }
      );
    }

    // 기본 계좌로 설정하려는 경우 기존 기본 계좌를 해제
    if (body.is_default) {
      await supabase
        .from('payment_bank_accounts')
        .update({ is_default: false })
        .eq('is_default', true);
    }

    // 삽입할 데이터 준비
    const insertData = {
      bank_name: body.bank_name,
      account_number: body.account_number,
      account_holder: body.account_holder,
      is_active: body.is_active !== undefined ? body.is_active : true,
      is_default: body.is_default || false,
      description: body.description || null,
      display_order: body.display_order || 0,
    };

    const { data, error } = await supabase
      .from('payment_bank_accounts')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Bank account insert error:', error);
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('POST /api/admin/bank-accounts error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Bank account ID is required' },
        { status: 400 }
      );
    }

    if (updateData.is_default) {
      await supabase
        .from('payment_bank_accounts')
        .update({ is_default: false })
        .eq('is_default', true);
    }

    const { data, error } = await supabase
      .from('payment_bank_accounts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
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
        { success: false, error: 'Bank account ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('payment_bank_accounts')
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