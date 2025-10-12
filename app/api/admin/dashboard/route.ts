import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'sales', 'recent_orders', 'popular_products'

    // 일별 매출 데이터 (최근 7일)
    if (type === 'sales') {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);

      const { data, error } = await supabase
        .from('bookings')
        .select('created_at, total_amount')
        .gte('created_at', sevenDaysAgo.toISOString())
        .lte('created_at', today.toISOString())
        .not('status', 'eq', 'cancelled');

      if (error) throw error;

      // 일별로 그룹화
      const dailySales = new Array(7).fill(0);
      const labels = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        labels.push(date.toLocaleDateString('ko-KR', { weekday: 'short' }));
      }

      data?.forEach((booking: any) => {
        const bookingDate = new Date(booking.created_at);
        const dayDiff = Math.floor((today.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff >= 0 && dayDiff < 7) {
          dailySales[6 - dayDiff] += booking.total_amount || 0;
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          labels,
          sales: dailySales
        }
      });
    }

    // 최근 주문 목록 (최근 5개)
    if (type === 'recent_orders') {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          created_at,
          total_amount,
          status,
          booking_date,
          booking_time,
          user:users (name),
          booking_items (
            quantity,
            knife_type:knife_types (name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const recentOrders = data?.map((booking: any) => {
        const items = booking.booking_items || [];
        const itemCount = items.length;
        const firstItem = items[0]?.knife_type?.name || '상품 없음';
        const otherCount = itemCount > 1 ? itemCount - 1 : 0;

        const now = new Date();
        const createdAt = new Date(booking.created_at);
        const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));

        let timeAgo = '';
        if (diffInMinutes < 1) {
          timeAgo = '방금 전';
        } else if (diffInMinutes < 60) {
          timeAgo = `${diffInMinutes}분 전`;
        } else if (diffInMinutes < 1440) {
          timeAgo = `${Math.floor(diffInMinutes / 60)}시간 전`;
        } else {
          timeAgo = `${Math.floor(diffInMinutes / 1440)}일 전`;
        }

        return {
          id: booking.id,
          order_number: `ORD${booking.id.substring(0, 10).toUpperCase()}`,
          customer_name: booking.user?.name || '알 수 없음',
          items_description: otherCount > 0 ? `${firstItem} 외 ${otherCount}건` : firstItem,
          time_ago: timeAgo,
          status: booking.status
        };
      }) || [];

      return NextResponse.json({
        success: true,
        data: recentOrders
      });
    }

    // 인기 상품 TOP 5
    if (type === 'popular_products') {
      const { data, error } = await supabase
        .from('booking_items')
        .select(`
          knife_type_id,
          quantity,
          unit_price,
          knife_type:knife_types (name)
        `);

      if (error) throw error;

      // 상품별로 그룹화하여 수량 합계 계산
      const productMap = new Map();

      data?.forEach((item: any) => {
        const productId = item.knife_type_id;
        const productName = item.knife_type?.name || '알 수 없음';
        const quantity = item.quantity || 0;
        const unitPrice = item.unit_price || 0;

        if (productMap.has(productId)) {
          const existing = productMap.get(productId);
          existing.count += quantity;
        } else {
          productMap.set(productId, {
            name: productName,
            count: quantity,
            price: unitPrice
          });
        }
      });

      // 배열로 변환하고 count 기준으로 정렬
      const sortedProducts = Array.from(productMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return NextResponse.json({
        success: true,
        data: sortedProducts
      });
    }

    // type이 지정되지 않은 경우 모든 데이터 반환
    return NextResponse.json({
      success: false,
      error: 'Type parameter required (sales, recent_orders, popular_products)'
    }, { status: 400 });

  } catch (error: any) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
