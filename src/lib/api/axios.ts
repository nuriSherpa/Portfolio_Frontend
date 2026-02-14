// src/lib/api/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for visitor token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const visitorToken = localStorage.getItem('visitor_token');
    if (visitorToken) {
      config.headers['X-Visitor-Token'] = visitorToken;
    }
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 404) {
      console.error('Resource not found');
    }
    return Promise.reject(error);
  },
);

export default api;
