const STORAGE_PREFIX = 'eventsphere_chat_v1_';
export const CHAT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface StoredSession {
  sessionId: string;
  updatedAt: number;
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

const write = (eventId: string, data: StoredSession) => {
  try {
    localStorage.setItem(keyFor(eventId), JSON.stringify(data));
  } catch {
    /* storage full or blocked (private mode): the chat still works during this visit */
  }
};

// The saved session id of this event, or null if there is none (never chatted, expired, or broken).
export const getStoredSessionId = (eventId: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(keyFor(eventId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredSession> & { messages?: unknown };
    const fresh = typeof parsed.updatedAt === 'number' && Date.now() - parsed.updatedAt < CHAT_TTL_MS;
    const valid = typeof parsed.sessionId === 'string' && UUID_PATTERN.test(parsed.sessionId);

    if (!fresh || !valid) {
      localStorage.removeItem(keyFor(eventId));
      return null;
    }

    // Older versions saved the chat messages here too. They are not needed any more, so remove them.
    if ('messages' in parsed) {
      write(eventId, { sessionId: parsed.sessionId as string, updatedAt: parsed.updatedAt as number });
    }
    return parsed.sessionId as string;
  } catch {
    return null;
  }
};

// The saved session id, or a new one (saved right away) if there is none. Created once, then reused.
export const getOrCreateSessionId = (eventId: string): string => {
  const existing = getStoredSessionId(eventId);
  if (existing) {
    write(eventId, { sessionId: existing, updatedAt: Date.now() });
    return existing;
  }
  const created = generateUuid();
  write(eventId, { sessionId: created, updatedAt: Date.now() });
  return created;
};

// Keeps the session alive: the 24 hours count from the last activity.
export const touchSession = (eventId: string): void => {
  if (typeof window === 'undefined') return;
  const existing = getStoredSessionId(eventId);
  if (existing) write(eventId, { sessionId: existing, updatedAt: Date.now() });
};

// "New chat": forget the session. The next question starts a new one.
export const clearChat = (eventId: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(keyFor(eventId));
  } catch {
    /* ignore */
  }
};