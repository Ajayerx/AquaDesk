import api from './api';

export interface Customer {
  CustomerID: number;
  CustomerCode: string;
  CustomerName: string;
  Flat?: string;
  Block?: string;
  Road?: string;
  City?: string;
  State?: string;
  Country?: string;
  Mobile?: string;
  Email?: string;
  Telephone?: string;
  Fax?: string;
  AreaCodeID?: number;
  CompanyID: number;
  Status: boolean;
  Description?: string;
  AreaCode?: string;
  AreaDescription?: string;
  systems?: any[];
  contracts?: any[];
  sales?: any[];
  complaints?: any[];
}

export interface CustomerInput {
  customerCode: string;
  customerName: string;
  flat?: string;
  block?: string;
  road?: string;
  city?: string;
  state?: string;
  country?: string;
  mobile?: string;
  email?: string;
  telephone?: string;
  fax?: string;
  areaCodeId?: number;
  description?: string;
  status?: boolean;
}

export const customerService = {
  getAll: (params?: { search?: string; areaCode?: string }) =>
    api.get<Customer[]>('/customers', { params }),
  getById: (id: number) => api.get<Customer>(`/customers/${id}`),
  getDetails: (id: number) => api.get<Customer>(`/customers/${id}`),
  create: (data: CustomerInput) => api.post('/customers', data),
  update: (id: number, data: CustomerInput) => api.put(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`),
  addSystem: (customerId: number, data: any) =>
    api.post(`/customers/${customerId}/systems`, data),
  addContract: (customerId: number, data: any) =>
    api.post(`/customers/${customerId}/contracts`, data),
};