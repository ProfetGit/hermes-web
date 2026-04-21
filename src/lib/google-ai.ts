import { GoogleGenAI, Modality } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY || '' });

export type ImageModel = 'nano-banana' | 'imagen-4' | 'imagen-4-ultra';

export interface GenerateImageOptions {
  prompt: string;
  model: ImageModel;
  aspectRatio?: string;
  numberOfImages?: number;
}

export interface GeneratedImageResult {
  base64: string;
  mimeType: string;
}

export async function generateImage(
  opts: GenerateImageOptions
): Promise<GeneratedImageResult[]> {
  const { prompt, model, aspectRatio = '1:1', numberOfImages = 1 } = opts;

  if (model === 'nano-banana') {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const results: GeneratedImageResult[] = [];
    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        results.push({
          base64: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png',
        });
      }
    }
    return results;
  }

  const imageModel =
    model === 'imagen-4-ultra'
      ? 'imagen-4.0-ultra-generate-001'
      : 'imagen-4.0-generate-001';

  const response = await ai.models.generateImages({
    model: imageModel,
    prompt,
    config: {
      numberOfImages,
      aspectRatio,
      outputMimeType: 'image/png',
    },
  });

  return (response.generatedImages ?? []).map((img) => ({
    base64: img.image?.imageBytes ?? '',
    mimeType: img.image?.mimeType || 'image/png',
  }));
}
