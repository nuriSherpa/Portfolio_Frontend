// src/lib/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach visitor token for browser requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token =
      localStorage.getItem('visitor_token') || document.cookie.match(/visitor_token=([^;]+)/)?.[1];
    if (token) {
      config.headers['X-Visitor-Token'] = token;
    }
  }
  return config;
});

export default apiClient;
