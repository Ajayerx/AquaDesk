import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import { Calendar, Clock, User as UserIcon, Wrench } from 'lucide-react';

const CustomerSchedule: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [formData, setFormData] = useState({
    preferredDate: '',
    preferredTime: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.customerId) return;
    loadSchedule();
  }, [user]);

  const loadSchedule = async () => {
    try {
      const res = await api.get(`/customer-portal/customers/${user!.customerId}/schedule/upcoming`);
      setSchedules(res.data);
    } catch {
      showToast('error', 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = (schedule: any) => {
    setSelectedSchedule(schedule);
    setFormData({
      preferredDate: schedule.ScheduleDate?.split('T')[0] || '',
      preferredTime: schedule.ServiceTime?.substring(0, 5) || '',
      reason: '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule || !formData.preferredDate) return;
    setSubmitting(true);
    try {
      await api.post(`/customer-portal/customers/${user!.customerId}/schedule-requests`, {
        scheduleId: selectedSchedule.ScheduleID,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime || undefined,
        reason: formData.reason || undefined,
      });
      showToast('success', 'Schedule request submitted successfully');
      setShowModal(false);
      setSelectedSchedule(null);
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Confirmed: 'bg-blue-100 text-blue-800',
      Completed: 'bg-green-100 text-green-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        <p className="text-gray-600">View your upcoming service visits</p>
      </div>

      {schedules.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No upcoming visits scheduled</p>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((sched) => (
            <div key={sched.ScheduleID} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan-600" />
                    <span className="font-semibold text-gray-900">
                      {new Date(sched.ScheduleDate).toLocaleDateString()}
                    </span>
                    <span className="text-gray-500">•</span>
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{sched.ServiceTime ? sched.ServiceTime.substring(0, 5) : 'TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{sched.CategoryName}</span>
                  </div>
                  {sched.EngineerName && (
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{sched.EngineerName}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {statusBadge(sched.ServiceStatus)}
                  {sched.ServiceStatus !== 'Completed' && (
                    <button
                      onClick={() => handleRequest(sched)}
                      className="text-sm text-cyan-600 hover:text-cyan-800 font-medium"
                    >
                      Request Earlier Visit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Request Earlier Visit</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date *</label>
                <input
                  type="date"
                  required
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                <input
                  type="time"
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setSelectedSchedule(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSchedule;
