import { FileText, File } from 'lucide-react';
import type { Attachment } from '@/types/chat';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AttachmentListProps {
  attachments: Attachment[];
}

export function AttachmentList({ attachments }: AttachmentListProps) {
  if (!attachments.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {attachments.map((att) => {
        const isImage = att.type.startsWith('image/');
        return isImage ? (
          <div
            key={att.id}
            className="relative rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-border)]"
            style={{ maxHeight: 200 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={att.url}
              alt={att.name}
              className="max-h-48 max-w-xs object-cover block"
            />
          </div>
        ) : (
          <div
            key={att.id}
            className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2"
          >
            {att.type === 'application/pdf' ? (
              <File size={14} strokeWidth={1.5} className="text-[var(--color-error)] shrink-0" />
            ) : (
              <FileText size={14} strokeWidth={1.5} className="text-[var(--color-accent)] shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--color-text-primary)] truncate max-w-40">
                {att.name}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">{formatSize(att.size)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
