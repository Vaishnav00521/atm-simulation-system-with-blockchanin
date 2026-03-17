import axios from 'axios';

// 🔴 1. Smart Routing: Uses Render in production, localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔴 2. The Security Interceptor
// This intercepts EVERY request your app makes and silently attaches your JWT token.
// This proves to the Spring Boot backend that you are securely logged in.
api.interceptors.request.use(
  (config) => {
    // We saved this exactly as 'fintech_jwt' in the Login.jsx file!
    const token = localStorage.getItem('fintech_jwt');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;