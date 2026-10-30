import axios from 'axios';
import API from '@/api/api.config';
import { EventAnalytics, DemandForecast } from '@/types/analytics.types';

export const analyticsService = {

  getEventAnalytics: async (eventId: string): Promise<EventAnalytics> => {
    try {
      const response = await API.get<EventAnalytics>(`/api/analytics/event/${eventId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to fetch event analytics.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  getDemandForecast: async (eventId: string): Promise<DemandForecast> => {
    try {
      const response = await API.get<DemandForecast>(
        `/api/analytics/events/${eventId}/demand-forecast`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const body = error.response.data;
        const backendMessage =
          (typeof body === 'string' && body.trim() ? body : undefined) ||
          body?.detail ||
          body?.message ||
          'Failed to fetch demand forecast.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },
};