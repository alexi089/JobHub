import axios from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Application,
  ApplicationWithUpdates,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post<User>('/api/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/api/auth/me');
    return response.data;
  },
};

// Applications API
export const applicationsApi = {
  list: async (): Promise<Application[]> => {
    const response = await api.get<Application[]>('/api/applications');
    return response.data;
  },

  get: async (id: string): Promise<ApplicationWithUpdates> => {
    const response = await api.get<ApplicationWithUpdates>(`/api/applications/${id}`);
    return response.data;
  },
};

// ATS API
export const atsApi = {
  connectGreenhouse: async (data: { api_key: string; company_name: string }) => {
    const response = await api.post('/api/ats/greenhouse/connect', data);
    return response.data;
  },

  listAccounts: async () => {
    const response = await api.get('/api/ats/accounts');
    return response.data;
  },

  syncGreenhouse: async (accountId: string) => {
    const response = await api.post(`/api/ats/greenhouse/sync/${accountId}`);
    return response.data;
  },

  disconnect: async (accountId: string) => {
    await api.delete(`/api/ats/accounts/${accountId}`);
  },
};

export default api;
