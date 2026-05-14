import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import salesMasterPlanService from '../services/salesMasterPlanService';
import type { SalesMasterPlan } from '../services/salesMasterPlanService';
import {
  Users,
  ShoppingCart,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface DashboardStats {
  totalCustomers: number;
  activeContracts: number;
  salesThisMonth: number;
  monthlyRevenue: number;
  pendingTasks: number;
  todayTasks: {
    pending: number;
    confirmed: number;
    completed: number;
  };
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [plans, setPlans] = useState<SalesMasterPlan[]>([]);
  const [planView, setPlanView] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadPlans();
  }, [planView]);

  const loadData = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      let response;
      if (planView === 'all') {
        response = await salesMasterPlanService.getAll();
      } else {
        response = await salesMasterPlanService.getByFrequency(planView);
      }
      setPlans(response.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to load plans:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={loadData} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    { name: 'Total Customers', value: stats?.totalCustomers || 0, icon: Users, color: 'bg-blue-500' },
    { name: 'Active Contracts', value: stats?.activeContracts || 0, icon: FileText, color: 'bg-green-500' },
    { name: 'Sales This Month', value: stats?.salesThisMonth || 0, icon: ShoppingCart, color: 'bg-purple-500' },
    { name: 'Pending Tasks', value: stats?.pendingTasks || 0, icon: Calendar, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.fullName}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium">Add Customer</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ShoppingCart className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium">New Sale</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium">Schedule</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium">Reports</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Tasks</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-gray-900">Pending</p>
                </div>
              </div>
              <span className="text-lg font-bold text-yellow-700">{stats?.todayTasks.pending || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Confirmed</p>
                </div>
              </div>
              <span className="text-lg font-bold text-blue-700">{stats?.todayTasks.confirmed || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Completed</p>
                </div>
              </div>
              <span className="text-lg font-bold text-green-700">{stats?.todayTasks.completed || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h2>
          <div className="flex items-center gap-4 mb-4">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ${(stats?.monthlyRevenue || 0).toLocaleString()}
              </p>
              <p className="text-sm text-green-600">Monthly Revenue</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Sales Master Plans</h2>
          <div className="flex gap-2">
            {(['all', 'weekly', 'monthly'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setPlanView(v)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  planView === v ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {plans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No plans found</div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => (
              <div key={plan.PlanID} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{plan.CustomerName || 'Unknown Customer'}</p>
                  <p className="text-sm text-gray-600">
                    {plan.CustomerCode} • {plan.Frequency} • {plan.Systems?.length || 0} Systems, {plan.Services?.length || 0} Services
                  </p>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {plan.PlanType}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
