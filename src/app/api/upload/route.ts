import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const MAX_SIZE = 20 * 1024 * 1024;
const ALLOWED_EXTS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
  '.pdf',
  '.txt', '.md', '.csv',
  '.json',
  '.ts', '.tsx', '.js', '.jsx',
  '.py', '.rb', '.go', '.rs', '.c', '.cpp', '.h',
]);

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 });
  if (file.size > MAX_SIZE) return Response.json({ error: 'File exceeds 20 MB limit' }, { status: 400 });

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTS.has(ext)) {
    return Response.json({ error: `File type '${ext}' not allowed` }, { status: 400 });
  }

  const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
  const uploadsDir = path.join(dataDir, 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const id = crypto.randomUUID();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filename = `${id}-${safeName}`;
  const filePath = path.join(uploadsDir, filename);

  const bytes = await file.arrayBuffer();
  fs.writeFileSync(filePath, Buffer.from(bytes));

  return Response.json({
    id,
    name: file.name,
    type: file.type || 'application/octet-stream',
    size: file.size,
    url: `/api/files/${filename}`,
  });
}
