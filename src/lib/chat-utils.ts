import type { ChatMessage, ToolCall, Attachment } from '@/types/chat';

export function dbMsgToChatMsg(m: {
  id: string;
  session_id: string;
  role: string;
  content: string;
  thinking: string | null;
  tool_calls: string | null;
  attachments: string | null;
  created_at: number;
}): ChatMessage {
  let tool_calls: ToolCall[] = [];
  let attachments: Attachment[] = [];
  try { tool_calls = m.tool_calls ? (JSON.parse(m.tool_calls) as ToolCall[]) : []; } catch { tool_calls = []; }
  try { attachments = m.attachments ? (JSON.parse(m.attachments) as Attachment[]) : []; } catch { attachments = []; }
  return {
    id: m.id,
    session_id: m.session_id,
    role: m.role as 'user' | 'assistant',
    content: m.content,
    thinking: m.thinking,
    tool_calls,
    attachments,
    created_at: m.created_at,
  };
}
