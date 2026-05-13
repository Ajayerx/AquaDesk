import React, { useState, useEffect } from 'react';
import { contractService } from '../services/contractService';
import type { Contract, ContractInput } from '../services/contractService';
import { Plus, Edit, Trash2, Search, FileText, RefreshCw } from 'lucide-react';

const Contracts: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [renewingContract, setRenewingContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState<ContractInput>({
    customerId: 0,
    customerSystemId: undefined,
    categoryId: 0,
    contractPeriod: undefined,
    frequency: undefined,
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [renewData, setRenewData] = useState<{
    newEndDate: string;
    newContractPeriod: number | undefined;
    newFrequency: number | undefined;
    notes: string;
  }>({
    newEndDate: '',
    newContractPeriod: undefined,
    newFrequency: undefined,
    notes: '',
  });

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const response = await contractService.getAll();
      setContracts(response.data);
    } catch (error) {
      console.error('Failed to load contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingContract) {
        await contractService.update(editingContract.ContractID, formData);
      } else {
        await contractService.create(formData);
      }
      setShowModal(false);
      setEditingContract(null);
      setFormData({
        customerId: 0,
        customerSystemId: undefined,
        categoryId: 0,
        contractPeriod: undefined,
        frequency: undefined,
        startDate: '',
        endDate: '',
        notes: '',
      });
      loadContracts();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save contract');
    }
  };

  const handleRenew = async () => {
    if (!renewingContract || !renewData.newEndDate) return;
    try {
      await contractService.renew(renewingContract.ContractID, renewData);
      setShowRenewModal(false);
      setRenewingContract(null);
      setRenewData({
        newEndDate: '',
        newContractPeriod: undefined,
        newFrequency: undefined,
        notes: '',
      });
      loadContracts();
      alert('Contract renewed successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to renew contract');
    }
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setFormData({
      customerId: contract.CustomerID,
      customerSystemId: contract.CustomerSystemID,
      categoryId: contract.CategoryID,
      contractPeriod: contract.ContractPeriod,
      frequency: contract.Frequency,
      startDate: contract.StartDate,
      endDate: contract.EndDate || '',
      notes: contract.Notes,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this contract?')) return;
    try {
      await contractService.delete(id);
      loadContracts();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete contract');
    }
  };

  const filteredContracts = contracts.filter(
    (c) =>
      c.CustomerName?.toLowerCase().includes(search.toLowerCase()) ||
      c.CategoryName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
          <p className="text-gray-600">Manage service contracts</p>
        </div>
        <button
          onClick={() => {
            setEditingContract(null);
            setFormData({
              customerId: 0,
              customerSystemId: undefined,
              categoryId: 0,
              contractPeriod: undefined,
              frequency: undefined,
              startDate: '',
              endDate: '',
              notes: '',
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Contract
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search contracts..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContracts.map((contract) => (
                <tr key={contract.ContractID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{contract.CustomerName || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{contract.CategoryName || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(contract.StartDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {contract.EndDate ? new Date(contract.EndDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        contract.Status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {contract.Status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setRenewingContract(contract);
                        setRenewData({
                          newEndDate: contract.EndDate || '',
                          newContractPeriod: contract.ContractPeriod,
                          newFrequency: contract.Frequency,
                          notes: '',
                        });
                        setShowRenewModal(true);
                      }}
                      className="text-green-600 hover:text-green-800 mr-2"
                      title="Renew"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(contract)}
                      className="text-primary hover:text-primary-dark mr-2"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(contract.ContractID)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No contracts found</p>
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
                {editingContract ? 'Edit Contract' : 'Add New Contract'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Period</label>
                  <input
                    type="number"
                    value={formData.contractPeriod}
                    onChange={(e) => setFormData({ ...formData, contractPeriod: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <input
                    type="number"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
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
                  {editingContract ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRenewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Renew Contract</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600">
                Renew contract for <strong>{renewingContract?.CustomerName}</strong>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New End Date *</label>
                <input
                  type="date"
                  required
                  value={renewData.newEndDate}
                  onChange={(e) => setRenewData({ ...renewData, newEndDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Period</label>
                  <input
                    type="number"
                    value={renewData.newContractPeriod}
                    onChange={(e) => setRenewData({ ...renewData, newContractPeriod: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Frequency</label>
                  <input
                    type="number"
                    value={renewData.newFrequency}
                    onChange={(e) => setRenewData({ ...renewData, newFrequency: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={renewData.notes}
                  onChange={(e) => setRenewData({ ...renewData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowRenewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRenew}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                >
                  Renew
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contracts;
