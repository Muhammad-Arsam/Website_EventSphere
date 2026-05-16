import axios from 'axios';
import API from '@/api/api.config';
import { TicketTier, TicketTierPayload } from '@/types/ticket.types';

export const ticketService = {
  addTicketTier: async (eventId: string, data: TicketTierPayload): Promise<TicketTier> => {
    try {
      const response = await API.post<TicketTier>(`/api/event/add-ticket-tier/${eventId}`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to add ticket tier.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  updateTicketTier: async (eventId: string, ticketId: string, data: TicketTierPayload): Promise<TicketTier> => {
    try {
      const response = await API.patch<TicketTier>(`/api/event/update-ticket-tier/${eventId}/${ticketId}`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to update ticket tier.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  getAllTicketTiers: async (eventId: string): Promise<TicketTier[]> => {
    try {
      const response = await API.get<TicketTier[]>(`/api/event/get-all-ticket-tiers/${eventId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to fetch ticket tiers.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  getTicketTierById: async (ticketId: string): Promise<TicketTier> => {
    try {
      const response = await API.get<TicketTier>(`/api/event/find-ticket-tier-by-id/${ticketId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to fetch ticket tier details.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  deleteTicketTier: async (eventId: string, ticketId: string): Promise<string> => {
    try {
      const response = await API.delete<string>(`/api/event/delete-ticket-tier/${eventId}/${ticketId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to delete ticket tier.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  }
};