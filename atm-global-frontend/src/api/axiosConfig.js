import axios from 'axios';

// 🚀 INTELLIGENT API_BASE_URL SELECTION
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Default to local backend if on localhost, otherwise use the public Render URL
let API_BASE_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8080' : 'https://global-atm-backend.onrender.com');

// 🛡️ PERMANENT FIX: Force HTTPS when the browser is on a secure origin (Vercel/Netlify)
// This prevents the fatal "Mixed Content" SecurityError that kills WebSocket & API calls
if (window.location.protocol === 'https:') {
  // Overwrite localhost fallbacks that can never work in production
  if (API_BASE_URL.includes('localhost') || API_BASE_URL.startsWith('http://localhost')) {
    API_BASE_URL = 'https://global-atm-backend.onrender.com';
  }
  // Upgrade any remaining insecure http:// to https://
  else if (API_BASE_URL.startsWith('http://')) {
    API_BASE_URL = API_BASE_URL.replace('http://', 'https://');
  }
}

console.log(`[SYS] Initializing Network Layer. Target: ${API_BASE_URL}`);

// Export the resolved URL so WebSocket / SockJS consumers can reuse it
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

// Optional: Handle common errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn(`[API ERROR] ${error.config?.url}:`, error.message);
    if (error.response?.status === 403) {
      // Possible expired token or unauthorized access
      console.error("403 Forbidden: Potential JWT expiration or CORS issue.");
    }
    return Promise.reject(error);
  }
);

export default api;