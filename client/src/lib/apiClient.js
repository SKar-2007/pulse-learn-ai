import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

const normalizePath = (path) => {
  const nextPath = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE.endsWith('/api') && nextPath.startsWith('/api')) {
    return nextPath.replace(/^\/api/, '');
  }
  return nextPath;
};

export const apiUrl = (path) => `${API_BASE}${normalizePath(path)}`;

export const authHeaders = (token) => ({
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const api = axios.create({
  baseURL: API_BASE || undefined,
  headers: {
    'Content-Type': 'application/json',
  },
});