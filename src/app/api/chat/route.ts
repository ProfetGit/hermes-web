import { NextRequest } from 'next/server';
import {
  addMessage,
  getMessages,
  getSession,
  updateSessionTitle,
} from '@/lib/db';
import { detectImageIntent, extractImagePrompt, generateAndSaveImages } from '@/lib/image-gen';
import type { ToolCall } from '@/types/chat';

const HERMES_API_URL = process.env.HERMES_API_URL || 'http://localhost:8642';
const HERMES_MODEL = process.env.HERMES_MODEL || 'hermes-agent';

export async function POST(request: NextRequest) {
  const { sessionId, message, attachments } = await request.json();

  const session = getSession(sessionId);
  if (!session) {
    return Response.json({ error: 'Session not found' }, { status: 404 });
  }

  // Set title from first user message
  if (session.message_count === 0) {
    updateSessionTitle(sessionId, message.slice(0, 50).trim() || 'New Chat');
  }

  // Save user message
  addMessage({
    session_id: sessionId,
    role: 'user',
    content: message,
    thinking: null,
    tool_calls: null,
    attachments: attachments?.length ? JSON.stringify(attachments) : null,
  });

  // Detect image intent before streaming
  const wantsImage = detectImageIntent(message);
  const imagePrompt = wantsImage ? extractImagePrompt(message) : '';

  // Build conversation history for Hermes
  const history = getMessages(sessionId);
  const openaiMessages = history.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  // Call Hermes with streaming
  let hermesRes: Response;
  try {
    hermesRes = await fetch(`${HERMES_API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: HERMES_MODEL,
        messages: openaiMessages,
        stream: true,
      }),
    });
  } catch (err) {
    return Response.json({ error: `Cannot reach Hermes: ${err}` }, { status: 502 });
  }

  if (!hermesRes.ok) {
    const text = await hermesRes.text().catch(() => '');
    return Response.json({ error: `Hermes error: ${hermesRes.status} ${text}` }, { status: 502 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      let fullContent = '';
      let fullThinking = '';
      const toolCallBuf: Record<number, { id: string; name: string; args: string }> = {};
      const emittedTools: ToolCall[] = [];

      const reader = hermesRes.body!.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      try {
        // Stream Hermes response
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buf += decoder.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (raw === '[DONE]') continue;

            let chunk: {
              choices?: Array<{
                delta?: {
                  content?: string;
                  reasoning_content?: string;
                  tool_calls?: Array<{
                    index: number;
                    id?: string;
                    function?: { name?: string; arguments?: string };
                  }>;
                };
                finish_reason?: string;
              }>;
            };
            try {
              chunk = JSON.parse(raw);
            } catch {
              continue;
            }

            const delta = chunk.choices?.[0]?.delta;
            if (!delta) continue;

            if (delta.reasoning_content) {
              fullThinking += delta.reasoning_content;
              send({ type: 'thinking', content: delta.reasoning_content });
            }

            if (delta.content) {
              fullContent += delta.content;
              send({ type: 'token', content: delta.content });
            }

            if (delta.tool_calls) {
              for (const tc of delta.tool_calls) {
                if (!toolCallBuf[tc.index]) {
                  toolCallBuf[tc.index] = { id: tc.id ?? '', name: '', args: '' };
                }
                if (tc.function?.name) toolCallBuf[tc.index].name += tc.function.name;
                if (tc.function?.arguments) toolCallBuf[tc.index].args += tc.function.arguments;
              }
            }
          }
        }

        // Emit Hermes tool calls
        for (const tc of Object.values(toolCallBuf)) {
          let input: Record<string, unknown> | string;
          try {
            input = JSON.parse(tc.args) as Record<string, unknown>;
          } catch {
            input = tc.args;
          }
          const toolEvent: ToolCall = {
            id: tc.id,
            name: tc.name,
            input,
            output: null,
            duration_ms: null,
            type: 'tool',
          };
          emittedTools.push(toolEvent);
          send({ type: 'tool_call', tool: toolEvent });
        }

        // Auto image generation if intent detected
        if (wantsImage && imagePrompt) {
          const t0 = Date.now();
          try {
            const saved = await generateAndSaveImages({
              prompt: imagePrompt,
              model: 'nano-banana',
              aspectRatio: '1:1',
              sessionId,
              messageId: undefined,
            });

            const outputData = {
              images: saved.map((s) => ({
                id: s.id,
                url: s.url,
                prompt: imagePrompt,
                model: 'nano-banana',
              })),
            };

            const imgToolCall: ToolCall = {
              name: 'generate_image',
              input: { prompt: imagePrompt, model: 'nano-banana', aspectRatio: '1:1' },
              output: JSON.stringify(outputData),
              duration_ms: Date.now() - t0,
              type: 'tool',
            };
            emittedTools.push(imgToolCall);
            send({ type: 'tool_call', tool: imgToolCall });
          } catch (imgErr) {
            const failedToolCall: ToolCall = {
              name: 'generate_image',
              input: { prompt: imagePrompt, model: 'nano-banana' },
              output: `Error: ${String(imgErr)}`,
              duration_ms: Date.now() - t0,
              type: 'tool',
            };
            emittedTools.push(failedToolCall);
            send({ type: 'tool_call', tool: failedToolCall });
          }
        }

        // Save assistant message with all tool calls
        const saved = addMessage({
          session_id: sessionId,
          role: 'assistant',
          content: fullContent,
          thinking: fullThinking || null,
          tool_calls: emittedTools.length ? JSON.stringify(emittedTools) : null,
          attachments: null,
        });

        send({ type: 'done', messageId: saved.id });
      } catch (err) {
        send({ type: 'error', message: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
