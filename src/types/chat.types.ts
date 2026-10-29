export type ChatJobStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'IRRELEVANT';

export interface ChatMessageRequest {
  message: string;
  session_id: string;
}

export interface ChatMessageResponse {
  job_id: string;
  status: ChatJobStatus;
}

export interface ChatJobResponse {
  job_id: string;
  status: ChatJobStatus;
  answer?: string | null;
  error_message?: string | null;
}

export interface ChatAnswerResult {
  status: 'COMPLETED' | 'IRRELEVANT';
  answer: string;
}

export interface ChatHistoryItem {
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}