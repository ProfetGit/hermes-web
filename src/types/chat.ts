export interface ToolCall {
  id?: string;
  name: string;
  input: Record<string, unknown> | string;
  output: string | null;
  duration_ms: number | null;
  type: 'tool' | 'agent' | 'search';
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking: string | null;
  tool_calls: ToolCall[];
  attachments: Attachment[];
  created_at: number;
  streaming?: boolean;
}

export type SSEEvent =
  | { type: 'token'; content: string }
  | { type: 'thinking'; content: string }
  | { type: 'tool_call'; tool: ToolCall }
  | { type: 'done'; messageId: string }
  | { type: 'error'; message: string };
