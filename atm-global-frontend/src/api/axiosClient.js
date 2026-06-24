import axios from 'axios';

// Use local backend in dev, production URL in deployed environments
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8081' : 'https://global-atm-backend.onrender.com');

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject JWT token automatically on every outgoing request
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

// ╔══════════════════════════════════════════════════════════════╗
// ║   LAYER 5 INTEGRATION: SERVER-SIDE TOKEN REVOCATION          ║
// ║   On 401/403, call the backend logout endpoint to blacklist  ║
// ║   the token before clearing localStorage.                    ║
// ╚══════════════════════════════════════════════════════════════╝
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    if ((status === 403 || status === 401) && !url.includes('/api/auth/')) {
      console.warn("[AUTH] Session expired or revoked. Cleaning up...");
      const token = localStorage.getItem('fintech_jwt');
      // Call the backend logout endpoint to formally blacklist this token
      if (token) {
        try {
          await axios.post(`${API_URL}/api/auth/logout`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (e) {
          // Silently fail — local cleanup still happens
        }
      }
      localStorage.removeItem('fintech_jwt');
      localStorage.removeItem('fintech_username');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
