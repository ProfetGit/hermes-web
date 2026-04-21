import { getSession, getMessages, deleteSession } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = getSession(id);
  if (!session) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  const messages = getMessages(id);
  return Response.json({ session, messages });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = getSession(id);
  if (!session) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  deleteSession(id);
  return Response.json({ ok: true });
}
