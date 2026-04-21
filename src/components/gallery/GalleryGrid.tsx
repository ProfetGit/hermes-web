'use client';

import { useState, useEffect, useCallback } from 'react';
import { Images } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { GalleryItemCard } from './GalleryItem';
import { Lightbox } from './Lightbox';
import type { LightboxItem } from './Lightbox';

const FILTERS = ['All', 'Nano Banana', 'Imagen 4'] as const;
type Filter = (typeof FILTERS)[number];

const MODEL_FILTER: Record<Filter, string | null> = {
  All: null,
  'Nano Banana': 'nano-banana',
  'Imagen 4': 'imagen-4',
};

interface ApiItem extends LightboxItem {
  filename: string;
  width: number;
  height: number;
}

const PAGE_SIZE = 20;

export function GalleryGrid() {
  const [items, setItems] = useState<ApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState<Filter>('All');
  const [lightbox, setLightbox] = useState<LightboxItem | null>(null);

  const fetchItems = useCallback(async (off: number, replace: boolean) => {
    setLoading(true);
    const res = await fetch(`/api/gallery?limit=${PAGE_SIZE}&offset=${off}`);
    if (res.ok) {
      const data = await res.json() as { items: ApiItem[]; count: number };
      setItems((prev) => replace ? data.items : [...prev, ...data.items]);
      setHasMore(data.count === PAGE_SIZE);
      setOffset(off + data.count);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(0, true); }, [fetchItems]);

  async function handleDelete(id: string) {
    await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function loadMore() {
    fetchItems(offset, false);
  }

  const modelKey = MODEL_FILTER[filter];
  const filtered = modelKey
    ? items.filter((i) => i.model === modelKey || (modelKey === 'imagen-4' && i.model.startsWith('imagen-4')))
    : items;

  const isEmpty = !loading && filtered.length === 0;

  return (
    <>
      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-[var(--radius-md)] px-3 py-1.5 text-sm font-medium',
              'transition-[background-color,color] duration-150',
              filter === f
                ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-alt)]'
            )}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-sm text-[var(--color-text-muted)]">
          {filtered.length} {filtered.length === 1 ? 'image' : 'images'}
        </span>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-surface-alt)] border border-[var(--color-border)]">
            <Images size={32} className="text-[var(--color-text-muted)]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-base font-medium text-[var(--color-text-primary)]">No images yet</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Generate one in{' '}
              <Link href="/" className="text-[var(--color-accent)] hover:opacity-80 transition-[opacity] duration-150">
                chat
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Masonry grid */}
      {!isEmpty && (
        <div
          className="columns-1 sm:columns-2 lg:columns-3 gap-4"
          style={{ columnGap: '1rem' }}
        >
          {filtered.map((item, i) => (
            <GalleryItemCard
              key={item.id}
              item={item}
              index={i}
              onClick={setLightbox}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && !loading && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            className={cn(
              'rounded-[var(--radius-md)] border border-[var(--color-border)] px-6 py-2.5',
              'text-sm font-medium text-[var(--color-text-primary)]',
              'hover:bg-[var(--color-surface-alt)] transition-[background-color] duration-150'
            )}
          >
            Load more
          </button>
        </div>
      )}

      {loading && items.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-[var(--radius-lg)] bg-[var(--color-surface-alt)] animate-pulse"
            />
          ))}
        </div>
      )}

      <Lightbox item={lightbox} onClose={() => setLightbox(null)} onDelete={handleDelete} />
    </>
  );
}
