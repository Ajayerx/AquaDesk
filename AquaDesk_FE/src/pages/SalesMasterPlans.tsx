import React, { useState, useEffect } from 'react';
import salesMasterPlanService from '../services/salesMasterPlanService';
import type { SalesMasterPlan, SalesMasterPlanInput, PlanDetail } from '../services/salesMasterPlanService';
import { customerService } from '../services/customerService';
import { adminService } from '../services/adminService';
import {
  Plus, Edit3, Trash2, Search, FileText, ChevronDown,
  Waves, Droplets, Calendar, Clock, Package, Settings,
  ShoppingBag, Save, XCircle, Sparkles, Anchor, Wind
} from 'lucide-react';

const SalesMasterPlans: React.FC = () => {
  const [plans, setPlans] = useState<SalesMasterPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SalesMasterPlan | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'weekly' | 'monthly'>('all');
  
  // Dropdown data
  const [customers, setCustomers] = useState<any[]>([]);
  const [contractCategories, setContractCategories] = useState<any[]>([]);
  const [contractPeriods, setContractPeriods] = useState<any[]>([]);
  const [systems, setSystems] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  
  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedContractType, setSelectedContractType] = useState<any>(null);
  const [selectedContractPeriod, setSelectedContractPeriod] = useState<any>(null);
  const [contractStartingDate, setContractStartingDate] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [details, setDetails] = useState<PlanDetail[]>([]);
  const [formData, setFormData] = useState({
    planType: 'Plan',
    frequency: 'Monthly',
    notes: '',
  });

  useEffect(() => {
    loadPlans();
    loadDropdownData();
  }, [viewMode]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      let response;
      if (viewMode === 'all') {
        response = await salesMasterPlanService.getAll();
      } else {
        response = await salesMasterPlanService.getByFrequency(viewMode);
      }
      setPlans(response.data);
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      const [customersRes, contractCategoriesRes, contractPeriodsRes] = await Promise.all([
        customerService.getAll(),
        adminService.getContractCategories(),
        salesMasterPlanService.getContractPeriods(),
      ]);
      setCustomers(customersRes.data);
      setContractCategories(contractCategoriesRes.data);
      setContractPeriods(contractPeriodsRes.data);
    } catch (error) {
      console.error('Failed to load dropdown data:', error);
    }
  };

  const loadContractTypeData = async (categoryId: number) => {
    try {
      const [systemsRes, servicesRes, itemsRes] = await Promise.all([
        salesMasterPlanService.getSystemsByContractType(categoryId),
        salesMasterPlanService.getServicesByContractType(categoryId),
        salesMasterPlanService.getItemsByContractType(categoryId),
      ]);
      setSystems(systemsRes.data);
      setServices(servicesRes.data);
      setItems(itemsRes.data);
    } catch (error) {
      console.error('Failed to load contract type data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }

    const data: SalesMasterPlanInput = {
      customerInfo: { customerId: selectedCustomer.CustomerID },
      contractTypeId: selectedContractType?.CategoryID,
      contractPeriodId: selectedContractPeriod?.PeriodID,
      contractStartingDate: contractStartingDate,
      details: details.map(d => ({
        lineType: d.LineType,
        referenceId: d.ReferenceID,
        quantity: d.Quantity,
        unitCost: d.UnitCost,
        serviceTime: d.ServiceTime,
        qualityParameters: d.QualityParameters,
        notes: d.Notes,
      })),
      planType: formData.planType,
      frequency: formData.frequency,
      notes: formData.notes,
    };

    try {
      if (editingPlan) {
        await salesMasterPlanService.update(editingPlan.PlanID, data);
      } else {
        await salesMasterPlanService.create(data);
      }
      setShowModal(false);
      resetForm();
      loadPlans();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save plan');
    }
  };

  const handleEdit = async (plan: SalesMasterPlan) => {
    setEditingPlan(plan);
    setSelectedCustomer({ CustomerID: plan.CustomerID, CustomerName: plan.CustomerName });
    setSelectedContractType(plan.ContractTypeID ? { CategoryID: plan.ContractTypeID, CategoryName: plan.ContractTypeName } : null);
    setSelectedContractPeriod(plan.ContractPeriodID ? { PeriodID: plan.ContractPeriodID, PeriodName: plan.ContractPeriodName } : null);
    setContractStartingDate(plan.ContractStartingDate || '');
    setFormData({
      planType: plan.PlanType,
      frequency: plan.Frequency,
      notes: plan.Notes || '',
    });
    
    // Load contract type data BEFORE setting details and showing modal
    if (plan.ContractTypeID) {
      await loadContractTypeData(plan.ContractTypeID);
    }
    
    // Use setTimeout to ensure state updates are complete before setting details
    setTimeout(() => {
      setDetails(plan.Details || []);
      setShowModal(true);
    }, 100);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      await salesMasterPlanService.delete(id);
      loadPlans();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete plan');
    }
  };

  const resetForm = () => {
    setEditingPlan(null);
    setSelectedCustomer(null);
    setSelectedContractType(null);
    setSelectedContractPeriod(null);
    setContractStartingDate('');
    setDetails([]);
    setFormData({
      planType: 'Plan',
      frequency: 'Monthly',
      notes: '',
    });
    setCustomerSearch('');
  };

  const filteredCustomers = customers.filter(c =>
    c.CustomerName?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.CustomerCode?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredPlans = plans.filter(p =>
    p.CustomerName?.toLowerCase().includes(search.toLowerCase()) ||
    p.CustomerCode?.toLowerCase().includes(search.toLowerCase())
  );

  const totalCost = details.reduce((sum, d) => sum + d.LineTotal, 0);
  const totalServiceTime = details.reduce((sum, d) => sum + (d.ServiceTime || 0) * d.Quantity, 0);

  return (
    <>
      <style>{`
        @keyframes waveMove {
          0% { transform: translateX(0) translateZ(0) scaleY(1); }
          50% { transform: translateX(-25%) translateZ(0) scaleY(0.55); }
          100% { transform: translateX(-50%) translateZ(0) scaleY(1); }
        }
        @keyframes bubbleFloat {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { transform: translateY(-10vh) scale(1); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes ripple {
          0% { transform: scale(0); opacity: 0.5; }
          100% { transform: scale(4); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(6,182,212,0.3); }
          50% { box-shadow: 0 0 20px rgba(6,182,212,0.6), 0 0 40px rgba(6,182,212,0.2); }
        }
        .bubble {
          position: absolute;
          bottom: -20px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), rgba(6,182,212,0.15));
          border: 1px solid rgba(255,255,255,0.2);
          animation: bubbleFloat linear infinite;
          pointer-events: none;
        }
        .water-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .water-btn::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        .water-btn:active::after {
          width: 300px;
          height: 300px;
        }
        .glass-card {
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.3);
        }
        .glass-modal {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255,255,255,0.4);
        }
        .ocean-input {
          background: rgba(255,255,255,0.6);
          border: 1.5px solid rgba(6,182,212,0.25);
          transition: all 0.3s ease;
        }
        .ocean-input:focus {
          border-color: rgba(6,182,212,0.6);
          box-shadow: 0 0 0 3px rgba(6,182,212,0.15), 0 0 15px rgba(6,182,212,0.1);
          background: rgba(255,255,255,0.9);
        }
        .water-checkbox {
          appearance: none;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(6,182,212,0.4);
          border-radius: 6px;
          background: rgba(255,255,255,0.5);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }
        .water-checkbox:checked {
          background: linear-gradient(135deg, #06b6d4, #0891b2);
          border-color: #0891b2;
        }
        .water-checkbox:checked::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
        .wave-divider {
          position: relative;
          height: 4px;
          border-radius: 2px;
          background: linear-gradient(90deg, #06b6d4, #0ea5e9, #38bdf8, #06b6d4);
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 25%, #0284c7 50%, #0ea5e9 75%, #38bdf8 100%)' }}>
        {/* Animated Bubbles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="bubble"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${8 + Math.random() * 30}px`,
              height: `${8 + Math.random() * 30}px`,
              animationDuration: `${8 + Math.random() * 12}s`,
              animationDelay: `${Math.random() * 8}s`,
            }}
          />
        ))}

        {/* Wave Background */}
        <div className="absolute top-0 left-0 right-0 h-32 overflow-hidden opacity-20 pointer-events-none">
          <svg viewBox="0 0 1440 320" className="w-full h-full" style={{ animation: 'waveMove 8s linear infinite' }}>
            <path fill="white" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.3), rgba(14,165,233,0.3))', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Waves className="w-8 h-8 text-white" style={{ filter: 'drop-shadow(0 0 8px rgba(6,182,212,0.5))' }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>Sales Master Plans</h1>
                <p className="text-cyan-200 flex items-center gap-1">
                  <Droplets className="w-4 h-4" />
                  Manage service plans for customers
                </p>
              </div>
            </div>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="water-btn flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)', boxShadow: '0 4px 15px rgba(6,182,212,0.4)' }}
            >
              <Plus className="w-5 h-5" />
              <Sparkles className="w-4 h-4" />
              Add Plan
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-4">
            <div className="glass-card rounded-2xl p-4 flex-1 shadow-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
                <input
                  type="text"
                  placeholder="Dive in & search plans..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ocean-input w-full pl-10 pr-4 py-2.5 rounded-xl outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>
            <div className="glass-card rounded-2xl p-3 shadow-lg">
              <div className="flex gap-2">
                {[
                  { key: 'all', label: 'All', icon: <Waves className="w-4 h-4" /> },
                  { key: 'weekly', label: 'Weekly', icon: <Wind className="w-4 h-4" /> },
                  { key: 'monthly', label: 'Monthly', icon: <Calendar className="w-4 h-4" /> },
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setViewMode(key as any)}
                    className={`water-btn flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      viewMode === key
                        ? 'text-white shadow-md'
                        : 'text-cyan-700 hover:bg-white/40'
                    }`}
                    style={viewMode === key ? { background: 'linear-gradient(135deg, #06b6d4, #0891b2)' } : {}}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="glass-card rounded-2xl p-12 text-center shadow-lg">
              <div className="flex justify-center gap-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-4 h-4 rounded-full bg-cyan-400" style={{ animation: `float 1.5s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
              <p className="text-cyan-700 mt-4 font-medium">Loading plans...</p>
            </div>
          ) : (
            <div className="glass-card rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(14,165,233,0.15))' }}>
                    {[
                      { label: 'Customer', icon: <Anchor className="w-3.5 h-3.5" /> },
                      { label: 'Code', icon: null },
                      { label: 'Type', icon: <FileText className="w-3.5 h-3.5" /> },
                      { label: 'Frequency', icon: <Clock className="w-3.5 h-3.5" /> },
                      { label: 'Systems', icon: <Settings className="w-3.5 h-3.5" /> },
                      { label: 'Services', icon: <Waves className="w-3.5 h-3.5" /> },
                      { label: 'Items', icon: <Package className="w-3.5 h-3.5" /> },
                      { label: 'Actions', icon: <Sparkles className="w-3.5 h-3.5" /> },
                    ].map(({ label, icon }) => (
                      <th key={label} className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-cyan-700 ${label === 'Actions' ? 'text-right' : 'text-left'}`}>
                        <span className="flex items-center gap-1 justify-center">
                          {icon}
                          {label}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-100/50">
                  {filteredPlans.map((plan, idx) => (
                    <tr
                      key={plan.PlanID}
                      className="hover:bg-cyan-50/30 transition-all duration-300"
                      style={{ animation: `float 3s ease-in-out ${idx * 0.1}s infinite` }}
                    >
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800">{plan.CustomerName || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{plan.CustomerCode || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full"
                          style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(14,165,233,0.15))', color: '#0e7490' }}>
                          <Droplets className="w-3 h-3" />
                          {plan.PlanType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-sm text-cyan-700 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {plan.Frequency || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold text-white"
                          style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
                          {plan.SystemsCount || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold text-white"
                          style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
                          {plan.ServicesCount || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold text-white"
                          style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}>
                          {plan.ItemsCount || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(plan)}
                            className="water-btn p-2.5 rounded-xl text-cyan-600 hover:text-white transition-all duration-300 hover:scale-110"
                            style={{ background: 'rgba(6,182,212,0.1)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #06b6d4, #0891b2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(6,182,212,0.1)'}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(plan.PlanID)}
                            className="water-btn p-2.5 rounded-xl text-red-400 hover:text-white transition-all duration-300 hover:scale-110"
                            style={{ background: 'rgba(239,68,68,0.1)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPlans.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="p-4 rounded-full mb-4" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(14,165,233,0.1))' }}>
                            <FileText className="w-12 h-12 text-cyan-400" />
                          </div>
                          <p className="text-cyan-600 font-medium text-lg">No plans found</p>
                          <p className="text-cyan-400 text-sm mt-1">Create a new plan to get started</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(12,74,110,0.6)', backdropFilter: 'blur(8px)' }}>
            {/* Modal Bubbles */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bubble"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  width: `${6 + Math.random() * 15}px`,
                  height: `${6 + Math.random() * 15}px`,
                  animationDuration: `${6 + Math.random() * 8}s`,
                  animationDelay: `${Math.random() * 4}s`,
                }}
              />
            ))}

            <div className="glass-modal rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" style={{ animation: 'float 4s ease-in-out infinite' }}>
              {/* Modal Header */}
              <div className="p-6 rounded-t-3xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0c4a6e, #0369a1, #0284c7)' }}>
                <div className="absolute inset-0 opacity-10">
                  <svg viewBox="0 0 1440 320" className="w-full h-full">
                    <path fill="white" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L0,320Z" />
                  </svg>
                </div>
                <div className="relative flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/20">
                    <Waves className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {editingPlan ? 'Edit Sales Master Plan' : 'Create New Plan'}
                  </h2>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Customer Selection */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-cyan-800 mb-2">
                    <Anchor className="w-4 h-4" />
                    Customer *
                  </label>
                  <div className="relative">
                    <div
                      onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                      className="ocean-input w-full px-4 py-2.5 rounded-xl cursor-pointer flex items-center justify-between text-gray-700"
                    >
                      {selectedCustomer ? (
                        <span className="font-medium">{selectedCustomer.CustomerName}</span>
                      ) : (
                        <span className="text-gray-400">Select a customer...</span>
                      )}
                      <ChevronDown className="w-4 h-4 text-cyan-500" />
                    </div>
                    {showCustomerDropdown && (
                      <div className="absolute z-10 w-full mt-2 glass-card rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        <input
                          type="text"
                          placeholder="Search customers..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-4 py-2.5 border-b border-cyan-100 outline-none text-gray-700 placeholder-gray-400"
                        />
                        {filteredCustomers.map((customer) => (
                          <div
                            key={customer.CustomerID}
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowCustomerDropdown(false);
                              setCustomerSearch('');
                            }}
                            className="px-4 py-2.5 hover:bg-cyan-50/50 cursor-pointer transition-colors"
                          >
                            <div className="font-medium text-gray-800">{customer.CustomerName}</div>
                            <div className="text-sm text-cyan-600">{customer.CustomerCode} • {customer.Mobile}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedCustomer && (
                    <div className="mt-2 p-3 rounded-xl text-sm" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(14,165,233,0.08))' }}>
                      <div className="grid grid-cols-2 gap-2">
                        <div><strong className="text-cyan-700">Code:</strong> <span className="text-gray-700">{selectedCustomer.CustomerCode}</span></div>
                        <div><strong className="text-cyan-700">Mobile:</strong> <span className="text-gray-700">{selectedCustomer.Mobile}</span></div>
                        <div><strong className="text-cyan-700">City:</strong> <span className="text-gray-700">{selectedCustomer.City}</span></div>
                        <div><strong className="text-cyan-700">Area:</strong> <span className="text-gray-700">{selectedCustomer.AreaCode}</span></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contract Category & Period */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-cyan-800 mb-2">
                      <Sparkles className="w-4 h-4" />
                      Contract Category *
                    </label>
                    <select
                      value={selectedContractType?.CategoryID || ''}
                      onChange={(e) => {
                        const categoryId = parseInt(e.target.value);
                        const category = contractCategories.find(c => c.CategoryID === categoryId);
                        setSelectedContractType(category || null);
                        setDetails([]);
                        if (categoryId) {
                          loadContractTypeData(categoryId);
                        } else {
                          setSystems([]);
                          setServices([]);
                          setItems([]);
                        }
                      }}
                      className="ocean-input w-full px-4 py-2.5 rounded-xl outline-none text-gray-700"
                    >
                      <option value="">Select contract category</option>
                      {contractCategories.map((cat) => (
                        <option key={cat.CategoryID} value={cat.CategoryID}>{cat.CategoryName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-cyan-800 mb-2">
                      <Clock className="w-4 h-4" />
                      Contract Period
                    </label>
                    <select
                      value={selectedContractPeriod?.PeriodID || ''}
                      onChange={(e) => {
                        const periodId = parseInt(e.target.value);
                        const period = contractPeriods.find(p => p.PeriodID === periodId);
                        setSelectedContractPeriod(period || null);
                      }}
                      className="ocean-input w-full px-4 py-2.5 rounded-xl outline-none text-gray-700"
                    >
                      <option value="">Select contract period</option>
                      {contractPeriods.map((period) => (
                        <option key={period.PeriodID} value={period.PeriodID}>{period.PeriodName} ({period.DurationMonths} months)</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Contract Starting Date */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-cyan-800 mb-2">
                    <Calendar className="w-4 h-4" />
                    Contract Starting Date *
                  </label>
                  <input
                    type="date"
                    value={contractStartingDate}
                    onChange={(e) => setContractStartingDate(e.target.value)}
                    className="ocean-input w-full px-4 py-2.5 rounded-xl outline-none text-gray-700"
                  />
                </div>

                {/* Plan Type & Frequency */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-cyan-800 mb-2">
                      <FileText className="w-4 h-4" />
                      Plan Type
                    </label>
                    <select
                      value={formData.planType}
                      onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                      className="ocean-input w-full px-4 py-2.5 rounded-xl outline-none text-gray-700"
                    >
                      <option value="Plan">Plan</option>
                      <option value="Complaint">Complaint</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-cyan-800 mb-2">
                      <Waves className="w-4 h-4" />
                      Frequency
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      className="ocean-input w-full px-4 py-2.5 rounded-xl outline-none text-gray-700"
                    >
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                {/* Unified Plan Details */}
                {selectedContractType && (
                  <>
                    <div className="wave-divider" />

                    {/* Systems */}
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-semibold text-cyan-800 mb-3">
                        <Settings className="w-4 h-4" />
                        Systems
                      </label>
                      <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(6,182,212,0.05)', border: '1.5px solid rgba(6,182,212,0.15)' }}>
                        {systems.map((system) => (
                          <div key={system.SystemID} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/50 transition-all">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={details.some(d => d.LineType === 'System' && d.ReferenceID === system.SystemID)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setDetails([...details, {
                                      DetailID: 0, PlanID: 0, LineType: 'System',
                                      ReferenceID: system.SystemID, Quantity: 1,
                                      UnitCost: system.UnitCost || 0, LineTotal: system.UnitCost || 0,
                                      Name: system.SystemName, Code: system.SystemCode,
                                    }]);
                                  } else {
                                    setDetails(details.filter(d => !(d.LineType === 'System' && d.ReferenceID === system.SystemID)));
                                  }
                                }}
                                className="water-checkbox"
                              />
                              <span className="text-gray-700 font-medium">{system.SystemName}</span>
                              <span className="text-cyan-500 text-sm">({system.SystemCode})</span>
                              <span className="text-cyan-700 font-semibold text-sm">₹{system.UnitCost || 0}</span>
                            </label>
                            {details.some(d => d.LineType === 'System' && d.ReferenceID === system.SystemID) && (
                              <input
                                type="number"
                                min="1"
                                value={details.find(d => d.LineType === 'System' && d.ReferenceID === system.SystemID)?.Quantity || 1}
                                onChange={(e) => {
                                  setDetails(details.map(d =>
                                    d.LineType === 'System' && d.ReferenceID === system.SystemID
                                      ? { ...d, Quantity: parseInt(e.target.value), LineTotal: parseInt(e.target.value) * d.UnitCost }
                                      : d
                                  ));
                                }}
                                className="ocean-input w-20 px-3 py-1.5 rounded-lg text-sm text-center outline-none"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Services */}
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-semibold text-cyan-800 mb-3">
                        <Waves className="w-4 h-4" />
                        Services
                      </label>
                      <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(14,165,233,0.05)', border: '1.5px solid rgba(14,165,233,0.15)' }}>
                        {services.map((service) => (
                          <div key={service.ServiceID} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/50 transition-all">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={details.some(d => d.LineType === 'Service' && d.ReferenceID === service.ServiceID)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setDetails([...details, {
                                      DetailID: 0, PlanID: 0, LineType: 'Service',
                                      ReferenceID: service.ServiceID, Quantity: 1,
                                      UnitCost: service.UnitCost || 0, LineTotal: service.UnitCost || 0,
                                      ServiceTime: service.ServiceTime || 0,
                                      Name: service.ServiceName, Code: service.ServiceCode,
                                    }]);
                                  } else {
                                    setDetails(details.filter(d => !(d.LineType === 'Service' && d.ReferenceID === service.ServiceID)));
                                  }
                                }}
                                className="water-checkbox"
                              />
                              <span className="text-gray-700 font-medium">{service.ServiceName}</span>
                              <span className="text-sky-500 text-sm">({service.ServiceCode})</span>
                              <span className="text-cyan-700 font-semibold text-sm">₹{service.UnitCost || 0}</span>
                              <span className="text-sky-500 text-xs flex items-center gap-0.5">
                                <Clock className="w-3 h-3" />{service.ServiceTime || 0}min
                              </span>
                            </label>
                            {details.some(d => d.LineType === 'Service' && d.ReferenceID === service.ServiceID) && (
                              <input
                                type="number"
                                min="1"
                                value={details.find(d => d.LineType === 'Service' && d.ReferenceID === service.ServiceID)?.Quantity || 1}
                                onChange={(e) => {
                                  setDetails(details.map(d =>
                                    d.LineType === 'Service' && d.ReferenceID === service.ServiceID
                                      ? { ...d, Quantity: parseInt(e.target.value), LineTotal: parseInt(e.target.value) * d.UnitCost }
                                      : d
                                  ));
                                }}
                                className="ocean-input w-20 px-3 py-1.5 rounded-lg text-sm text-center outline-none"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-semibold text-cyan-800 mb-3">
                        <ShoppingBag className="w-4 h-4" />
                        Items
                      </label>
                      <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(56,189,248,0.05)', border: '1.5px solid rgba(56,189,248,0.15)' }}>
                        {items.map((item) => (
                          <div key={item.ItemID} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/50 transition-all">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={details.some(d => d.LineType === 'Item' && d.ReferenceID === item.ItemID)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setDetails([...details, {
                                      DetailID: 0, PlanID: 0, LineType: 'Item',
                                      ReferenceID: item.ItemID, Quantity: 1,
                                      UnitCost: item.UnitCost || 0, LineTotal: item.UnitCost || 0,
                                      Name: item.ItemName, Code: item.ItemCode, Unit: item.Unit,
                                    }]);
                                  } else {
                                    setDetails(details.filter(d => !(d.LineType === 'Item' && d.ReferenceID === item.ItemID)));
                                  }
                                }}
                                className="water-checkbox"
                              />
                              <span className="text-gray-700 font-medium">{item.ItemName}</span>
                              <span className="text-sky-400 text-sm">({item.ItemCode})</span>
                              <span className="text-gray-500 text-xs">{item.Unit}</span>
                              <span className="text-cyan-700 font-semibold text-sm">₹{item.UnitCost || 0}</span>
                            </label>
                            {details.some(d => d.LineType === 'Item' && d.ReferenceID === item.ItemID) && (
                              <input
                                type="number"
                                min="1"
                                value={details.find(d => d.LineType === 'Item' && d.ReferenceID === item.ItemID)?.Quantity || 1}
                                onChange={(e) => {
                                  setDetails(details.map(d =>
                                    d.LineType === 'Item' && d.ReferenceID === item.ItemID
                                      ? { ...d, Quantity: parseInt(e.target.value), LineTotal: parseInt(e.target.value) * d.UnitCost }
                                      : d
                                  ));
                                }}
                                className="ocean-input w-20 px-3 py-1.5 rounded-lg text-sm text-center outline-none"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cost Summary */}
                    <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(14,165,233,0.1))', border: '1.5px solid rgba(6,182,212,0.2)' }}>
                      <h3 className="flex items-center gap-2 font-bold text-cyan-800 mb-3">
                        <Droplets className="w-5 h-5" />
                        Cost Summary
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="glass-card rounded-xl p-4 text-center">
                          <p className="text-cyan-600 text-sm font-medium">Total Cost</p>
                          <p className="text-2xl font-bold mt-1" style={{ background: 'linear-gradient(135deg, #06b6d4, #0284c7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            ₹{totalCost.toFixed(2)}
                          </p>
                        </div>
                        <div className="glass-card rounded-xl p-4 text-center">
                          <p className="text-cyan-600 text-sm font-medium">Total Service Time</p>
                          <p className="text-2xl font-bold mt-1" style={{ background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {totalServiceTime} min
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Notes */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-cyan-800 mb-2">
                    <FileText className="w-4 h-4" />
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="ocean-input w-full px-4 py-2.5 rounded-xl outline-none text-gray-700 placeholder-gray-400"
                    placeholder="Add any additional notes..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="water-btn flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-cyan-700 transition-all duration-300 hover:scale-105"
                    style={{ background: 'rgba(6,182,212,0.1)', border: '1.5px solid rgba(6,182,212,0.3)' }}
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="water-btn flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)', boxShadow: '0 4px 15px rgba(6,182,212,0.4)' }}
                  >
                    <Save className="w-4 h-4" />
                    <Sparkles className="w-3.5 h-3.5" />
                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SalesMasterPlans;
