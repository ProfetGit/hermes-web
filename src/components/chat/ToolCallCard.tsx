'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToolCall } from '@/types/chat';

const ICONS: Record<string, string> = {
  search: '🔍', web_search: '🔍', google: '🔍',
  bash: '💻', terminal: '💻', execute: '💻', run: '💻',
  browser: '🌐', navigate: '🌐', fetch: '🌐',
  delegate: '🤖', agent: '🤖', spawn: '🤖',
  generate_image: '🎨', image: '🎨',
};

function getIcon(name: string): string {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(ICONS)) {
    if (key.includes(k)) return v;
  }
  return '⚡';
}

function formatInput(input: ToolCall['input']): string {
  if (typeof input === 'string') return input;
  try { return JSON.stringify(input, null, 2); } catch { return String(input); }
}

export function ToolCallCard({ tool }: { tool: ToolCall }) {
  const [open, setOpen] = useState(false);
  const icon = getIcon(tool.name);

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden mb-2 text-xs">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-100 text-left"
      >
        <span>{icon}</span>
        <span className="flex-1 font-mono font-medium text-zinc-700 dark:text-zinc-300 truncate">{tool.name}</span>
        {tool.duration_ms != null && (
          <span className="text-zinc-400 dark:text-zinc-600 shrink-0">{tool.duration_ms}ms</span>
        )}
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}
          className="text-zinc-400 shrink-0">
          <ChevronRight size={12} strokeWidth={1.5} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3 py-2.5 border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 space-y-2">
              <div>
                <p className="text-zinc-400 dark:text-zinc-600 uppercase tracking-wider text-[10px] font-medium mb-1">Input</p>
                <pre className="font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-all max-h-40 overflow-y-auto leading-relaxed">
                  {formatInput(tool.input)}
                </pre>
              </div>
              {tool.output != null && (
                <div>
                  <p className="text-zinc-400 dark:text-zinc-600 uppercase tracking-wider text-[10px] font-medium mb-1">Output</p>
                  <pre className="font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-all max-h-40 overflow-y-auto leading-relaxed">
                    {tool.output}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
