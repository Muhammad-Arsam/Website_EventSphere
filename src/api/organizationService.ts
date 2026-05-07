import axios from 'axios';
import API from './api.config';
import {
  Organization,
  CreateOrganizationData,
  UpdateOrganizationData,
} from '../types/organization.types';

export const organizationService = {
  getMyOrganization: async (): Promise<Organization | null> => {
    try {
      const response = await API.get('/api/organization/my-org');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          return null;
        }
        const backendMessage = error.response.data?.detail || 'Failed to fetch organization data.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  createOrganization: async (data: CreateOrganizationData): Promise<Organization> => {
    try {
      const formData = new FormData();
      
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('image', data.image);

      const response = await API.post('/api/organization/create-organization', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to create organization.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  updateOrganization: async (id: string, data: UpdateOrganizationData): Promise<Organization> => {
    try {
      const formData = new FormData();

      if (data.name) formData.append('name', data.name);
      if (data.email) formData.append('email', data.email);
      if (data.image) formData.append('image', data.image);

      const response = await API.patch(`/api/organization/update-organization/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to update organization.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },
};