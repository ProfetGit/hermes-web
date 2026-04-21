'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { ArrowUp, Paperclip, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Attachment } from '@/types/chat';

interface ChatInputProps {
  onSend: (message: string, attachments: Attachment[]) => Promise<void>;
  disabled: boolean;
  defaultValue?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ChatInput({ onSend, disabled, defaultValue }: ChatInputProps) {
  const [value, setValue] = useState(defaultValue ?? '');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [value]);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  const uploadFile = useCallback(async (file: File): Promise<Attachment | null> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) return null;
    return res.json() as Promise<Attachment>;
  }, []);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setUploading(true);
    const results: Attachment[] = [];
    for (const file of Array.from(files)) {
      const att = await uploadFile(file);
      if (att) results.push(att);
    }
    setAttachments((prev) => [...prev, ...results]);
    setUploading(false);
  }, [uploadFile]);

  const handleSend = async () => {
    const msg = value.trim();
    if (!msg && attachments.length === 0) return;
    if (disabled || uploading) return;
    setValue('');
    const atts = [...attachments];
    setAttachments([]);
    await onSend(msg, atts);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) void handleFiles(e.dataTransfer.files);
  };

  const canSend = (value.trim().length > 0 || attachments.length > 0) && !disabled && !uploading;

  return (
    <div
      className={cn(
        'border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4',
        dragging && 'bg-zinc-50 dark:bg-zinc-900'
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <div className="mx-auto max-w-3xl">
        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((att) => {
              const isImage = att.type.startsWith('image/');
              return (
                <div key={att.id} className="relative rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={att.url} alt={att.name} className="h-16 w-16 object-cover" />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-800">
                      <span className="text-xs text-zinc-700 dark:text-zinc-300 max-w-32 truncate">{att.name}</span>
                      <span className="text-xs text-zinc-400">{formatSize(att.size)}</span>
                    </div>
                  )}
                  <button
                    onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                    className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900/70 text-white hover:bg-zinc-900 transition-colors duration-100"
                  >
                    <X size={9} strokeWidth={2} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Input area */}
        <div className={cn(
          'flex items-end gap-2 rounded-2xl border px-4 py-3',
          'bg-zinc-50 dark:bg-zinc-900',
          'border-zinc-200 dark:border-zinc-700',
          'focus-within:border-indigo-500 dark:focus-within:border-indigo-400',
          'focus-within:ring-1 focus-within:ring-indigo-500/20 dark:focus-within:ring-indigo-400/20',
          'transition-[border-color,box-shadow] duration-150'
        )}>
          {/* Paperclip */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed pb-0.5"
          >
            <Paperclip size={16} strokeWidth={1.5} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="sr-only"
            onChange={(e) => e.target.files && void handleFiles(e.target.files)}
            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.md,.json,.csv,.ts,.tsx,.js,.jsx,.py"
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={disabled ? 'Hermes is thinking…' : 'Message Hermes…'}
            rows={1}
            className="flex-1 resize-none bg-transparent outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 min-h-[24px] max-h-[200px] py-0 leading-6 disabled:cursor-not-allowed"
            style={{ height: 'auto' }}
          />

          {/* Send */}
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!canSend}
            className={cn(
              'shrink-0 flex h-8 w-8 items-center justify-center rounded-full transition-opacity duration-150',
              canSend
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-80'
                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-60'
            )}
          >
            <ArrowUp size={16} strokeWidth={2} />
          </button>
        </div>

        {uploading && <p className="mt-2 text-xs text-zinc-400 pl-2">Uploading…</p>}
        {dragging && <p className="mt-2 text-xs text-center text-indigo-500">Drop files to attach</p>}
      </div>
    </div>
  );
}
