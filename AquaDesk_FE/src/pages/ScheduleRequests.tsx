import React, { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';
import api from '../services/api';
import { RefreshCw, Calendar, CheckCircle, XCircle } from 'lucide-react';

const ScheduleRequestsPage: React.FC = () => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/schedule-requests');
      setRequests(res.data);
    } catch {
      showToast('error', 'Failed to load schedule requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, status: 'Approved' | 'Rejected') => {
    if (status === 'Rejected' && !confirm('Reject this schedule request?')) return;
    if (status === 'Approved' && !confirm('Approve this schedule request? This will reschedule the task.')) return;
    setProcessing(id);
    try {
      await api.put(`/admin/schedule-requests/${id}`, { status });
      showToast('success', `Schedule request ${status.toLowerCase()} successfully`);
      loadRequests();
    } catch (err: any) {
      showToast('error', err.response?.data?.error || `Failed to ${status.toLowerCase()} request`);
    } finally {
      setProcessing(null);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule Requests</h1>
          <p className="text-gray-600">Manage customer schedule change requests</p>
        </div>
        <button
          onClick={loadRequests}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No schedule requests found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Original Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preferred</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((r: any) => (
                <tr key={r.RequestID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{r.CustomerName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {r.ScheduleDate ? new Date(r.ScheduleDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {r.PreferredDate ? new Date(r.PreferredDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.PreferredTime || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-[150px] truncate">{r.Reason || '-'}</td>
                  <td className="px-6 py-4">{statusBadge(r.Status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(r.CreatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {r.Status === 'Pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAction(r.RequestID, 'Approved')}
                          disabled={processing === r.RequestID}
                          className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(r.RequestID, 'Rejected')}
                          disabled={processing === r.RequestID}
                          className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScheduleRequestsPage;
