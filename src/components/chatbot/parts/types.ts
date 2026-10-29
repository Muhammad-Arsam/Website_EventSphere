export interface ChatMsg {
  id: string;
  role: 'user' | 'bot';
  text: string;
  kind?: 'normal' | 'error';
  time: number;
  handoffLink?: string;
  animate?: boolean;
  retryText?: string;
  autoOpen?: boolean;
}