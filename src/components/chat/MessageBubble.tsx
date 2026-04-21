'use client';

import { motion } from 'framer-motion';
import { Download, Images } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ThinkingBlock } from './ThinkingBlock';
import { ToolCallList } from './ToolCallList';
import { AttachmentList } from './AttachmentList';
import { MarkdownContent } from './MarkdownContent';
import type { ChatMessage, ToolCall } from '@/types/chat';

function formatTime(unixSeconds: number): string {
  const ms = unixSeconds > 1e12 ? unixSeconds : unixSeconds * 1000;
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface GeneratedImageData {
  id: string; url: string; prompt: string; model: string;
}

function parseImageOutput(tool: ToolCall): GeneratedImageData[] {
  if (tool.name !== 'generate_image' || !tool.output) return [];
  try {
    const parsed = JSON.parse(tool.output) as { images?: GeneratedImageData[] };
    return parsed.images ?? [];
  } catch { return []; }
}

function GeneratedImages({ tools }: { tools: ToolCall[] }) {
  const allImages = tools.flatMap(parseImageOutput);
  if (!allImages.length) return null;
  return (
    <div className="mt-3 space-y-3">
      {allImages.map((img) => (
        <div key={img.id} className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.url} alt={img.prompt} className="w-full max-w-sm object-cover block" />
          <div className="flex items-center gap-3 px-3 py-2 border-t border-zinc-200 dark:border-zinc-700">
            <span className="flex-1 text-xs text-zinc-500 dark:text-zinc-400 truncate">{img.prompt}</span>
            <a href={img.url} download className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-100">
              <Download size={12} strokeWidth={1.5} /> Save
            </a>
            <Link href="/gallery" className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-100">
              <Images size={12} strokeWidth={1.5} /> Gallery
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const imageTools = message.tool_calls.filter((t) => t.name === 'generate_image');
  const otherTools = message.tool_calls.filter((t) => t.name !== 'generate_image');

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className={cn('flex gap-3 px-6 py-2', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold mt-0.5">
          H
        </div>
      )}

      <div className={cn('flex flex-col min-w-0', isUser ? 'items-end max-w-[80%]' : 'items-start max-w-[85%]')}>
        {!isUser && message.thinking && (
          <ThinkingBlock content={message.thinking} streaming={message.streaming} />
        )}
        {!isUser && otherTools.length > 0 && (
          <div className="w-full mb-2">
            <ToolCallList tools={otherTools} />
          </div>
        )}
        {message.attachments.length > 0 && (
          <div className="mb-2"><AttachmentList attachments={message.attachments} /></div>
        )}

        {(message.content || message.streaming) && (
          <div className={cn(
            isUser
              ? 'rounded-2xl rounded-br-md px-4 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm leading-relaxed'
              : 'text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed'
          )}>
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <MarkdownContent content={message.content || '…'} />
            )}
            {message.streaming && !message.content && (
              <span className="inline-block h-4 w-0.5 bg-zinc-400 animate-pulse rounded-full" />
            )}
          </div>
        )}

        {!isUser && imageTools.length > 0 && <GeneratedImages tools={imageTools} />}

        <span className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-600">
          {formatTime(message.created_at)}
        </span>
      </div>
    </motion.div>
  );
}
