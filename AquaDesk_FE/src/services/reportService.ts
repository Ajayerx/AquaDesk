import api from './api';

export const reportService = {
  getDaywiseTask: (taskDate: string) =>
    api.get('/reports/daywise-task', { params: { taskDate } }),
  getAreawiseTask: (params: { startDate: string; endDate: string; areaCode?: string }) =>
    api.get('/reports/areawise-task', { params }),
  getItemRequired: (params: { startDate: string; endDate: string; itemId?: number }) =>
    api.get('/reports/item-required', { params }),
  getContractRenewal: (days?: number) =>
    api.get('/reports/contract-renewal', { params: { days } }),
};
