import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'clubpulse-production-session-secret-key-must-be-at-least-32-chars!'
);

export const SESSION_COOKIE_NAME = 'clubpulse_session';
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export interface SessionUser {
  id: string;
  name: string;
  registrationNumber: string;
  email: string;
  role: 'student' | 'club_lead' | 'admin';
  department: string;
  year: string;
  avatar: string;
  status?: 'active' | 'suspended';
}

/**
 * Hash a plaintext password with bcrypt (10 rounds)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verify a password against a stored bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

/**
 * Create a signed JWT session token
 */
export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    name: user.name,
    registrationNumber: user.registrationNumber,
    email: user.email,
    role: user.role,
    department: user.department,
    year: user.year,
    avatar: user.avatar,
    status: user.status || 'active',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Verify and decode a JWT session token
 */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });

    if (!payload || !payload.id || !payload.role) {
      return null;
    }

    return {
      id: payload.id as string,
      name: payload.name as string,
      registrationNumber: payload.registrationNumber as string,
      email: payload.email as string,
      role: payload.role as 'student' | 'club_lead' | 'admin',
      department: payload.department as string,
      year: payload.year as string,
      avatar: (payload.avatar as string) || '',
      status: (payload.status as 'active' | 'suspended') || 'active',
    };
  } catch {
    return null;
  }
}

/**
 * Extract session user from incoming NextRequest or cookie store
 */
export async function getSessionUser(req?: NextRequest): Promise<SessionUser | null> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    // Fallback to Authorization: Bearer token for API testing
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
  } else {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch {
      // In non-server context
    }
  }

  if (!token) return null;
  return verifySessionToken(token);
}
