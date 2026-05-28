import axios from 'axios';
import API from '@/api/api.config';
import {
  PublicEventCard,
  PublicEventPageResponse,
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

  parseThemeConfig: (themeConfigJson: string): ThemeConfigJson | null => {
  try {
    return JSON.parse(themeConfigJson) as ThemeConfigJson;
  } catch {
    return null;
  }
},

  assembleTemplateData: (response: PublicEventPageResponse): EventTemplateData | null => {
    // Guard: if no landing page design at all, bail early
    if (!response.landingPageDesign?.themeConfigJson) {
        return null;
    }

    let theme: ThemeConfigJson;
    try {
        theme = JSON.parse(response.landingPageDesign.themeConfigJson) as ThemeConfigJson;
    } catch {
        return null;
    }

    // Guard: templateName must be valid
    if (!theme.templateName) {
        return null;
    }

    return {
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
        templateName: theme.templateName,
        organizerName: theme.organizerName ?? '',
        tickets: response.tickets ?? [],
        agenda: response.agenda ?? [],
    };
},
};
