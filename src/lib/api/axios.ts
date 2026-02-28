// src/lib/api/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor - IMPROVED ERROR LOGGING
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();
    const baseURL = error.config?.baseURL;

    if (status === 404) {
      console.error(`❌ 404 Not Found: ${method} ${baseURL}${url}`);
      console.error('Response data:', error.response?.data);
    } else if (status >= 500) {
      console.error(`❌ Server Error ${status}: ${method} ${url}`);
    } else if (error.code === 'ECONNREFUSED') {
      console.error(`❌ Connection refused: ${baseURL} is not reachable`);
    }

    return Promise.reject(error);
  },
);

export default api;
