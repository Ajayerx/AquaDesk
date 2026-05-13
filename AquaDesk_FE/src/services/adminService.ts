import api from './api';

// Engineers
export const adminService = {
  // Engineers
  getEngineers: () => api.get('/admin/engineers'),
  createEngineer: (data: { engineerName: string; phone?: string; email?: string; teamId?: number }) =>
    api.post('/admin/engineers', data),
  updateEngineer: (id: number, data: any) => api.put(`/admin/engineers/${id}`, data),
  deleteEngineer: (id: number) => api.delete(`/admin/engineers/${id}`),

  // Teams
  getTeams: () => api.get('/admin/teams'),
  createTeam: (data: { teamName: string; description?: string }) =>
    api.post('/admin/teams', data),
  updateTeam: (id: number, data: any) => api.put(`/admin/teams/${id}`, data),
  deleteTeam: (id: number) => api.delete(`/admin/teams/${id}`),

  // Systems
  getSystems: () => api.get('/admin/systems'),
  createSystem: (data: { systemCode: string; systemName: string; description?: string }) =>
    api.post('/admin/systems', data),
  updateSystem: (id: number, data: any) => api.put(`/admin/systems/${id}`, data),
  deleteSystem: (id: number) => api.delete(`/admin/systems/${id}`),

  // Services
  getServices: () => api.get('/admin/services'),
  createService: (data: { serviceCode: string; serviceName: string; description?: string }) =>
    api.post('/admin/services', data),
  updateService: (id: number, data: any) => api.put(`/admin/services/${id}`, data),
  deleteService: (id: number) => api.delete(`/admin/services/${id}`),

  // Items
  getItems: () => api.get('/admin/items'),
  createItem: (data: { itemCode: string; itemName: string; description?: string; unit?: string }) =>
    api.post('/admin/items', data),
  updateItem: (id: number, data: any) => api.put(`/admin/items/${id}`, data),
  deleteItem: (id: number) => api.delete(`/admin/items/${id}`),

  // Item Stock
  getItemStock: () => api.get('/admin/item-stock'),
  updateItemStock: (data: { itemId: number; quantity?: number; price?: number; reorderLevel?: number }) =>
    api.put('/admin/item-stock', data),

  // Area Codes
  getAreaCodes: () => api.get('/admin/area-codes'),
  createAreaCode: (data: { areaCode: string; description?: string; priority?: number }) =>
    api.post('/admin/area-codes', data),
  updateAreaCode: (id: number, data: any) => api.put(`/admin/area-codes/${id}`, data),
  deleteAreaCode: (id: number) => api.delete(`/admin/area-codes/${id}`),

  // Contract Categories
  getContractCategories: () => api.get('/admin/contract-categories'),
  createContractCategory: (data: { categoryCode: string; categoryName: string; description?: string }) =>
    api.post('/admin/contract-categories', data),
  updateContractCategory: (id: number, data: any) => api.put(`/admin/contract-categories/${id}`, data),
  deleteContractCategory: (id: number) => api.delete(`/admin/contract-categories/${id}`),

  // Contract Periods
  getContractPeriods: () => api.get('/admin/contract-periods'),
  createContractPeriod: (data: { periodName: string; durationMonths: number; description?: string }) =>
    api.post('/admin/contract-periods', data),
  updateContractPeriod: (id: number, data: any) => api.put(`/admin/contract-periods/${id}`, data),
  deleteContractPeriod: (id: number) => api.delete(`/admin/contract-periods/${id}`),

  // Contract Intervals
  getContractIntervals: () => api.get('/admin/contract-intervals'),
  createContractInterval: (data: { intervalDays: number; intervalName: string; description?: string }) =>
    api.post('/admin/contract-intervals', data),
  updateContractInterval: (id: number, data: any) => api.put(`/admin/contract-intervals/${id}`, data),
  deleteContractInterval: (id: number) => api.delete(`/admin/contract-intervals/${id}`),

  // Service Intervals
  getServiceIntervals: () => api.get('/admin/service-intervals'),
  createServiceInterval: (data: { intervalDays: number; intervalName: string; description?: string }) =>
    api.post('/admin/service-intervals', data),
  updateServiceInterval: (id: number, data: any) => api.put(`/admin/service-intervals/${id}`, data),
  deleteServiceInterval: (id: number) => api.delete(`/admin/service-intervals/${id}`),

  // Service Hours
  getServiceHours: () => api.get('/admin/service-hours'),
  createServiceHours: (data: { dayOfWeek: number; startTime: string; endTime: string }) =>
    api.post('/admin/service-hours', data),
  updateServiceHours: (id: number, data: any) => api.put(`/admin/service-hours/${id}`, data),
  deleteServiceHours: (id: number) => api.delete(`/admin/service-hours/${id}`),

  // Costs
  getServiceCost: () => api.get('/admin/service-cost'),
  createServiceCost: (data: { categoryId: number; serviceId: number; cost?: number; serviceTime?: number }) =>
    api.post('/admin/service-cost', data),
  updateServiceCost: (data: { categoryId: number; serviceId: number; cost?: number; serviceTime?: number }) =>
    api.put('/admin/service-cost', data),
  getSystemCost: () => api.get('/admin/system-cost'),
  createSystemCost: (data: { categoryId: number; systemId: number; cost?: number }) =>
    api.post('/admin/system-cost', data),
  updateSystemCost: (data: { categoryId: number; systemId: number; cost?: number }) =>
    api.put('/admin/system-cost', data),
  getItemCost: () => api.get('/admin/item-cost'),
  createItemCost: (data: { categoryId: number; itemId: number; cost?: number }) =>
    api.post('/admin/item-cost', data),
  updateItemCost: (data: { categoryId: number; itemId: number; cost?: number }) =>
    api.put('/admin/item-cost', data),

  // Holidays
  getHolidays: () => api.get('/admin/holidays'),
  createHoliday: (data: { holidayName: string; holidayDate: string; description?: string }) =>
    api.post('/admin/holidays', data),
  updateHoliday: (id: number, data: any) => api.put(`/admin/holidays/${id}`, data),
  deleteHoliday: (id: number) => api.delete(`/admin/holidays/${id}`),
};
