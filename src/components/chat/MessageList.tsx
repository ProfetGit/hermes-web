'use client';

import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import type { ChatMessage } from '@/types/chat';

interface MessageListProps {
  messages: ChatMessage[];
  streaming: boolean;
}

export function MessageList({ messages, streaming }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, streaming]);

  return (
    <div className="flex-1 overflow-y-auto py-6 scroll-smooth">
      {messages.length === 0 && !streaming && (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-zinc-400 dark:text-zinc-600">Send a message to start</p>
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {streaming && (
        <div className="flex gap-3 px-6 py-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">
            H
          </div>
          <div className="mt-1">
            <TypingIndicator />
          </div>
        </div>
      )}
      <div ref={bottomRef} className="h-2" />
    </div>
  );
}
