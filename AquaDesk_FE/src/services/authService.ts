import api from './api';

export interface LoginData {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  user: {
    userId: number;
    username: string;
    fullName: string;
    email: string;
    role: string;
    companyId: number;
  };
  accessRights: Array<{
    FormName: string;
    CanView: boolean;
    CanAdd: boolean;
    CanEdit: boolean;
    CanDelete: boolean;
    CanSearch: boolean;
    CanPrint: boolean;
  }>;
}

export const authService = {
  login: (data: LoginData) => api.post<LoginResponse>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
};
