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
      tickets: response.tickets ?? [],
      agenda: response.agenda ?? [],
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
};