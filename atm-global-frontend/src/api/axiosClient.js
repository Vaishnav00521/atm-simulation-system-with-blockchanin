import axios from 'axios';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
let API_BASE_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8080' : 'https://global-atm-backend.onrender.com');

if (API_BASE_URL.endsWith('/')) {
  API_BASE_URL = API_BASE_URL.slice(0, -1);
}

if (window.location.protocol === 'https:') {
  if (API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1')) {
    API_BASE_URL = 'https://global-atm-backend.onrender.com';
  } else {
    API_BASE_URL = API_BASE_URL.replace(/^http:\/\//i, 'https://');
  }
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject token automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fintech_jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    if ((status === 403 || status === 401) && !url.includes('/api/auth/')) {
      console.warn("[AUTH] Session expired or invalid. Evicting credentials.");
      localStorage.removeItem('fintech_jwt');
      localStorage.removeItem('fintech_username');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const API_URL = API_BASE_URL;
export default apiClient;
