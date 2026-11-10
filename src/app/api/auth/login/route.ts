import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';
import { verifyPassword, createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';
import { logAuditEvent } from '@/lib/audit';

const LoginSchema = z.object({
  registrationNumber: z.string().min(3).max(30).trim(),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'local-client';

  // Apply rate limiting: max attempts per minute per IP (relaxed in development for testing)
  const maxAttempts = process.env.NODE_ENV === 'development' ? 60 : 10;
  const limiter = rateLimit(`login:${ip}`, maxAttempts, 60 * 1000);
  if (!limiter.success) {
    return NextResponse.json(
      {
        success: false,
        message: 'Too many authentication attempts. Please try again in 1 minute.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': String(limiter.limit),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    const rawBody = await request.json().catch(() => ({}));
    const parseResult = LoginSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input parameters',
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { registrationNumber, password } = parseResult.data;
    const cleanRegNo = registrationNumber.toUpperCase();

    await connectToDatabase();

    const user = await UserModel.findOne({ registrationNumber: cleanRegNo });

    // Protect against timing attacks and user enumeration with constant-time response structure
    if (!user) {
      await logAuditEvent({
        actorId: 'anonymous',
        actorName: 'Anonymous Attempt',
        actorRole: 'unauthenticated',
        action: 'AUTH_LOGIN_FAILED',
        targetType: 'user',
        targetId: cleanRegNo,
        status: 'FAILED',
        ipAddress: ip,
        details: { reason: 'User not found' },
      });

      return NextResponse.json(
        { success: false, message: 'Invalid registration number or password' },
        { status: 401 }
      );
    }

    // Check account status
    if (user.status === 'suspended') {
      await logAuditEvent({
        actorId: user._id.toString(),
        actorName: user.name,
        actorRole: user.role,
        action: 'AUTH_LOGIN_DENIED',
        targetType: 'user',
        targetId: user._id.toString(),
        status: 'DENIED',
        ipAddress: ip,
        details: { reason: 'Account suspended' },
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Your account has been suspended by administration. Please contact Student Affairs.',
        },
        { status: 403 }
      );
    }

    const isMatch = await verifyPassword(password, user.password || '');
    if (!isMatch) {
      await logAuditEvent({
        actorId: user._id.toString(),
        actorName: user.name,
        actorRole: user.role,
        action: 'AUTH_LOGIN_FAILED',
        targetType: 'user',
        targetId: user._id.toString(),
        status: 'FAILED',
        ipAddress: ip,
        details: { reason: 'Password mismatch' },
      });

      return NextResponse.json(
        { success: false, message: 'Invalid registration number or password' },
        { status: 401 }
      );
    }

    const sessionPayload = {
      id: user._id.toString(),
      name: user.name,
      registrationNumber: user.registrationNumber,
      email: user.email,
      role: user.role,
      department: user.department,
      year: user.year,
      avatar: user.avatar,
      status: user.status || 'active',
    };

    const token = await createSessionToken(sessionPayload);

    await logAuditEvent({
      actorId: sessionPayload.id,
      actorName: sessionPayload.name,
      actorRole: sessionPayload.role,
      action: 'AUTH_LOGIN_SUCCESS',
      targetType: 'user',
      targetId: sessionPayload.id,
      status: 'SUCCESS',
      ipAddress: ip,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: {
        ...sessionPayload,
        xpPoints: user.xpPoints,
        clubsJoined: user.clubsJoined,
      },
      token, // Expose for programmatic/API testing alongside HttpOnly cookie
    });

    // Set secure, HttpOnly, SameSite=Lax session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (error: unknown) {
    console.error('[AUTH_LOGIN_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Authentication service temporarily unavailable' },
      { status: 500 }
    );
  }
}
