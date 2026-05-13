import api from './api';

export interface SalesMaster {
  SalesNo: number;
  SalesDate: string;
  CustomerID: number;
  CategoryID: number;
  ContractTypeID?: number;
  ServiceIntervalID?: number;
  ContractIntervalID?: number;
  ContractStartDate?: string;
  PlanType: 'Plan' | 'Complaint';
  Description?: string;
  Notes?: string;
  TotalAmount: number;
  TotalServiceTime: number;
  CompanyID: number;
  Status: boolean;
  CustomerName?: string;
  CustomerCode?: string;
  CategoryName?: string;
  AreaCode?: string;
}

export interface SalesMasterInput {
  customerId: number;
  categoryId: number;
  contractTypeId?: number;
  serviceIntervalId?: number;
  contractIntervalId?: number;
  contractStartDate?: string;
  planType?: 'Plan' | 'Complaint';
  description?: string;
  notes?: string;
  systems?: Array<{ systemId: number; quantity?: number; cost?: number }>;
  services?: Array<{ serviceId: number; quantity?: number; cost?: number; serviceTime?: number }>;
  items?: Array<{ itemId: number; quantity?: number; cost?: number }>;
}

export const salesService = {
  getAll: (params?: {
    filterType?: string;
    filterValue?: string;
    planType?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get<SalesMaster[]>('/sales', { params }),
  getById: (id: number) => api.get<SalesMaster>(`/sales/${id}`),
  create: (data: SalesMasterInput) => api.post('/sales', data),
  update: (id: number, data: SalesMasterInput) => api.put(`/sales/${id}`, data),
  delete: (id: number) => api.delete(`/sales/${id}`),
};
