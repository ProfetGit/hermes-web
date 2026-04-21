import crypto from 'crypto';

const COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function verifyPassword(input: string): boolean {
  const password = process.env.SITE_PASSWORD;
  if (!password) return false;
  return input === password;
}

export function createAuthToken(): string {
  const secret = process.env.AUTH_SECRET || 'fallback-secret';
  const payload = Buffer.from(JSON.stringify({ ts: Date.now() })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function validateAuthToken(token: string): boolean {
  try {
    const secret = process.env.AUTH_SECRET || 'fallback-secret';
    const dotIdx = token.lastIndexOf('.');
    if (dotIdx === -1) return false;
    const payload = token.slice(0, dotIdx);
    const sig = token.slice(dotIdx + 1);
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function getAuthCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  };
}
