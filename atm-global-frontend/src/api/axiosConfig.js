// Native Fetch implementation to replace Axios
let API_BASE_URL = import.meta.env.VITE_API_URL || 'https://global-atm-backend.onrender.com';

if (window.location.protocol === 'https:' && (API_BASE_URL.includes('localhost') || API_BASE_URL.startsWith('http://'))) {
  API_BASE_URL = 'https://global-atm-backend.onrender.com';
}

const customFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('fintech_jwt');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Automatically parse JSON to mimic Axios behavior
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw { response: { status: response.status, data } };
  }

  return { data };
};

// Expose standard methods so you don't have to rewrite your component code
const api = {
  get: (url, config) => customFetch(url, { method: 'GET', ...config }),
  post: (url, data, config) => customFetch(url, { method: 'POST', body: JSON.stringify(data), ...config }),
};

export default api;