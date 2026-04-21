import { ToolCallCard } from './ToolCallCard';
import type { ToolCall } from '@/types/chat';

interface ToolCallListProps {
  tools: ToolCall[];
}

export function ToolCallList({ tools }: ToolCallListProps) {
  if (!tools.length) return null;
  return (
    <div className="mb-2">
      {tools.map((tool, i) => (
        <ToolCallCard key={tool.id ?? i} tool={tool} />
      ))}
    </div>
  );
}
