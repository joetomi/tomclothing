import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, setAdminSessionCookie, clearAdminSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, action } = body;

    if (action === 'logout') {
      await clearAdminSessionCookie();
      return NextResponse.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
    }

    if (!password) {
      return NextResponse.json({ success: false, error: 'كلمة المرور مطلوبة' }, { status: 400 });
    }

    const token = createSessionToken(password);
    if (!token) {
      return NextResponse.json({ success: false, error: 'كلمة المرور غير صحيحة' }, { status: 401 });
    }

    await setAdminSessionCookie(token);
    return NextResponse.json({ success: true, message: 'تم تسجيل الدخول بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
