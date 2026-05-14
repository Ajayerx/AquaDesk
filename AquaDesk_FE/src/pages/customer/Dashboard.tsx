import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Calendar, FileText, AlertTriangle, ArrowRight, Droplets } from 'lucide-react';

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.customerId) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [detailsRes, scheduleRes] = await Promise.all([
        api.get(`/customers/${user!.customerId}/details`),
        api.get(`/customer-portal/customers/${user!.customerId}/schedule/upcoming`),
      ]);
      setData(detailsRes.data);
      setSchedule(scheduleRes.data);
    } catch (err) {
      console.error('Failed to load customer data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600" />
      </div>
    );
  }

  const customer = data?.customer;
  const summary = data?.summary;
  const nextVisit = schedule?.[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Droplets className="w-8 h-8 text-cyan-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {customer?.CustomerName || user?.fullName}!</h1>
          <p className="text-gray-600">Here's an overview of your account</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {nextVisit ? (
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-cyan-500">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-cyan-600" />
              <h3 className="font-semibold text-gray-900">Next Visit</h3>
            </div>
            <p className="text-sm text-gray-600">{new Date(nextVisit.ScheduleDate).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">{nextVisit.ServiceTime ? nextVisit.ServiceTime.substring(0, 5) : 'Time TBD'}</p>
            <p className="text-xs text-gray-500 mt-1">{nextVisit.CategoryName}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-gray-300">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Next Visit</h3>
            </div>
            <p className="text-sm text-gray-500">No upcoming visits scheduled</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Active Contracts</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary?.activeContracts || 0}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Open Complaints</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary?.openComplaints || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/customer/schedule')}
          className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-cyan-600" />
            <span className="font-medium text-gray-900">My Schedule</span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </button>
        <button
          onClick={() => navigate('/customer/contracts')}
          className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-900">My Contracts</span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </button>
        <button
          onClick={() => navigate('/customer/complaints')}
          className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-gray-900">Complaints</span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default CustomerDashboard;
