import axios from 'axios';
import API from '@/api/api.config';
import { Sponsor, AddSponsorRequest } from '@/types/sponsor.types';

export const sponsorService = {

  addSponsor: async (eventId: string, data: AddSponsorRequest): Promise<Sponsor> => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('sponsorTier', data.sponsorTier);
      formData.append('logo', data.logo);
      if (data.websiteUrl) {
        formData.append('websiteUrl', data.websiteUrl);
      }

      const response = await API.post<Sponsor>(
        `/api/event/add-sponsor/${eventId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to add sponsor.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  getSponsors: async (eventId: string): Promise<Sponsor[]> => {
    try {
      const response = await API.get<Sponsor[]>(
        `/api/event/get-all-sponsors/${eventId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to fetch sponsors.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  deleteSponsor: async (eventId: string, sponsorId: string): Promise<string> => {
    try {
      const response = await API.delete<string>(
        `/api/event/delete-sponsor/${eventId}/${sponsorId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to delete sponsor.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

};