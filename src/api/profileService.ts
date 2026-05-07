import API from './api.config';
import { UserProfile, UpdateProfileData } from '../types/profile.types';
import axios from 'axios';

export const profileService = {
  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await API.get<UserProfile>('/api/users/get-profile');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to load profile data.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

 updateProfile: async (data: UpdateProfileData): Promise<any> => {
    try {
      const formData = new FormData();

      if (data.name) formData.append('name', data.name);
      if (data.email) formData.append('email', data.email);
      if (data.password) formData.append('password', data.password);
      if (data.phoneNo) formData.append('phoneNo', data.phoneNo);
      
      if (data.profilePic) {
        formData.append('profilePic', data.profilePic);
      }

      const response = await API.patch('/api/users/update-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to update profile data.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },
};