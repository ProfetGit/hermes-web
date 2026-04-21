import { notFound } from 'next/navigation';
import { getSession, getMessages } from '@/lib/db';
import { dbMsgToChatMsg } from '@/lib/chat-utils';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { Suspense } from 'react';

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = getSession(id);
  if (!session) notFound();

  const rawMessages = getMessages(id);
  const initialMessages = rawMessages.map(dbMsgToChatMsg);

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950">
      {/* Session header */}
      <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 px-6 py-3 shrink-0 bg-white dark:bg-zinc-950">
        <h1 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
          {session.title}
        </h1>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col min-h-0">
        <Suspense>
          <ChatContainer sessionId={id} initialMessages={initialMessages} />
        </Suspense>
      </div>
    </div>
  );
}
