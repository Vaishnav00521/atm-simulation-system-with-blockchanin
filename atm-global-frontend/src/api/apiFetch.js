import { API_URL } from './axiosClient';

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('fintech_jwt');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Base URL is either the configured API_URL or localhost for dev
  const baseUrl = API_URL || 'http://localhost:8081';
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred while fetching the data.');
  }

  return data;
};
