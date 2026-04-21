import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { generateImage, type ImageModel } from './google-ai';
import { addGalleryItem, type GalleryItem } from './db';

export interface SavedImage {
  id: string;
  url: string;
  filename: string;
  galleryItem: GalleryItem;
}

const DIMS: Record<string, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '16:9': { width: 1920, height: 1080 },
  '9:16': { width: 1080, height: 1920 },
  '4:3': { width: 1024, height: 768 },
  '3:4': { width: 768, height: 1024 },
};

export async function generateAndSaveImages(opts: {
  prompt: string;
  model: ImageModel;
  aspectRatio?: string;
  sessionId?: string | null;
  messageId?: string | null;
}): Promise<SavedImage[]> {
  const { prompt, model, aspectRatio = '1:1', sessionId, messageId } = opts;

  const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
  const galleryDir = path.join(dataDir, 'gallery');
  if (!fs.existsSync(galleryDir)) fs.mkdirSync(galleryDir, { recursive: true });

  const results = await generateImage({ prompt, model, aspectRatio });

  const saved: SavedImage[] = [];
  for (const result of results) {
    const id = crypto.randomUUID();
    const ext = result.mimeType === 'image/jpeg' ? '.jpg' : '.png';
    const filename = `${id}${ext}`;
    const filePath = path.join(galleryDir, filename);

    fs.writeFileSync(filePath, Buffer.from(result.base64, 'base64'));

    const dims = DIMS[aspectRatio] ?? { width: 1024, height: 1024 };
    const galleryItem = addGalleryItem({
      session_id: sessionId ?? null,
      message_id: messageId ?? null,
      prompt,
      model,
      filename,
      width: dims.width,
      height: dims.height,
      aspect_ratio: aspectRatio,
    });

    saved.push({
      id: galleryItem.id,
      url: `/api/gallery-files/${filename}`,
      filename,
      galleryItem,
    });
  }

  return saved;
}

// Detect image generation intent in a user message
export function detectImageIntent(message: string): boolean {
  const hasAction = /\b(generate|create|make|draw|paint|sketch|render|design|produce)\b/i.test(message);
  const hasSubject = /\b(image|photo|picture|illustration|artwork|drawing|painting|portrait|landscape|wallpaper|icon|logo|scene|visual)\b/i.test(message);
  return hasAction && hasSubject;
}

// Extract a clean image prompt from the user message
export function extractImagePrompt(message: string): string {
  // Strip leading directives like "generate an image of "
  return message
    .replace(/^(please\s+)?(generate|create|make|draw|paint|sketch|render|design|produce)\s+(an?\s+)?(image|photo|picture|illustration|artwork|drawing|painting|portrait|landscape|wallpaper|icon|logo|scene|visual)\s+(of\s+)?/i, '')
    .trim() || message;
}
