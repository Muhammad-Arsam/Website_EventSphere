import { ChatHistoryItem } from '@/types/chat.types';
import { ChatMsg } from './types';

const parseTime = (iso: unknown, fallback: number): number => {
  if (typeof iso !== 'string') return fallback;
  const ms = Date.parse(iso.replace(/(\.\d{3})\d+/, '$1'));
  return Number.isNaN(ms) ? fallback : ms;
};

export const historyToMessages = (items: unknown): ChatMsg[] => {
  if (!Array.isArray(items)) return [];

  const now = Date.now();
  const rows: { index: number; time: number; role: 'user' | 'bot'; text: string }[] = [];

  items.forEach((raw, index) => {
    if (!raw || typeof raw !== 'object') return;
    const item = raw as Partial<ChatHistoryItem>;
    if (typeof item.content !== 'string' || !item.content.trim()) return;

    const role = item.role === 'user' ? 'user' : item.role === 'assistant' ? 'bot' : null;
    if (!role) return;

    rows.push({ index, time: parseTime(item.created_at, now), role, text: item.content });
  });

  rows.sort((a, b) => a.time - b.time || a.index - b.index);

  return rows.map((r) => ({
    id: `h-${r.index}`,
    role: r.role,
    text: r.text,
    kind: 'normal' as const,
    time: r.time,
    animate: false,
  }));
};