import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
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

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SalesMasterPlan[]>([]);
  const [planView, setPlanView] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPlans();
  }, [planView]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      let response;
      if (planView === 'all') {
        response = await salesMasterPlanService.getAll();
      } else {
        response = await salesMasterPlanService.getByFrequency(planView);
      }
      setPlans(response.data.slice(0, 5)); // Show only first 5
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { name: 'Total Customers', value: '156', icon: Users, color: 'bg-blue-500' },
    { name: 'Active Contracts', value: '89', icon: FileText, color: 'bg-green-500' },
    { name: 'Sales This Month', value: '23', icon: ShoppingCart, color: 'bg-purple-500' },
    { name: 'Pending Tasks', value: '12', icon: Calendar, color: 'bg-orange-500' },
  ];

  const recentActivities = [
    { id: 1, action: 'New customer added', user: 'John Doe', time: '2 hours ago' },
    { id: 2, action: 'Contract renewed', user: 'Jane Smith', time: '4 hours ago' },
    { id: 3, action: 'Task completed', user: 'Bob Johnson', time: '5 hours ago' },
    { id: 4, action: 'New sales record', user: 'Alice Brown', time: '6 hours ago' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.fullName}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
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

      {/* Quick Actions */}
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

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-600">by {activity.user}</p>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sales Master Plans */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Sales Master Plans</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setPlanView('all')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                planView === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPlanView('weekly')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                planView === 'weekly' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPlanView('monthly')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                planView === 'monthly' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : plans.length === 0 ? (
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

      {/* Task Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Tasks</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Pending</p>
                <p className="text-sm text-gray-600">5 tasks need confirmation</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">In Progress</p>
                <p className="text-sm text-gray-600">3 tasks being serviced</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Completed</p>
                <p className="text-sm text-gray-600">8 tasks finished today</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h2>
          <div className="flex items-center gap-4 mb-4">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">$45,231</p>
              <p className="text-sm text-green-600">+12.5% from last month</p>
            </div>
          </div>
          <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
            Chart placeholder
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
