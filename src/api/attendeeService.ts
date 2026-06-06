import axios from 'axios';
import API from '@/api/api.config';
import {
  AttendeeTicketsResponse,
  AttendeeOrdersResponse,
  AttendeeEventsResponse,
  TransferTicketRequest,
} from '@/types/attendee.types';

export const attendeeService = {
  getMyTickets: async (): Promise<AttendeeTicketsResponse> => {
    try {
      const response = await API.get<AttendeeTicketsResponse>('/api/attendee/my-tickets');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to fetch your tickets.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  getMyOrders: async (): Promise<AttendeeOrdersResponse> => {
    try {
      const response = await API.get<AttendeeOrdersResponse>('/api/attendee/my-orders');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to fetch your orders.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  getMyEvents: async (): Promise<AttendeeEventsResponse> => {
    try {
      const response = await API.get<AttendeeEventsResponse>('/api/attendee/my-events');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to fetch your events.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  transferTicket: async (ticketId: string, data: TransferTicketRequest): Promise<string> => {
    try {
      const response = await API.post<string>(
        `/api/attendee/tickets/transfer-ticket/${ticketId}`,
        data
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to transfer ticket.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },
};