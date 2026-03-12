import axios from 'axios';

const api = axios.create({
    // This tells React: "Use the live URL if we are on Vercel, otherwise use localhost"
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

// The Interceptor: Automatically attaches the JWT token to EVERY request
api.interceptors.request.use(
    (config) => {
        // Force grab the latest token directly from the browser vault
        const token = localStorage.getItem('fintech_jwt');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        // Explicitly tell Java we are sending JSON
        config.headers['Content-Type'] = 'application/json';
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;