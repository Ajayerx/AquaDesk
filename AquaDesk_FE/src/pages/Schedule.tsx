import React, { useState, useEffect } from 'react';
import { scheduleService } from '../services/scheduleService';
import type { Schedule } from '../services/scheduleService';
import { Calendar, CheckCircle, AlertCircle, User, Check, FileText } from 'lucide-react';

const SchedulePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'week' | 'upcoming' | 'confirmed' | 'completed'>('week');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadSchedules();
  }, [activeTab, selectedDate]);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      let response;
      switch (activeTab) {
        case 'week':
          response = await scheduleService.getWeekView(selectedDate);
          break;
        case 'upcoming':
          response = await scheduleService.getUpcoming();
          break;
        case 'confirmed':
          response = await scheduleService.getConfirmed(selectedDate);
          break;
        case 'completed':
          response = await scheduleService.getCompleted();
          break;
      }
      setSchedules(response?.data || []);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: number) => {
    try {
      await scheduleService.confirm(id, {});
      loadSchedules();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to confirm schedule');
    }
  };

  const handleMarkCompleted = async (id: number) => {
    try {
      await scheduleService.markCompleted([id]);
      loadSchedules();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to mark as completed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-600">Manage service schedules</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'week' as const, label: 'Week View', icon: Calendar },
              { id: 'upcoming' as const, label: 'Upcoming', icon: AlertCircle },
              { id: 'confirmed' as const, label: 'Confirmed', icon: CheckCircle },
              { id: 'completed' as const, label: 'Completed', icon: Check },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No schedules found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div
                  key={schedule.ScheduleID}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            schedule.ServiceStatus
                          )}`}
                        >
                          {schedule.ServiceStatus}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(schedule.ScheduleDate).toLocaleDateString()}
                        </span>
                        {schedule.ServiceTime && (
                          <span className="text-sm text-gray-500">{schedule.ServiceTime}</span>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">
                        {schedule.CustomerName || 'Unknown Customer'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {schedule.CustomerCode} • {schedule.AreaCode}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {schedule.EngineerName && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {schedule.EngineerName}
                          </div>
                        )}
                        {schedule.CategoryName && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {schedule.CategoryName}
                          </div>
                        )}
                      </div>
                      {schedule.Notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">{schedule.Notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {schedule.ServiceStatus === 'Pending' && (
                        <button
                          onClick={() => handleConfirm(schedule.ScheduleID)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                      {schedule.ServiceStatus === 'Confirmed' && (
                        <button
                          onClick={() => handleMarkCompleted(schedule.ScheduleID)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
