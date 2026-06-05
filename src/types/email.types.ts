export interface SendCustomEmailRequest {
  email: string[];
  subject: string;
  messageBody: string;
}

export type SendCustomEmailResponse = string;

export interface SendBroadcastEmailRequest {
  subject: string;
  messageBody: string;
}

export type SendBroadcastEmailResponse = string;

export interface BroadcastRecord {
  id: string;
  eventId: string;
  subject: string;
  messageBody: string;
  recipientCount: number;
  sentAt: string;
}

export type GetAllBroadcastsResponse = BroadcastRecord[];