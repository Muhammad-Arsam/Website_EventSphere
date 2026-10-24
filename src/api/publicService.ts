import axios from 'axios';
import API from '@/api/api.config';
import {
  PublicEventCard,
  PublicEventPageResponse,
  CheckoutRequest,
  CheckoutResponse,
  ValidatePromoCodeResponse,
  RecoverTicketsResponse,
} from '@/types/event.types';
import { EventTemplateData, ThemeConfigJson } from '@/types/template.types';
import {
  ChatMessageRequest,
  ChatMessageResponse,
  ChatJobResponse,
  ChatAnswerResult,
} from '@/types/chat.types';

// Public chat calls use their own axios instance: no login token and no
// refresh/redirect-to-signin logic, so visitors are never sent to /signin.
const publicChatClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Backend marked the job as FAILED (a server error on their side).
export class ChatJobFailedError extends Error {
  constructor(message?: string) {
    super(message || 'Chat job failed.');
    this.name = 'ChatJobFailedError';
  }
}

// The job stayed "pending" until our timeout.
export class ChatTimeoutError extends Error {
  constructor() {
    super('The assistant is taking too long to reply.');
    this.name = 'ChatTimeoutError';
  }
}

export const publicService = {
  getPublishedEvents: async (): Promise<PublicEventCard[]> => {
    try {
      const response = await API.get<PublicEventCard[]>('/api/public/get-published-events');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to fetch published events.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  getEventBySlug: async (slug: string): Promise<PublicEventPageResponse> => {
    try {
      const response = await API.get<PublicEventPageResponse>(`/api/public/event/${slug}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to fetch event page.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

    checkout: async (eventId: string, payload: CheckoutRequest): Promise<CheckoutResponse> => {
    try {
      const response = await API.post<CheckoutResponse>(
        `/api/public/checkout/${eventId}`,
        payload,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage =
          error.response.data?.detail ||
          error.response.data?.message ||
          'Checkout failed. Please try again.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  validatePromoCode: async (eventId: string, code: string): Promise<ValidatePromoCodeResponse> => {
  try {
    const response = await API.get<ValidatePromoCodeResponse>(
      `/api/public/discount-code/validate/${eventId}`,
      { params: { code } }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data?.detail || 'Failed to validate promo code.';
      throw new Error(backendMessage);
    }
    throw new Error('Network error. Please check your connection.');
  }
},

  parseThemeConfig: (themeConfigJson: string): ThemeConfigJson | null => {
    try {
      return JSON.parse(themeConfigJson) as ThemeConfigJson;
    } catch {
      return null;
    }
  },

  assembleTemplateData: (response: PublicEventPageResponse): EventTemplateData | null => {
    if (!response.landingPageDesign?.themeConfigJson) {
      return null;
    }

    let theme: ThemeConfigJson;
    try {
      theme = JSON.parse(response.landingPageDesign.themeConfigJson) as ThemeConfigJson;
    } catch {
      return null;
    }

    if (!theme.templateName) {
      return null;
    }

    return {
      eventId: response.eventDetails.id,
      title: response.eventDetails.title,
      description: response.eventDetails.description,
      imageUrl: response.eventDetails.imageUrl,
      startDatetime: response.eventDetails.startDatetime,
      endDatetime: response.eventDetails.endDatetime,
      venueName: response.eventDetails.venueName,
      formattedAddress: response.eventDetails.formattedAddress,
      tags: response.eventDetails.searchTags ?? [],
      primaryColor: theme.primaryColor ?? '#06b6d4',
      secondaryColor: theme.secondaryColor ?? '#3b82f6',
      backgroundColor: theme.backgroundColor,
      fontStyle: theme.fontStyle,
      templateName: theme.templateName,
      organizerName: theme.organizerName ?? '',
      organizerEmail: theme.organizerEmail,
      organizerPhone: theme.organizerPhone,
      socialLinks: theme.socialLinks,
      enabledTabs: theme.enabledTabs,
      chatbotEnabled: theme.chatbotEnabled ?? false,
      tickets: response.tickets ?? [],
      agenda: response.agenda ?? [],
      sponsors: response.sponsors ?? [],
    };
  },

  recoverTickets: async (eventId: string, email: string): Promise<RecoverTicketsResponse> => {
  try {
    const response = await API.post<RecoverTicketsResponse>(
      `/api/public/tickets/recover/${eventId}`,
      { email }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data?.detail || 'Failed to recover tickets.';
      throw new Error(backendMessage);
    }
    throw new Error('Network error. Please check your connection.');
  }
},

  // --- CHATBOT (public, async job based) ---
  // Step 1: send the question. The backend returns a job_id (status "pending").
  sendChatMessage: async (
    eventId: string,
    payload: ChatMessageRequest,
    signal?: AbortSignal,
  ): Promise<ChatMessageResponse> => {
    try {
      const response = await publicChatClient.post<ChatMessageResponse>(
         `/api/public/event/${encodeURIComponent(eventId)}/chat`,
        payload,
        { signal },
      );
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) throw new Error('Request cancelled.');
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage =
          error.response.data?.detail ||
          error.response.data?.message ||
          'Failed to send your message.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  // Step 2: read the job. status is PENDING, COMPLETED or FAILED.
  getChatJob: async (jobId: string, signal?: AbortSignal): Promise<ChatJobResponse> => {
    try {
      const response = await publicChatClient.get<ChatJobResponse>(
        `/api/public/event/chat/jobs/${encodeURIComponent(jobId)}`,
        { signal },
      );
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) throw new Error('Request cancelled.');
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage =
          error.response.data?.detail ||
          error.response.data?.message ||
          'Failed to fetch the chatbot reply.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  // Polls the job until it is COMPLETED (returns the answer text),
  // FAILED (throws ChatJobFailedError) or the timeout is reached
  // (throws ChatTimeoutError). PENDING and unknown statuses keep polling.
  waitForChatAnswer: async (
    jobId: string,
    options: { intervalMs?: number; timeoutMs?: number; signal?: AbortSignal } = {},
  ): Promise<ChatAnswerResult> => {
    const { intervalMs = 1500, timeoutMs = 180000, signal } = options;
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      if (signal?.aborted) throw new Error('Request cancelled.');

      const job = await publicService.getChatJob(jobId, signal);
      const status = String(job.status ?? '').toUpperCase();

      if (status === 'FAILED') {
        throw new ChatJobFailedError(job.error_message ?? undefined);
      }
      if (status === 'COMPLETED' || status === 'COMPLETE') {
        return { status: 'COMPLETED', answer: (job.answer ?? '').trim() };
      }
      if (status === 'IRRELEVANT') {
        return { status: 'IRRELEVANT', answer: (job.answer ?? '').trim() };
      }

      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, intervalMs);
        signal?.addEventListener(
          'abort',
          () => {
            clearTimeout(timer);
            reject(new Error('Request cancelled.'));
          },
          { once: true },
        );
      });
    }

    throw new ChatTimeoutError();
  },
};