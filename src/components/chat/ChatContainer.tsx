'use client';

import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import type { ChatMessage, Attachment, SSEEvent, ToolCall } from '@/types/chat';

interface ChatContainerProps {
  sessionId: string;
  initialMessages: ChatMessage[];
}

export function ChatContainer({ sessionId, initialMessages }: ChatContainerProps) {
  const searchParams = useSearchParams();
  const defaultPrompt = searchParams.get('prompt') ?? undefined;

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [streaming, setStreaming] = useState(false);

  const handleSend = useCallback(async (message: string, attachments: Attachment[]) => {
    if (!message.trim() && attachments.length === 0) return;

    const now = Math.floor(Date.now() / 1000);

    const tempUserId = `temp-user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: tempUserId,
      session_id: sessionId,
      role: 'user',
      content: message,
      thinking: null,
      tool_calls: [],
      attachments,
      created_at: now,
    };
    setMessages((prev) => [...prev, userMsg]);

    const tempAssistantId = `temp-assistant-${Date.now()}`;
    const assistantPlaceholder: ChatMessage = {
      id: tempAssistantId,
      session_id: sessionId,
      role: 'assistant',
      content: '',
      thinking: null,
      tool_calls: [],
      attachments: [],
      created_at: now,
      streaming: true,
    };
    setMessages((prev) => [...prev, assistantPlaceholder]);
    setStreaming(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message, attachments }),
      });

      if (!res.ok || !res.body) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempAssistantId
              ? { ...m, content: 'Error: could not reach Hermes.', streaming: false }
              : m
          )
        );
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          let evt: SSEEvent;
          try { evt = JSON.parse(line.slice(6)); } catch { continue; }

          if (evt.type === 'token') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === tempAssistantId
                  ? { ...m, content: m.content + evt.content }
                  : m
              )
            );
          } else if (evt.type === 'thinking') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === tempAssistantId
                  ? { ...m, thinking: (m.thinking ?? '') + evt.content }
                  : m
              )
            );
          } else if (evt.type === 'tool_call') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === tempAssistantId
                  ? { ...m, tool_calls: [...m.tool_calls, evt.tool as ToolCall] }
                  : m
              )
            );
          } else if (evt.type === 'done') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === tempAssistantId
                  ? { ...m, id: evt.messageId, streaming: false }
                  : m
              )
            );
          } else if (evt.type === 'error') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === tempAssistantId
                  ? { ...m, content: `Error: ${evt.message}`, streaming: false }
                  : m
              )
            );
          }
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempAssistantId
            ? { ...m, content: `Error: ${String(err)}`, streaming: false }
            : m
        )
      );
    } finally {
      setStreaming(false);
    }
  }, [sessionId]);

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950">
      <MessageList messages={messages} streaming={streaming} />
      <ChatInput onSend={handleSend} disabled={streaming} defaultValue={defaultPrompt} />
    </div>
  );
}
