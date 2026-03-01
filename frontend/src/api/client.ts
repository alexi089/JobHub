import axios from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Application,
  ApplicationWithUpdates,
  Interview,
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

  create: async (data: {
    job_title: string;
    company_name: string;
    status?: string;
    applied_at: string;
    job_url?: string;
    notes?: string;
  }): Promise<Application> => {
    const response = await api.post<Application>('/api/applications', data);
    return response.data;
  },

  update: async (id: string, data: {
    job_title?: string;
    company_name?: string;
    status?: string;
    job_url?: string;
    notes?: string;
  }): Promise<Application> => {
    const response = await api.patch<Application>(`/api/applications/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/applications/${id}`);
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

// Interviews API
export const interviewsApi = {
  list: async (upcomingOnly: boolean = false): Promise<Interview[]> => {
    const response = await api.get<Interview[]>(`/api/interviews${upcomingOnly ? '?upcoming_only=true' : ''}`);
    return response.data;
  },

  get: async (id: string): Promise<Interview> => {
    const response = await api.get<Interview>(`/api/interviews/${id}`);
    return response.data;
  },

  create: async (data: {
    application_id: string;
    interview_date: string;
    interview_type?: string;
    location?: string;
    notes?: string;
  }): Promise<Interview> => {
    const response = await api.post<Interview>('/api/interviews', data);
    return response.data;
  },

  update: async (id: string, data: {
    interview_date?: string;
    interview_type?: string;
    location?: string;
    notes?: string;
    status?: string;
  }): Promise<Interview> => {
    const response = await api.patch<Interview>(`/api/interviews/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/interviews/${id}`);
  },
};

export default api;
