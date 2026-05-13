import React, { useState, useEffect } from 'react';
import { salesService } from '../services/salesService';
import type { SalesMaster, SalesMasterInput } from '../services/salesService';
import { Plus, Edit, Trash2, Search, ShoppingCart } from 'lucide-react';

const Sales: React.FC = () => {
  const [sales, setSales] = useState<SalesMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSale, setEditingSale] = useState<SalesMaster | null>(null);
  const [formData, setFormData] = useState<SalesMasterInput>({
    customerId: 0,
    categoryId: 0,
    contractTypeId: undefined,
    serviceIntervalId: undefined,
    contractIntervalId: undefined,
    contractStartDate: '',
    planType: 'Plan',
    description: '',
    notes: '',
    systems: [],
    services: [],
    items: [],
  });

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const response = await salesService.getAll();
      setSales(response.data);
    } catch (error) {
      console.error('Failed to load sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSale) {
        await salesService.update(editingSale.SalesNo, formData);
      } else {
        await salesService.create(formData);
      }
      setShowModal(false);
      setEditingSale(null);
      setFormData({
        customerId: 0,
        categoryId: 0,
        contractTypeId: undefined,
        serviceIntervalId: undefined,
        contractIntervalId: undefined,
        contractStartDate: '',
        planType: 'Plan',
        description: '',
        notes: '',
        systems: [],
        services: [],
        items: [],
      });
      loadSales();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save sales record');
    }
  };

  const handleEdit = (sale: SalesMaster) => {
    setEditingSale(sale);
    setFormData({
      customerId: sale.CustomerID,
      categoryId: sale.CategoryID,
      contractTypeId: sale.ContractTypeID,
      serviceIntervalId: sale.ServiceIntervalID,
      contractIntervalId: sale.ContractIntervalID,
      contractStartDate: sale.ContractStartDate || '',
      planType: sale.PlanType,
      description: sale.Description,
      notes: sale.Notes,
      systems: [],
      services: [],
      items: [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this sales record?')) return;
    try {
      await salesService.delete(id);
      loadSales();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete sales record');
    }
  };

  const filteredSales = sales.filter(
    (s) =>
      s.CustomerName?.toLowerCase().includes(search.toLowerCase()) ||
      s.CustomerCode?.toLowerCase().includes(search.toLowerCase()) ||
      s.AreaCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-600">Manage sales records (Plans & Complaints)</p>
        </div>
        <button
          onClick={() => {
            setEditingSale(null);
            setFormData({
              customerId: 0,
              categoryId: 0,
              contractTypeId: undefined,
              serviceIntervalId: undefined,
              contractIntervalId: undefined,
              contractStartDate: '',
              planType: 'Plan',
              description: '',
              notes: '',
              systems: [],
              services: [],
              items: [],
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Sales Record
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sales..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <tr key={sale.SalesNo} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{sale.SalesNo}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{sale.CustomerName || '-'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        sale.PlanType === 'Plan'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {sale.PlanType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(sale.SalesDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">${sale.TotalAmount}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        sale.Status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {sale.Status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(sale)}
                      className="text-primary hover:text-primary-dark mr-2"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(sale.SalesNo)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No sales records found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {editingSale ? 'Edit Sales Record' : 'Add New Sales Record'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID *</label>
                  <input
                    type="number"
                    required
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category ID *</label>
                  <input
                    type="number"
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Type</label>
                <select
                  value={formData.planType}
                  onChange={(e) => setFormData({ ...formData, planType: e.target.value as 'Plan' | 'Complaint' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="Plan">Plan</option>
                  <option value="Complaint">Complaint</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type ID</label>
                  <input
                    type="number"
                    value={formData.contractTypeId}
                    onChange={(e) => setFormData({ ...formData, contractTypeId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Interval ID</label>
                  <input
                    type="number"
                    value={formData.serviceIntervalId}
                    onChange={(e) => setFormData({ ...formData, serviceIntervalId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contract Start Date</label>
                <input
                  type="date"
                  value={formData.contractStartDate}
                  onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                >
                  {editingSale ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
