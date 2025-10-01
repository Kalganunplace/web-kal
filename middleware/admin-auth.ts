import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function verifyAdminAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      return { isValid: false, error: 'No token provided' };
    }

    const { payload } = await jwtVerify(token, jwtSecret);

    return {
      isValid: true,
      adminId: payload.adminId as string,
      email: payload.email as string,
      role: payload.role as string
    };
  } catch (error) {
    return { isValid: false, error: 'Invalid token' };
  }
}

export function withAdminAuth(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const auth = await verifyAdminAuth(request);
    
    if (!auth.isValid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    request.headers.set('x-admin-id', auth.adminId!);
    request.headers.set('x-admin-role', auth.role!);
    
    return handler(request, ...args);
  };
}