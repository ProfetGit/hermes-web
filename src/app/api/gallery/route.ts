import { NextRequest } from 'next/server';
import { getGalleryItems } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);

  const items = getGalleryItems(limit, offset);
  const withUrls = items.map((item) => ({
    ...item,
    url: `/api/gallery-files/${item.filename}`,
  }));

  return Response.json({ items: withUrls, limit, offset, count: withUrls.length });
}
