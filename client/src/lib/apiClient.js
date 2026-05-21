import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

export const apiUrl = (path) => `${API_BASE}${path}`;

export const authHeaders = (token) => ({
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const api = axios.create({
  baseURL: API_BASE || undefined,
  headers: {
    'Content-Type': 'application/json',
  },
});