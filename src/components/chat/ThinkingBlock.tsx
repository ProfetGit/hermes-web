'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export function ThinkingBlock({ content, streaming }: { content: string; streaming?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-3 border-l-2 border-violet-400 dark:border-violet-500 pl-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs font-medium text-violet-600 dark:text-violet-400 hover:opacity-70 transition-opacity duration-100"
      >
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronRight size={12} strokeWidth={2} />
        </motion.span>
        {streaming && !open ? 'Thinking…' : 'Thinking'}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <pre className="mt-2 text-xs font-mono leading-relaxed whitespace-pre-wrap break-words text-zinc-500 dark:text-zinc-400 max-h-64 overflow-y-auto">
              {content}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
