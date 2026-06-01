import axios from 'axios';
import API from '@/api/api.config';
import {
  DiscountCode,
  AddDiscountRequest,
  UpdateDiscountRequest,
} from '@/types/discount.types';

export const discountService = {

  addDiscount: async (eventId: string, data: AddDiscountRequest): Promise<DiscountCode> => {
    try {
      const response = await API.post<DiscountCode>(
        `/api/event/add-discount/${eventId}`,
        data
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to add discount code.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  updateDiscount: async (
    eventId: string,
    codeId: string,
    data: UpdateDiscountRequest
  ): Promise<DiscountCode> => {
    try {
      const response = await API.put<DiscountCode>(
        `/api/event/update-discount/${eventId}/${codeId}`,
        data
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to update discount code.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  toggleDiscountStatus: async (eventId: string, codeId: string): Promise<DiscountCode> => {
    try {
      const response = await API.patch<DiscountCode>(
        `/api/event/toggle-discount-status/${eventId}/${codeId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to toggle discount status.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  getDiscounts: async (eventId: string): Promise<DiscountCode[]> => {
    try {
      const response = await API.get<DiscountCode[]>(
        `/api/event/get-discounts/${eventId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to fetch discount codes.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  deleteDiscount: async (eventId: string, codeId: string): Promise<string> => {
    try {
      const response = await API.delete<string>(
        `/api/event/delete-discount-code/${eventId}/${codeId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to delete discount code.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },
};