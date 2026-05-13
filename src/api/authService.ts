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
    const response = await API.post<BaseAuthResponse>('/api/auth/signup/initiate', data);
    return response.data;
  },

  verifySignup: async (data: VerifyOtpPayload): Promise<string> => {
    const response = await API.post<string>('/api/auth/signup/verify', data);
    return response.data; 
  },

  completeSignup: async (data: CompleteSignupPayload): Promise<CompleteSignupResponse> => {
    const response = await API.post<CompleteSignupResponse>('/api/auth/signup/complete', data);
    return response.data;
  },

  login: async (data: LoginPayload): Promise<LoginResponse> => {
    const response = await API.post<LoginResponse>('/api/auth/login', data);
    return response.data;
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
    const response = await API.post<string>('/api/auth/forgot-password/initiate', data);
    return response.data;
  },

  forgotPasswordVerify: async (data: ForgotPasswordVerifyPayload): Promise<string> => {
    const response = await API.post<string>('/api/auth/forgot-password/verify', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordPayload): Promise<Record<string, string>> => {
    const response = await API.post<Record<string, string>>('/api/auth/forgot-password/reset', data);
    return response.data;
  }
};