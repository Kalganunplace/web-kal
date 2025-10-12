import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const passwordHash = bcrypt.hashSync('admin123!!', 10);

    // Update existing admin password
    const { data, error } = await supabase
      .from('admins')
      .update({ password_hash: passwordHash })
      .eq('username', 'admin')
      .select()
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin password updated',
      credentials: {
        username: 'admin',
        password: 'admin123!!'
      },
      data
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}
