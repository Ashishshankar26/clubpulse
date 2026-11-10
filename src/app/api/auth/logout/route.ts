import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, SESSION_COOKIE_NAME } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser(request);

    if (sessionUser) {
      await logAuditEvent({
        actorId: sessionUser.id,
        actorName: sessionUser.name,
        actorRole: sessionUser.role,
        action: 'AUTH_LOGOUT',
        targetType: 'user',
        targetId: sessionUser.id,
        status: 'SUCCESS',
      });
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear HttpOnly session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error: unknown) {
    console.error('[AUTH_LOGOUT_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Logout encounter error' },
      { status: 500 }
    );
  }
}
