export interface User {
  _id?: any;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Project {
  _id?: any;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  assignedUsers: string[];
  createdAt: string;
  endDate?: string;
  
  startDate?: string;
}

export interface TimeEntry {
  id: string;
  userId: string;
  project: any;
  description: string;
  date: string;
  hoursWorked:number
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
  }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface ReportFilters {
  userId?: string;
  project?: string;
  startDate?: string;
  endDate?: string;
  month?: string;
  year?: string
}