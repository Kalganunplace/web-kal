import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('bookings')
      .select(`
        *,
        booking_items (
          *,
          knife_type:knife_types (*)
        ),
        user:users (*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    // bookings 데이터를 orders 형식으로 변환
    const ordersData = data?.map((booking: any) => ({
      id: booking.id,
      order_number: `ORD${booking.id.substring(0, 10).toUpperCase()}`,
      customer_name: booking.user?.name || '알 수 없음',
      customer_phone: booking.user?.phone || '',
      total_amount: booking.total_amount,
      status: booking.status,
      service_date: `${booking.booking_date}T${booking.booking_time}`,
      service_address: booking.pickup_address || booking.special_instructions || '',
      payment_method: 'bank_transfer',
      cash_receipt_request: false,
      cash_receipt_phone: '',
      depositor_name: '',
      notes: booking.admin_notes || booking.special_instructions,
      created_at: booking.created_at,
      order_items: booking.booking_items?.map((item: any) => ({
        id: item.id,
        product_name: item.knife_type?.name || '알 수 없음',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })) || []
    })) || [];

    return NextResponse.json({
      success: true,
      data: ordersData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
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
    const { items, user_id, booking_date, booking_time, ...bookingData } = body;

    // 총 수량 및 금액 계산
    let totalQuantity = 0;
    let totalAmount = 0;

    if (items && items.length > 0) {
      items.forEach((item: any) => {
        totalQuantity += item.quantity;
        totalAmount += item.unit_price * item.quantity;
      });
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([{
        user_id,
        booking_date,
        booking_time,
        total_quantity: totalQuantity,
        total_amount: totalAmount,
        status: 'pending',
        ...bookingData
      }])
      .select()
      .single();

    if (bookingError) throw bookingError;

    if (items && items.length > 0) {
      const bookingItems = items.map((item: any) => ({
        booking_id: booking.id,
        knife_type_id: item.product_id || item.knife_type_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('booking_items')
        .insert(bookingItems);

      if (itemsError) throw itemsError;
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error: any) {
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
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('bookings')
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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Booking ID and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
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