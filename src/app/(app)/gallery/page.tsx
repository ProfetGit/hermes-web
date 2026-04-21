import { GalleryGrid } from '@/components/gallery/GalleryGrid';

export default function GalleryPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            Gallery
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            All your generated images in one place.
          </p>
        </div>
        <GalleryGrid />
      </div>
    </div>
  );
}
