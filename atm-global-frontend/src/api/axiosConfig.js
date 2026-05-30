import axios from 'axios';

// 🚀 INTELLIGENT API_BASE_URL SELECTION
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Honoring VITE_API_URL environment variable first, otherwise fallback to local/prod defaults
let API_BASE_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8080' : 'https://global-atm-backend.onrender.com');

// 🛡️ Ensure no trailing slashes which can mess up endpoint paths
if (API_BASE_URL.endsWith('/')) {
  API_BASE_URL = API_BASE_URL.slice(0, -1);
}

// 🛡️ PERMANENT FIX: Force HTTPS when on a secure origin (Vercel) to prevent Mixed Content security errors
if (window.location.protocol === 'https:') {
  // If the environment variable contains localhost but we are on secure Vercel, force the Render URL
  if (API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1')) {
    API_BASE_URL = 'https://global-atm-backend.onrender.com';
  } else {
    API_BASE_URL = API_BASE_URL.replace(/^http:\/\//i, 'https://');
  }
}

console.log(`[SYS] Initializing Network Layer. Target: ${API_BASE_URL}`);

export const API_URL = API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT token into every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fintech_jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle common errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    // Only evict session for non-auth endpoints getting 401/403
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

export default api;