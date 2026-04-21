'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LightboxItem } from './Lightbox';

const MODEL_BADGES: Record<string, string> = {
  'nano-banana': 'Nano Banana',
  'imagen-4': 'Imagen 4',
  'imagen-4-ultra': 'Imagen 4 Ultra',
};

interface GalleryItemProps {
  item: LightboxItem;
  index: number;
  onClick: (item: LightboxItem) => void;
}

export function GalleryItemCard({ item, index, onClick }: GalleryItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4), ease: [0.4, 0, 0.2, 1] }}
      className="group relative cursor-pointer rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] break-inside-avoid mb-4"
      onClick={() => onClick(item)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.url}
        alt={item.prompt}
        className="w-full object-cover block transition-[transform] duration-250"
        style={{ aspectRatio: item.aspect_ratio.replace(':', '/') }}
        loading="lazy"
      />

      {/* Hover overlay */}
      <div
        className={cn(
          'absolute inset-0 flex flex-col justify-end p-3',
          'bg-gradient-to-t from-black/70 via-black/20 to-transparent',
          'opacity-0 group-hover:opacity-100 transition-[opacity] duration-250'
        )}
      >
        <p className="text-xs text-white/90 line-clamp-2 leading-relaxed">{item.prompt}</p>
      </div>

      {/* Model badge */}
      <div className="px-3 py-2 border-t border-[var(--color-border)]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-[var(--color-accent)]">
            {MODEL_BADGES[item.model] ?? item.model}
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">
            {new Date(item.created_at * 1000).toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
