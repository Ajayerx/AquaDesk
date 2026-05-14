import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import api from '../services/api';

interface NotificationData {
  pendingTasks: number;
  expiringContracts: number;
  openComplaints: number;
}

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationData | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadNotifications = async () => {
    try {
      const [statsRes, contractsRes, complaintsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/reports/contract-renewal', { params: { days: 30 } }),
        api.get('/admin/complaints-management', { params: { status: 'Open' } })
      ]);
      setData({
        pendingTasks: statsRes.data.pendingTasks + statsRes.data.todayTasks.pending,
        expiringContracts: contractsRes.data.length || 0,
        openComplaints: complaintsRes.data.length || 0
      });
    } catch {
      // silently fail
    }
  };

  const total = data ? data.pendingTasks + data.expiringContracts + data.openComplaints : 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {total > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {total > 9 ? '9+' : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
              <span className="text-sm text-gray-700">Tasks pending today</span>
              <span className="text-sm font-semibold text-yellow-700">{data?.pendingTasks || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
              <span className="text-sm text-gray-700">Contracts expiring in 30 days</span>
              <span className="text-sm font-semibold text-orange-700">{data?.expiringContracts || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
              <span className="text-sm text-gray-700">Open complaints</span>
              <span className="text-sm font-semibold text-red-700">{data?.openComplaints || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
