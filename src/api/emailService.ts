import axios from 'axios';
import API from '@/api/api.config';
import {
  SendCustomEmailRequest,
  SendCustomEmailResponse,
  SendBroadcastEmailRequest,
  SendBroadcastEmailResponse,
  GetAllBroadcastsResponse,
} from '@/types/email.types';

export const emailService = {
  sendCustomEmail: async (eventId: string, data: SendCustomEmailRequest): Promise<SendCustomEmailResponse> => {
    try {
      const response = await API.post<SendCustomEmailResponse>(
        `/api/event/send-custom-email/${eventId}`,
        data
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to send custom email.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  sendBroadcastEmail: async (eventId: string, data: SendBroadcastEmailRequest): Promise<SendBroadcastEmailResponse> => {
    try {
      const response = await API.post<SendBroadcastEmailResponse>(
        `/api/event/send-broadcast-email/${eventId}`,
        data
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to send broadcast email.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  getAllBroadcasts: async (eventId: string): Promise<GetAllBroadcastsResponse> => {
    try {
      const response = await API.get<GetAllBroadcastsResponse>(
        `/api/event/get-all-broadcasts/${eventId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to fetch broadcasts.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },
};