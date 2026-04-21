import path from 'path';
import fs from 'fs';

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const safe = path.basename(filename);
  const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
  const filePath = path.join(dataDir, 'gallery', safe);

  if (!fs.existsSync(filePath)) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const content = fs.readFileSync(filePath);
  const ext = path.extname(safe).toLowerCase();
  const mime = MIME[ext] ?? 'image/png';

  return new Response(content, {
    headers: {
      'Content-Type': mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
