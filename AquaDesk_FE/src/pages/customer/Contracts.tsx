import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { FileText } from 'lucide-react';

const CustomerContracts: React.FC = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.customerId) return;
    loadContracts();
  }, [user]);

  const loadContracts = async () => {
    try {
      const res = await api.get(`/customers/${user!.customerId}/details`);
      setContracts(res.data.contracts || []);
    } catch {
      console.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const isExpiringSoon = (endDate: string) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 60 && diff > 0;
  };

  const statusBadge = (status: boolean, endDate: string) => {
    if (!status) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Inactive</span>;
    }
    if (isExpiringSoon(endDate)) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Expiring Soon</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>;
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
        <h1 className="text-2xl font-bold text-gray-900">My Contracts</h1>
        <p className="text-gray-600">View your service contracts</p>
      </div>

      {contracts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No contracts found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">System</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contracts.map((c: any) => (
                <tr key={c.ContractID} className={`hover:bg-gray-50 ${isExpiringSoon(c.EndDate) ? 'bg-yellow-50' : ''}`}>
                  <td className="px-6 py-4 text-sm text-gray-900">{c.SystemName || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{c.CategoryName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.Frequency || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {c.StartDate ? new Date(c.StartDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {c.EndDate ? new Date(c.EndDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">{statusBadge(c.Status, c.EndDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerContracts;
