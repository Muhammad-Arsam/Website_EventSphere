import axios, { InternalAxiosRequestConfig } from 'axios';
import { 
  getToken, 
  removeToken, 
  getRefreshToken, 
  setToken, 
  setRefreshToken 
} from '../utils/token';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- REFRESH TOKEN QUEUE LOGIC ---
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --- REQUEST INTERCEPTOR ---
API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- RESPONSE INTERCEPTOR ---
API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't already tried to refresh this specific request
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      
      // If a refresh is already in progress, add this request to the queue
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return API(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      // If there's no refresh token in local storage, kick them out
      if (!refreshToken) {
        removeToken();
        if (typeof window !== 'undefined') window.location.href = '/signin';
        return Promise.reject(error);
      }

      try {
        // Call the refresh API using a fresh axios instance to avoid interceptor loops
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/refresh`,
          { refreshToken: refreshToken }
        );

        // Based on Swagger, the response contains accessToken and refreshToken
        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;

        // Save the new tokens
        setToken(newAccessToken);
        setRefreshToken(newRefreshToken);

        // Update the original request header and process the queue
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        
        // Retry the original request
        return API(originalRequest);

      } catch (err) {
        // If the refresh token itself is expired or invalid, log the user out
        processQueue(err, null);
        removeToken();
        if (typeof window !== 'undefined') window.location.href = '/signin';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default API;