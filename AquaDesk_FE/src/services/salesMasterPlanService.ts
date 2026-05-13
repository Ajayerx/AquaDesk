import api from './api';

export interface SalesMasterPlan {
  PlanID: number;
  CustomerID: number;
  ContractTypeID?: number;
  ContractPeriodID?: number;
  ContractStartingDate?: string;
  PlanType: string;
  Frequency: string;
  Notes: string;
  CreatedBy: number;
  UpdatedBy: number;
  Status: boolean;
  CreatedAt: string;
  UpdatedAt: string;
  CustomerCode?: string;
  CustomerName?: string;
  Mobile?: string;
  City?: string;
  AreaCode?: string;
  ContractTypeName?: string;
  ContractTypeCode?: string;
  ContractPeriodName?: string;
  DurationMonths?: number;
  Details?: PlanDetail[];
  Systems?: PlanDetail[];
  Services?: PlanDetail[];
  Items?: PlanDetail[];
  TotalCost?: number;
  TotalServiceTime?: number;
  SystemsCount?: number;
  ServicesCount?: number;
  ItemsCount?: number;
}

export interface PlanDetail {
  DetailID: number;
  PlanID: number;
  LineType: 'System' | 'Service' | 'Item';
  ReferenceID: number;
  Quantity: number;
  UnitCost: number;
  LineTotal: number;
  ServiceTime?: number;
  QualityParameters?: string;
  Notes?: string;
  Name?: string;
  Code?: string;
  Unit?: string;
}

export interface PlanDetailInput {
  lineType: 'System' | 'Service' | 'Item';
  referenceId: number;
  quantity?: number;
  unitCost?: number;
  serviceTime?: number;
  qualityParameters?: string;
  notes?: string;
}

export interface SalesMasterPlanInput {
  customerInfo: {
    customerId: number;
  };
  contractTypeId?: number;
  contractPeriodId?: number;
  contractStartingDate?: string;
  details: PlanDetailInput[];
  planType: string;
  frequency: string;
  notes: string;
}

const salesMasterPlanService = {
  getAll: () => api.get('/sales-master-plans'),
  getById: (id: number) => api.get(`/sales-master-plans/${id}`),
  getByFrequency: (frequency: string) => api.get(`/sales-master-plans/frequency/${frequency}`),
  create: (data: SalesMasterPlanInput) => api.post('/sales-master-plans', data),
  update: (id: number, data: SalesMasterPlanInput) => api.put(`/sales-master-plans/${id}`, data),
  delete: (id: number) => api.delete(`/sales-master-plans/${id}`),
  // Contract type filtering
  getSystemsByContractType: (categoryId: number) => api.get(`/admin/contract-type/${categoryId}/systems`),
  getServicesByContractType: (categoryId: number) => api.get(`/admin/contract-type/${categoryId}/services`),
  getItemsByContractType: (categoryId: number) => api.get(`/admin/contract-type/${categoryId}/items`),
  // Contract periods
  getContractPeriods: () => api.get('/admin/contract-periods')
};

export default salesMasterPlanService;
