'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LightboxItem {
  id: string;
  url: string;
  prompt: string;
  model: string;
  aspect_ratio: string;
  created_at: number;
}

interface LightboxProps {
  item: LightboxItem | null;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
}

const MODEL_LABELS: Record<string, string> = {
  'nano-banana': 'Nano Banana',
  'imagen-4': 'Imagen 4',
  'imagen-4-ultra': 'Imagen 4 Ultra',
};

export function Lightbox({ item, onClose, onDelete }: LightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll
  useEffect(() => {
    if (item) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [item]);

  async function handleDelete() {
    if (!item) return;
    await onDelete(item.id);
    onClose();
  }

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            className={cn(
              'relative z-10 max-w-3xl w-full max-h-[90vh] flex flex-col',
              'rounded-[var(--radius-xl)] overflow-hidden',
              'bg-[var(--color-surface)] border border-[var(--color-border)]'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="flex-1 overflow-hidden flex items-center justify-center bg-[#09090B] min-h-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.prompt}
                className="max-h-[65vh] max-w-full object-contain block"
              />
            </div>

            {/* Info bar */}
            <div className="px-5 py-4 border-t border-[var(--color-border)] shrink-0">
              <p className="text-sm text-[var(--color-text-primary)] leading-relaxed mb-2 line-clamp-2">
                {item.prompt}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--color-text-muted)]">
                  {MODEL_LABELS[item.model] ?? item.model}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">·</span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {item.aspect_ratio}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">·</span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {new Date(item.created_at * 1000).toLocaleDateString()}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <a
                    href={item.url}
                    download
                    className={cn(
                      'flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-1.5',
                      'text-xs font-medium text-[var(--color-text-primary)]',
                      'border border-[var(--color-border)] hover:bg-[var(--color-surface-alt)]',
                      'transition-[background-color] duration-150'
                    )}
                  >
                    <Download size={13} strokeWidth={1.5} />
                    Download
                  </a>
                  <button
                    onClick={handleDelete}
                    className={cn(
                      'flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-1.5',
                      'text-xs font-medium text-[var(--color-error)]',
                      'border border-[var(--color-error)]/30 hover:bg-[var(--color-error)]/10',
                      'transition-[background-color] duration-150'
                    )}
                  >
                    <Trash2 size={13} strokeWidth={1.5} />
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className={cn(
                'absolute top-3 right-3 flex h-8 w-8 items-center justify-center',
                'rounded-full bg-black/50 text-white hover:bg-black/70',
                'transition-[background-color] duration-150'
              )}
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
