import api from './api';

export interface Schedule {
  ScheduleID: number;
  SalesNo: number;
  ScheduleDate: string;
  ServiceTime?: string;
  ServiceStatus: 'Pending' | 'Confirmed' | 'Completed';
  EngineerID?: number;
  Notes?: string;
  PlanType?: string;
  TotalAmount?: number;
  CustomerName?: string;
  CustomerCode?: string;
  Mobile?: string;
  AreaCode?: string;
  CategoryName?: string;
  EngineerName?: string;
}

export const scheduleService = {
  getWeekView: (startDate?: string) =>
    api.get('/schedule/week-view', { params: { startDate } }),
  getUpcoming: () => api.get('/schedule/upcoming'),
  getConfirmed: (date?: string) =>
    api.get('/schedule/confirmed', { params: { date } }),
  getCompleted: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/schedule/completed', { params }),
  getManual: (date: string) => api.get('/schedule/manual', { params: { date } }),
  getById: (id: number) => api.get(`/schedule/${id}`),
  confirm: (id: number, data: { engineerId?: number; serviceTime?: string; notes?: string }) =>
    api.post(`/schedule/${id}/confirm`, data),
  reschedule: (id: number, data: { scheduleDate: string; serviceInterval?: number; notes?: string }) =>
    api.post(`/schedule/${id}/reschedule`, data),
  markCompleted: (scheduleIds: number[]) =>
    api.post('/schedule/mark-completed', { scheduleIds }),
  insertManual: (data: { salesNo: number; scheduleDate: string; serviceTime?: string }) =>
    api.post('/schedule/manual-insert', data),
};
