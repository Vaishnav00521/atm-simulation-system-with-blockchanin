import axios from 'axios';

// 🚀 INTELLIGENT API_BASE_URL SELECTION
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Default to local backend if on localhost, otherwise use the public Render URL
const API_BASE_URL = isLocal ? 'http://localhost:8080' : 'https://global-atm-backend.onrender.com';

console.log(`[SYS] Initializing Network Layer. Target: ${API_BASE_URL}`);

// Export the resolved URL so WebSocket consumers can reuse it
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
    // (auth endpoints like /api/auth/login SHOULD return 401 for bad credentials — that's not a session issue)
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