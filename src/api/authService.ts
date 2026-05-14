import axios from 'axios';
import API from '@/api/api.config';
import { removeToken } from '@/utils/token';
import {
  InitiateSignupPayload,
  VerifyOtpPayload,
  CompleteSignupPayload,
  BaseAuthResponse,
  CompleteSignupResponse,
  LoginPayload,
  LoginResponse,
  ForgotPasswordInitiatePayload,
  ForgotPasswordVerifyPayload,
  ResetPasswordPayload,
} from '../types/auth.types';

export const authService = {
  initiateSignup: async (data: InitiateSignupPayload): Promise<BaseAuthResponse> => {
    try {
      const response = await API.post<BaseAuthResponse>('/api/auth/signup/initiate', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to initiate signup.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  verifySignup: async (data: VerifyOtpPayload): Promise<string> => {
    try {
      const response = await API.post<string>('/api/auth/signup/verify', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to verify OTP.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  completeSignup: async (data: CompleteSignupPayload): Promise<CompleteSignupResponse> => {
    try {
      const response = await API.post<CompleteSignupResponse>('/api/auth/signup/complete', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to complete signup.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  login: async (data: LoginPayload): Promise<LoginResponse> => {
    try {
      const response = await API.post<LoginResponse>('/api/auth/login', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to login.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  logout: async (): Promise<void> => {
    try {
      await API.post('/api/auth/logout');
    } catch (error) {
      console.error("Backend logout failed, proceeding with local cleanup:", error);
    } finally {
      removeToken(); 
      window.location.href = '/signin';
    }
  },

  forgotPasswordInitiate: async (data: ForgotPasswordInitiatePayload): Promise<string> => {
    try {
      const response = await API.post<string>('/api/auth/forgot-password/initiate', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to initiate password reset.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  forgotPasswordVerify: async (data: ForgotPasswordVerifyPayload): Promise<string> => {
    try {
      const response = await API.post<string>('/api/auth/forgot-password/verify', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to verify password reset OTP.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  resetPassword: async (data: ResetPasswordPayload): Promise<Record<string, string>> => {
    try {
      const response = await API.post<Record<string, string>>('/api/auth/forgot-password/reset', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to reset password.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  }
};