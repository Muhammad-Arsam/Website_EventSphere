import { StoredChatMessage } from '@/types/chat.types';

// StoredChatMessage (id, role, text, kind, time, handoffLink) is what gets saved in the browser.
// The fields below only live while the page is open.
export interface ChatMsg extends StoredChatMessage {
  animate?: boolean; // typewriter effect for fresh bot messages
  retryText?: string; // set on error bubbles that can be retried (not saved)
  autoOpen?: boolean; // open WhatsApp automatically after a short countdown
}