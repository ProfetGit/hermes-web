import path from 'path';
import fs from 'fs';
import { getGalleryItems, deleteGalleryItem } from '@/lib/db';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const items = getGalleryItems(1000, 0);
  const item = items.find((i) => i.id === id);

  if (!item) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  // Delete file from disk
  const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
  const filePath = path.join(dataDir, 'gallery', item.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  deleteGalleryItem(id);
  return Response.json({ ok: true });
}
