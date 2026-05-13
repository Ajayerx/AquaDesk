import api from './api';

export interface Contract {
  ContractID: number;
  CustomerID: number;
  CustomerSystemID?: number;
  CategoryID: number;
  ContractPeriod?: number;
  Frequency?: number;
  StartDate: string;
  EndDate?: string;
  Status: boolean;
  Notes?: string;
  CustomerName?: string;
  CustomerCode?: string;
  SystemName?: string;
  CategoryName?: string;
}

export interface ContractInput {
  customerId: number;
  customerSystemId?: number;
  categoryId: number;
  contractPeriod?: number;
  frequency?: number;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export const contractService = {
  getAll: (params?: { customerId?: number; status?: string }) =>
    api.get<Contract[]>('/contracts', { params }),
  getById: (id: number) => api.get<Contract>(`/contracts/${id}`),
  create: (data: ContractInput) => api.post('/contracts', data),
  update: (id: number, data: Partial<ContractInput>) => api.put(`/contracts/${id}`, data),
  delete: (id: number) => api.delete(`/contracts/${id}`),
  renew: (id: number, data: { newEndDate: string; newContractPeriod?: number; newFrequency?: number; notes?: string }) =>
    api.post(`/contracts/${id}/renew`, data),
};
