// Protocol-aware URL logic to prevent Mixed Content errors
let API_BASE_URL = import.meta.env.VITE_API_URL || 'https://global-atm-backend.onrender.com';

// Ensure protocol matches the current page (HTTPS vs HTTP)
const protocol = window.location.protocol === 'https:' ? 'https://' : 'http://';
const cleanBase = API_BASE_URL.replace(/^https?:\/\//, '');
API_BASE_URL = `${protocol}${cleanBase}`;

console.log("Using API Base:", API_BASE_URL);

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