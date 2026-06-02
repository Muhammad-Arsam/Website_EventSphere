import axios from 'axios';
import API from '@/api/api.config';
import { EventAnalytics } from '@/types/analytics.types';

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
};