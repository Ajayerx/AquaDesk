import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { User, MapPin, Phone, Mail, LogOut, Key } from 'lucide-react';

const CustomerProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '' });
  const [pwSubmitting, setPwSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.customerId) return;
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const res = await api.get(`/customers/${user!.customerId}/details`);
      setCustomer(res.data.customer);
    } catch {
      showToast('error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwData.currentPassword || !pwData.newPassword) return;
    if (pwData.newPassword.length < 6) {
      showToast('error', 'New password must be at least 6 characters');
      return;
    }
    setPwSubmitting(true);
    try {
      await api.post('/auth/change-password', pwData);
      showToast('success', 'Password changed successfully');
      setShowPasswordForm(false);
      setPwData({ currentPassword: '', newPassword: '' });
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Failed to change password');
    } finally {
      setPwSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-cyan-600" />
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium text-gray-900">{customer?.CustomerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Customer Code</p>
              <p className="font-medium text-gray-900">{customer?.CustomerCode}</p>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-900">
                  {[customer?.Flat, customer?.Block, customer?.Road, customer?.City, customer?.State, customer?.Country]
                    .filter(Boolean)
                    .join(', ') || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-cyan-600" />
            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Mobile</p>
                <p className="font-medium text-gray-900">{customer?.Mobile || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{customer?.Email || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-cyan-600" />
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
          </div>
        </div>
        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Change Password
          </button>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
              <input
                type="password"
                required
                value={pwData.currentPassword}
                onChange={(e) => setPwData({ ...pwData, currentPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
              <input
                type="password"
                required
                value={pwData.newPassword}
                onChange={(e) => setPwData({ ...pwData, newPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={pwSubmitting}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {pwSubmitting ? 'Saving...' : 'Update Password'}
              </button>
              <button
                type="button"
                onClick={() => { setShowPasswordForm(false); setPwData({ currentPassword: '', newPassword: '' }); }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default CustomerProfile;
