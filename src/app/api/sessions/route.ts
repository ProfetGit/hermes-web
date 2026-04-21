import { getSessions, createSession } from '@/lib/db';

export async function GET() {
  const sessions = getSessions();
  return Response.json(sessions);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const session = createSession(body.title ?? 'New Chat');
  return Response.json(session, { status: 201 });
}
