import axios from 'axios';

// 🚀 INTELLIGENT API_BASE_URL SELECTION
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Default to local backend if on localhost, otherwise use the public Render URL
let API_BASE_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8080' : 'https://global-atm-backend.onrender.com');

// Ensure protocol matches for remote deployments to prevent Mixed Content errors
if (!isLocal && window.location.protocol === 'https:' && API_BASE_URL.startsWith('http://')) {
    API_BASE_URL = API_BASE_URL.replace('http://', 'https://');
}

console.log(`[SYS] Initializing Network Layer. Target: ${API_BASE_URL}`);

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