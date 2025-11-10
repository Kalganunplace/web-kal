import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 쿠키에서 사용자 세션을 가져와서 Supabase 클라이언트 생성
async function getSupabaseClient() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token');

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authToken ? {
        Authorization: `Bearer ${authToken.value}`
      } : {}
    }
  });

  return supabase;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    let query = supabase
      .from('knife_types')
      .select('*')
      .order('display_order', { ascending: true });

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;

    if (error) throw error;

    // knife_types 데이터를 products 형식으로 변환
    const productsData = data?.map((knifeType: any) => ({
      id: knifeType.id,
      name: knifeType.name,
      category: 'knife', // knife_types는 모두 칼 종류
      market_price: knifeType.market_price,
      discount_price: knifeType.discount_price,
      image_url: knifeType.image_url,
      description: knifeType.description,
      display_order: knifeType.display_order,
      is_active: knifeType.is_active,
      created_at: knifeType.created_at,
      updated_at: knifeType.updated_at
    })) || [];

    return NextResponse.json({ success: true, data: productsData });
  } catch (error: any) {
    console.error('GET /api/admin/products error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient();
    const body = await request.json();
    const { category, ...insertData } = body;

    // category 필드는 knife_types 테이블에 없으므로 제외
    const { data, error } = await supabase
      .from('knife_types')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('POST /api/admin/products error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient();
    const body = await request.json();
    const { id, category, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // category 필드는 knife_types 테이블에 없으므로 제외
    const { data, error } = await supabase
      .from('knife_types')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('PUT /api/admin/products error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // 소프트 삭제: is_active를 false로 설정
    // 실제로 삭제하지 않고 비활성화하여 외래 키 제약 조건 문제를 방지
    const { data, error } = await supabase
      .from('knife_types')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('DELETE /api/admin/products error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}