import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  ApiResponse,
  User,
  Case,
  Document,
  DocumentVersion,
  AuditLog,
  Analytics,
  IntegrityResult,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // If not already on login page, redirect
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Service functions
export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', credentials);
    return response.data;
  },
  register: async (userData: Partial<User> & { password: string }) => {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', userData);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },
};

export const userService = {
  getUsers: async (params?: { page?: number; limit?: number; role?: string; department?: string; search?: string }) => {
    const response = await api.get<ApiResponse<User[]>>('/users', { params });
    return response.data;
  },
  createUser: async (userData: Partial<User> & { password: string }) => {
    const response = await api.post<ApiResponse<User>>('/users', userData);
    return response.data;
  },
  updateUser: async (id: string, userData: Partial<User>) => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, userData);
    return response.data;
  },
  updateUserStatus: async (id: string, status: 'active' | 'inactive' | 'suspended') => {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}/status`, { status });
    return response.data;
  },
};

export const caseService = {
  getCases: async (params?: { page?: number; limit?: number; status?: string; priority?: string; type?: string; search?: string }) => {
    const response = await api.get<ApiResponse<Case[]>>('/cases', { params });
    return response.data;
  },
  getCase: async (id: string) => {
    const response = await api.get<ApiResponse<Case>>(`/cases/${id}`);
    return response.data;
  },
  createCase: async (caseData: Partial<Case>) => {
    const response = await api.post<ApiResponse<Case>>('/cases', caseData);
    return response.data;
  },
  updateCase: async (id: string, caseData: Partial<Case>) => {
    const response = await api.put<ApiResponse<Case>>(`/cases/${id}`, caseData);
    return response.data;
  },
};

export const documentService = {
  getDocuments: async (params?: {
    page?: number;
    limit?: number;
    caseId?: string;
    type?: string;
    status?: string;
    securityLevel?: string;
    search?: string;
  }) => {
    const response = await api.get<ApiResponse<Document[]>>('/documents', { params });
    return response.data;
  },
  getDocument: async (id: string) => {
    const response = await api.get<ApiResponse<Document>>(`/documents/${id}`);
    return response.data;
  },
  uploadDocument: async (formData: FormData) => {
    const response = await api.post<ApiResponse<Document>>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  updateDocument: async (id: string, docData: Partial<Document>) => {
    const response = await api.put<ApiResponse<Document>>(`/documents/${id}`, docData);
    return response.data;
  },
  deleteDocument: async (id: string) => {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/documents/${id}`);
    return response.data;
  },
  verifyIntegrity: async (id: string) => {
    const response = await api.post<ApiResponse<IntegrityResult>>(`/documents/${id}/verify-integrity`);
    return response.data;
  },
  getVersions: async (id: string) => {
    const response = await api.get<ApiResponse<DocumentVersion[]>>(`/documents/${id}/versions`);
    return response.data;
  },
  createVersion: async (id: string, formData: FormData) => {
    const response = await api.post<ApiResponse<DocumentVersion>>(`/documents/${id}/versions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  analyzeDocument: async (id: string) => {
    const response = await api.post<ApiResponse<Document>>(`/documents/${id}/analyze`);
    return response.data;
  },
  summarizeDocument: async (id: string) => {
    const response = await api.post<ApiResponse<{ summary: string }>>(`/documents/${id}/summarize`);
    return response.data;
  },
  classifyDocument: async (id: string) => {
    const response = await api.post<ApiResponse<{ classification: Document['aiClassification'] }>>(`/documents/${id}/classify`);
    return response.data;
  },
};

export const searchService = {
  searchDocuments: async (params: { q: string; case?: string; type?: string; level?: string; status?: string; page?: number; limit?: number }) => {
    const response = await api.get<ApiResponse<Document[]>>('/search', { params });
    return response.data;
  },
};

export const auditService = {
  getAuditLogs: async (params?: { page?: number; limit?: number; action?: string; userId?: string; resourceType?: string; status?: string; search?: string }) => {
    const response = await api.get<ApiResponse<AuditLog[]>>('/audit-logs', { params });
    return response.data;
  },
};

export const analyticsService = {
  getAnalytics: async () => {
    const response = await api.get<ApiResponse<Analytics>>('/analytics');
    return response.data;
  },
};

export default api;
