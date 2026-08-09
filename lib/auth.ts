import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = 'tom_admin_session';
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'tom11223344';
const SESSION_SECRET = process.env.SESSION_SECRET || 'tom-fashion-super-secret-key-2026';

export function createSessionToken(password: string): string | null {
  if (password !== DEFAULT_PASSWORD) {
    return null;
  }
  const timestamp = Date.now();
  const payload = `tom_admin_${timestamp}`;
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payload, hmac] = parts;
    const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
    if (hmac !== expectedHmac) return false;

    // Check expiration (24 hours)
    const timestampStr = payload.replace('tom_admin_', '');
    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (now - timestamp > twentyFourHours) return false;

    return true;
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(COOKIE_NAME)?.value;
  return verifySessionToken(sessionToken);
}

export async function setAdminSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}
