import api from './api';

export interface Company {
  CompanyID: number;
  CompanyCode: string;
  CompanyName: string;
  Address?: string;
  City?: string;
  State?: string;
  Country?: string;
  Phone?: string;
  Email?: string;
  Website?: string;
  GSTIN?: string;
  Status: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface CompanyInput {
  companyCode: string;
  companyName: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  gstin?: string;
}

export const companyService = {
  getAll: () => api.get<Company[]>('/companies'),
  getById: (id: number) => api.get<Company>(`/companies/${id}`),
  create: (data: CompanyInput) => api.post('/companies', data),
  update: (id: number, data: CompanyInput) => api.put(`/companies/${id}`, data),
  delete: (id: number) => api.delete(`/companies/${id}`),
};
