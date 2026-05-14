import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import { AlertTriangle, Plus, X } from 'lucide-react';

const CustomerComplaints: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.customerId) return;
    loadComplaints();
  }, [user]);

  const loadComplaints = async () => {
    try {
      const res = await api.get(`/customer-portal/customers/${user!.customerId}/complaints`);
      setComplaints(res.data);
    } catch {
      showToast('error', 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/customer-portal/customers/${user!.customerId}/complaints`, { description });
      showToast('success', 'Complaint created successfully');
      setDescription('');
      setShowForm(false);
      loadComplaints();
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Failed to create complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Open: 'bg-orange-100 text-orange-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      Resolved: 'bg-green-100 text-green-800',
      Closed: 'bg-gray-100 text-gray-800',
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
          <p className="text-gray-600">Submit and track your complaints</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'New Complaint'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                placeholder="Describe your issue..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !description.trim()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>
      )}

      {complaints.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No complaints yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c: any) => (
            <div key={c.ComplaintID} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-500">
                    {new Date(c.ComplaintDate).toLocaleDateString()}
                  </p>
                </div>
                {statusBadge(c.Status)}
              </div>
              <p className="text-gray-900 mt-2">{c.Description}</p>
              {c.Resolution && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Resolution:</p>
                  <p className="text-sm text-green-700">{c.Resolution}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerComplaints;
