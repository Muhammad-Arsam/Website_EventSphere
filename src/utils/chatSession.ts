import { StoredChatMessage } from '@/types/chat.types';

// Chat session + chat history, saved in the browser (localStorage), one entry per event.
//  - The session_id is a UUID, created once and sent with every message,
//    so the backend can keep the conversation context.
//  - The messages are saved too, so the visitor sees the history after a refresh.
//  - Everything expires after CHAT_TTL_MS without activity (shared computers, stale sessions).

const STORAGE_PREFIX = 'eventsphere_chat_v1_';
export const CHAT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_STORED_MESSAGES = 50;

interface StoredChat {
  sessionId: string;
  updatedAt: number;
  messages: StoredChatMessage[];
}

export interface LoadedChat {
  sessionId: string;
  messages: StoredChatMessage[];
}

const keyFor = (eventId: string) => `${STORAGE_PREFIX}${eventId}`;

// Real UUID v4. Uses crypto.randomUUID when available (needs https or localhost),
// otherwise getRandomValues, otherwise Math.random as a last resort.
export const generateUuid = (): string => {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    if (typeof crypto.getRandomValues === 'function') {
      const b = crypto.getRandomValues(new Uint8Array(16));
      b[6] = (b[6] & 0x0f) | 0x40;
      b[8] = (b[8] & 0x3f) | 0x80;
      const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
      return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

// Never trust saved data: keep only well-formed messages.
const sanitizeMessages = (raw: unknown): StoredChatMessage[] => {
  if (!Array.isArray(raw)) return [];
  const clean: StoredChatMessage[] = [];
  for (const m of raw) {
    if (!m || typeof m !== 'object') continue;
    const msg = m as Record<string, unknown>;
    if (typeof msg.id !== 'string' || typeof msg.text !== 'string') continue;
    if (msg.role !== 'user' && msg.role !== 'bot') continue;
    clean.push({
      id: msg.id,
      role: msg.role,
      text: msg.text,
      kind: msg.kind === 'error' ? 'error' : 'normal',
      time: typeof msg.time === 'number' ? msg.time : Date.now(),
      // the link is put into an <a href>, so only a WhatsApp link is accepted
      handoffLink:
        typeof msg.handoffLink === 'string' && msg.handoffLink.startsWith('https://wa.me/')
          ? msg.handoffLink
          : undefined,
    });
  }
  return clean.slice(-MAX_STORED_MESSAGES);
};

const write = (eventId: string, data: StoredChat) => {
  try {
    localStorage.setItem(keyFor(eventId), JSON.stringify(data));
  } catch {
    /* storage full or blocked (private mode): the chat still works, only history is lost */
  }
};

// Returns the saved chat of this event. If there is none (or it is expired / broken),
// a fresh session_id is created and saved right away, so it stays the same afterwards.
export const loadChat = (eventId: string): LoadedChat => {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(keyFor(eventId));
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<StoredChat>;
        const fresh = typeof parsed.updatedAt === 'number' && Date.now() - parsed.updatedAt < CHAT_TTL_MS;
        if (fresh && typeof parsed.sessionId === 'string' && parsed.sessionId.trim()) {
          return { sessionId: parsed.sessionId, messages: sanitizeMessages(parsed.messages) };
        }
      }
    } catch {
      /* broken JSON or blocked storage: start a new chat */
    }
  }

  const created: LoadedChat = { sessionId: generateUuid(), messages: [] };
  if (typeof window !== 'undefined') write(eventId, { ...created, updatedAt: Date.now() });
  return created;
};

export const saveChat = (eventId: string, sessionId: string, messages: StoredChatMessage[]): void => {
  if (typeof window === 'undefined' || !sessionId) return;
  write(eventId, {
    sessionId,
    updatedAt: Date.now(),
    messages: sanitizeMessages(messages),
  });
};

// "New chat": forget the history and the session.
export const clearChat = (eventId: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(keyFor(eventId));
  } catch {
    /* ignore */
  }
};

// Kept for convenience: the session_id of this event (created once, then reused).
export const getChatSessionId = (eventId: string): string => loadChat(eventId).sessionId;