import { NextRequest } from 'next/server';
import { generateAndSaveImages } from '@/lib/image-gen';
import type { ImageModel } from '@/lib/google-ai';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    prompt,
    model = 'nano-banana',
    aspectRatio = '1:1',
    sessionId,
    messageId,
  }: {
    prompt: string;
    model: ImageModel;
    aspectRatio?: string;
    sessionId?: string;
    messageId?: string;
  } = body;

  if (!prompt?.trim()) {
    return Response.json({ error: 'prompt is required' }, { status: 400 });
  }

  try {
    const saved = await generateAndSaveImages({
      prompt,
      model,
      aspectRatio,
      sessionId,
      messageId,
    });

    const images = saved.map((s) => ({
      id: s.id,
      url: s.url,
      prompt,
      model,
      aspectRatio,
    }));

    return Response.json({ images });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
