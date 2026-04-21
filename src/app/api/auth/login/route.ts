import { cookies } from 'next/headers';
import { verifyPassword, createAuthToken, getAuthCookieOptions } from '@/lib/auth';

export async function POST(request: Request) {
  const { password } = await request.json();

  if (!verifyPassword(password)) {
    return Response.json({ error: 'Invalid password' }, { status: 401 });
  }

  const token = createAuthToken();
  const opts = getAuthCookieOptions();
  const cookieStore = await cookies();
  cookieStore.set(opts.name, token, {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    maxAge: opts.maxAge,
    path: opts.path,
  });

  return Response.json({ ok: true });
}
