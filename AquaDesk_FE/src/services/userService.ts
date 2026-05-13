import api from './api';

export interface User {
  UserID: number;
  Username: string;
  FullName: string;
  Email?: string;
  Phone?: string;
  Role: string;
  Status: boolean;
  LastLogin?: string;
  CompanyID: number;
  CompanyName?: string;
}

export interface UserInput {
  username: string;
  password: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: string;
  companyId?: number;
  accessRights?: Array<{
    formName: string;
    canView: boolean;
    canAdd: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canSearch: boolean;
    canPrint: boolean;
  }>;
}

export const userService = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  create: (data: UserInput) => api.post('/users', data),
  update: (id: number, data: Partial<UserInput>) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
  resetPassword: (id: number, newPassword: string) =>
    api.post(`/users/${id}/reset-password`, { newPassword }),
};
