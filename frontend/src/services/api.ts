import axios from 'axios';
import { User, Project, TimeEntry, LoginCredentials, RegisterData, ApiResponse, ReportFilters } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  },
});

// const [reportData, setReportData] = useState<any>({});



apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const handleApiResponse = <T>(response: any): ApiResponse<T> => ({
  success: true,
  message: response.data.message || 'Success',
  data: response.data.data || response.data,
});

const handleApiError = (error: any): never => {
  const message = error.response?.data?.message || error.message || 'An error occurred';
  throw new Error(message);
};

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
  register: async (userData: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    try {
      const response = await apiClient.post('/auth/refresh');
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
  logout: async (): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.post('/auth/logout');
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export const usersApi = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    try {
      const response = await apiClient.post('/');
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
  getById: async (id: string): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
  create: async (userData: Omit<User, 'id' | 'createdAt'>): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.post('/users', userData);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
  delete: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.delete(`/users/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
};






export const projectsApi = {
  getAll: async (): Promise<ApiResponse<Project[]>> => {
    try {
      const response = await apiClient.get('/projects');
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  create: async (projectData: Omit<Project, 'id' | 'createdAt'>): Promise<ApiResponse<Project>> => {
    try {
      const response = await apiClient.post('/projects', projectData);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
  update: async (id: string, projectData: Partial<Project>): Promise<ApiResponse<Project>> => {
    try {
      const response = await apiClient.put(`/projects/${id}`, projectData);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
  delete: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.delete(`/projects/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
  assignUsers: async (projectId: string, userIds: string[]): Promise<ApiResponse<Project>> => {
    try {
      const response = await apiClient.post(`/projects/${projectId}/assign`, { userIds });
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
};




export const timeEntriesApi = {
  getAll: async (): Promise<ApiResponse<TimeEntry[]>> => {
    try {
      const response = await apiClient.get('/');
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
  getById: async (id: string): Promise<ApiResponse<TimeEntry>> => {
    try {
      const response = await apiClient.get(`/time-entries/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
  getByUser: async (userId: string): Promise<ApiResponse<TimeEntry[]>> => {
    try {
      const response = await apiClient.get(`/time-entries/user/${userId}`);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
  create: async (entryData: Omit<TimeEntry, 'id' | 'createdAt'>): Promise<ApiResponse<TimeEntry>> => {
    try {
      const response = await apiClient.post('/time-entries', entryData);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
  update: async (id: string, entryData: Partial<TimeEntry>): Promise<ApiResponse<TimeEntry>> => {
    try {
      const response = await apiClient.put(`/time-entries/${id}`, entryData);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
  delete: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.delete(`/time-entries/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
  getReports: async (filters: ReportFilters): Promise<ApiResponse<TimeEntry[]>> => {
    try {
      const params = new URLSearchParams();
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      const response = await apiClient.get(`/time-entries/reports?${params.toString()}`);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
};



export const reportsApi = {
  generate: async (params: { userId?: string; month?: string; year?: string }) => {
    try {
      const res = await apiClient.get('/reports', { params });
      return handleApiResponse(res);
    } catch (err) {
      return handleApiError(err);
    }
  },
};




export { apiClient };
