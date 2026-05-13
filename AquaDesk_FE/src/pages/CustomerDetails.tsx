import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { adminService } from '../services/adminService';
import {
  ArrowLeft, User, Cpu, FileText, DollarSign, AlertTriangle, Plus,
  XCircle, Save, Droplets, Waves, Sparkles, Settings, Phone, Mail,
  MapPin, CheckCircle2
} from 'lucide-react';

const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSystemModal, setShowSystemModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [systemForm, setSystemForm] = useState<any>({});
  const [contractForm, setContractForm] = useState<any>({});
  const [dropdowns, setDropdowns] = useState<any>({});

  useEffect(() => {
    loadDetails();
    loadDropdowns();
  }, [id]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const res = await customerService.getDetails(Number(id));
      setDetails(res.data);
    } catch (error) {
      console.error('Failed to load customer details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDropdowns = async () => {
    try {
      const [systemsRes, categoriesRes, customerSystemsRes] = await Promise.all([
        adminService.getSystems().catch(() => ({ data: [] })),
        adminService.getContractCategories().catch(() => ({ data: [] })),
        customerService.getById(Number(id)).catch(() => ({ data: { systems: [] } })),
      ]);
      setDropdowns({
        systems: systemsRes.data || [],
        categories: categoriesRes.data || [],
        customerSystems: (customerSystemsRes.data as any)?.systems || [],
      });
    } catch (error) {
      console.error('Failed to load dropdowns:', error);
    }
  };

  const handleAddSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await customerService.addSystem(Number(id), systemForm);
      setShowSystemModal(false);
      setSystemForm({});
      loadDetails();
      loadDropdowns();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to add system');
    }
  };

  const handleAddContract = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await customerService.addContract(Number(id), contractForm);
      setShowContractModal(false);
      setContractForm({});
      loadDetails();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to add contract');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0c4a6e, #0284c7, #38bdf8)' }}>
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-4 h-4 rounded-full bg-white" style={{ animation: `float 1.5s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
        <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
      </div>
    );
  }

  if (!details) return <div className="p-8 text-center text-white">Customer not found</div>;

  // ── Model mapping ────────────────────────────────────────────────────────────
  // The API returns a flat object where the root IS the customer.
  // Nested arrays are: systems, contracts, sales (mapped to transactions), complaints.
  const customer = details;
  const systems: any[]      = details.systems    ?? [];
  const contracts: any[]    = details.contracts  ?? [];
  const transactions: any[] = details.sales      ?? [];   // API key is "sales"
  const complaints: any[]   = details.complaints ?? [];   // may be absent

  const summary = {
    systemCount:      systems.length,
    activeContracts:  contracts.filter((c: any) => c.Status).length,
    totalSpent:       transactions
                        .reduce((sum: number, t: any) => sum + (Number(t.TotalAmount) || 0), 0)
                        .toFixed(3),
    openComplaints:   complaints.filter((c: any) =>
                        c.Status?.toLowerCase() === 'open'
                      ).length,
  };
  // ────────────────────────────────────────────────────────────────────────────

  const statusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':       return 'bg-red-100 text-red-700';
      case 'in progress':return 'bg-yellow-100 text-yellow-700';
      case 'resolved':
      case 'completed':  return 'bg-green-100 text-green-700';
      case 'closed':     return 'bg-gray-100 text-gray-700';
      case 'pending':    return 'bg-blue-100 text-blue-700';
      default:           return 'bg-cyan-100 text-cyan-700';
    }
  };

  return (
    <>
      <style>{`
        @keyframes bubbleFloat {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 0.5; }
          100% { transform: translateY(-10vh) scale(1); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .bubble { position:absolute; bottom:-20px; border-radius:50%; background:radial-gradient(circle at 30% 30%,rgba(255,255,255,0.4),rgba(6,182,212,0.15)); border:1px solid rgba(255,255,255,0.2); animation:bubbleFloat linear infinite; pointer-events:none; }
        .glass-card { background:rgba(255,255,255,0.75); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.3); }
        .glass-modal { background:rgba(255,255,255,0.9); backdrop-filter:blur(30px); -webkit-backdrop-filter:blur(30px); border:1px solid rgba(255,255,255,0.4); }
        .ocean-input { background:rgba(255,255,255,0.6); border:1.5px solid rgba(6,182,212,0.25); transition:all 0.3s ease; }
        .ocean-input:focus { border-color:rgba(6,182,212,0.6); box-shadow:0 0 0 3px rgba(6,182,212,0.15); background:rgba(255,255,255,0.9); outline:none; }
        .water-btn { position:relative; overflow:hidden; transition:all 0.3s ease; }
        .wave-divider { height:3px; border-radius:2px; background:linear-gradient(90deg,#06b6d4,#0ea5e9,#38bdf8,#06b6d4); background-size:200% 100%; animation:shimmer 3s linear infinite; }
      `}</style>

      <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 25%, #0284c7 50%, #0ea5e9 75%, #38bdf8 100%)' }}>
        {/* Bubbles */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bubble" style={{
            left: `${Math.random() * 100}%`, width: `${8 + Math.random() * 20}px`,
            height: `${8 + Math.random() * 20}px`, animationDuration: `${8 + Math.random() * 12}s`,
            animationDelay: `${Math.random() * 8}s`,
          }} />
        ))}

        <div className="relative z-10 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/customers')} className="water-btn p-2.5 rounded-xl text-white hover:scale-110 transition-all" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="p-3 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.3), rgba(14,165,233,0.3))', border: '1px solid rgba(255,255,255,0.2)' }}>
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{customer.CustomerName}</h1>
              <p className="text-cyan-200 flex items-center gap-1">
                <Droplets className="w-4 h-4" />
                {customer.CustomerCode} — Customer Dashboard
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Systems Installed', value: summary.systemCount,     icon: Cpu,           color: '#06b6d4' },
              { label: 'Active Contracts',  value: summary.activeContracts, icon: FileText,      color: '#10b981' },
              { label: 'Total Spent',       value: `BD ${summary.totalSpent}`, icon: DollarSign, color: '#f59e0b' },
              { label: 'Open Complaints',   value: summary.openComplaints,  icon: AlertTriangle, color: '#ef4444' },
            ].map((card, i) => (
              <div key={i} className="glass-card rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-cyan-600 uppercase tracking-wider">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: `${card.color}20` }}>
                    <card.icon className="w-6 h-6" style={{ color: card.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Customer Info Card */}
          <div className="glass-card rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-cyan-800 flex items-center gap-2 mb-4">
              <Droplets className="w-4 h-4" /> Customer Information
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-cyan-500" /><span className="text-gray-500">Mobile:</span><span className="font-medium text-gray-800">{customer.Mobile || '-'}</span></div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-cyan-500" /><span className="text-gray-500">Email:</span><span className="font-medium text-gray-800">{customer.Email || '-'}</span></div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-cyan-500" /><span className="text-gray-500">City:</span><span className="font-medium text-gray-800">{customer.City || '-'}</span></div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-cyan-500" /><span className="text-gray-500">Telephone:</span><span className="font-medium text-gray-800">{customer.Telephone || '-'}</span></div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-cyan-500" /><span className="text-gray-500">Area:</span><span className="font-medium text-gray-800">{customer.AreaCode || '-'}</span></div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-cyan-500" /><span className="text-gray-500">Address:</span><span className="font-medium text-gray-800">{[customer.Flat, customer.Block, customer.Road].filter(Boolean).join(', ') || '-'}</span></div>
              <div className="flex items-center gap-2"><Settings className="w-4 h-4 text-cyan-500" /><span className="text-gray-500">Status:</span><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${customer.Status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{customer.Status ? 'Active' : 'Inactive'}</span></div>
            </div>
          </div>

          {/* Two-column layout: Systems + Contracts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Installed Systems */}
            <div className="glass-card rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(14,165,233,0.1))' }}>
                <h2 className="text-lg font-bold text-cyan-800 flex items-center gap-2"><Cpu className="w-5 h-5" /> Installed Systems</h2>
                <button onClick={() => setShowSystemModal(true)} className="water-btn flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-cyan-100">
                      <th className="px-4 py-3 text-left text-xs font-bold text-cyan-600 uppercase">System</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-cyan-600 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-cyan-600 uppercase">Serial</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-cyan-600 uppercase">Installed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyan-50">
                    {systems.map((s: any) => (
                      <tr key={s.CustomerSystemID} className="hover:bg-cyan-50/30">
                        <td className="px-4 py-2.5 font-medium text-gray-800">{s.SystemName}</td>
                        <td className="px-4 py-2.5 text-gray-600">{s.SystemType || '-'}</td>
                        <td className="px-4 py-2.5 text-gray-600">{s.SerialNumber || '-'}</td>
                        <td className="px-4 py-2.5 text-gray-600">{s.InstallDate ? new Date(s.InstallDate).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                    {systems.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-cyan-400"><Waves className="w-8 h-8 mx-auto mb-2" />No systems installed</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Service Contracts */}
            <div className="glass-card rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(14,165,233,0.1))' }}>
                <h2 className="text-lg font-bold text-cyan-800 flex items-center gap-2"><FileText className="w-5 h-5" /> Service Contracts</h2>
                <button onClick={() => setShowContractModal(true)} className="water-btn flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-cyan-100">
                      <th className="px-4 py-3 text-left text-xs font-bold text-cyan-600 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-cyan-600 uppercase">Period</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-cyan-600 uppercase">Start</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-cyan-600 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyan-50">
                    {contracts.map((c: any) => (
                      <tr key={c.ContractID} className="hover:bg-cyan-50/30">
                        <td className="px-4 py-2.5 font-medium text-gray-800">{c.CategoryName}</td>
                        <td className="px-4 py-2.5 text-gray-600">{c.ContractPeriod ? `${c.ContractPeriod} mo` : '-'}</td>
                        <td className="px-4 py-2.5 text-gray-600">{c.StartDate ? new Date(c.StartDate).toLocaleDateString() : '-'}</td>
                        <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.Status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.Status ? 'Active' : 'Inactive'}</span></td>
                      </tr>
                    ))}
                    {contracts.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-cyan-400"><Waves className="w-8 h-8 mx-auto mb-2" />No contracts</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Two-column: Transactions + Complaints */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Transactions — mapped from API "sales" array */}
            <div className="glass-card rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(14,165,233,0.1))' }}>
                <h2 className="text-lg font-bold text-cyan-800 flex items-center gap-2"><DollarSign className="w-5 h-5" /> Payment Transactions</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-cyan-100">
                      <th className="px-4 py-3 text-left text-xs font-bold text-cyan-600 uppercase">Sales #</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-cyan-600 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-cyan-600 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-cyan-600 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-cyan-600 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyan-50">
                    {transactions.map((t: any) => (
                      <tr key={t.SalesNo} className="hover:bg-cyan-50/30">
                        <td className="px-4 py-2.5 font-medium text-gray-800">#{t.SalesNo}</td>
                        <td className="px-4 py-2.5 text-gray-600">{t.SalesDate ? new Date(t.SalesDate).toLocaleDateString() : '-'}</td>
                        <td className="px-4 py-2.5 text-gray-600">{t.CategoryName}</td>
                        <td className="px-4 py-2.5 font-semibold text-gray-800">BD {t.TotalAmount || 0}</td>
                        <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${t.Status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t.Status ? 'Active' : 'Inactive'}</span></td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-cyan-400"><Waves className="w-8 h-8 mx-auto mb-2" />No transactions</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Complaints */}
            <div className="glass-card rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(14,165,233,0.1))' }}>
                <h2 className="text-lg font-bold text-cyan-800 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Complaints</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-cyan-100">
                      <th className="px-4 py-3 text-left text-xs font-bold text-cyan-600 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-cyan-600 uppercase">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-cyan-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-cyan-600 uppercase">Resolution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyan-50">
                    {complaints.map((c: any) => (
                      <tr key={c.ComplaintID} className="hover:bg-cyan-50/30">
                        <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{c.ComplaintDate ? new Date(c.ComplaintDate).toLocaleDateString() : '-'}</td>
                        <td className="px-4 py-2.5 text-gray-800 max-w-[200px] truncate">{c.Description || '-'}</td>
                        <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(c.Status)}`}>{c.Status}</span></td>
                        <td className="px-4 py-2.5 text-gray-600 max-w-[150px] truncate">{c.Resolution || '-'}</td>
                      </tr>
                    ))}
                    {complaints.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-cyan-400"><CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />No complaints</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Add System Modal */}
        {showSystemModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(12,74,110,0.6)', backdropFilter: 'blur(8px)' }}>
            <div className="glass-modal rounded-3xl shadow-2xl w-full max-w-md">
              <div className="p-5 rounded-t-3xl" style={{ background: 'linear-gradient(135deg, #0c4a6e, #0369a1, #0284c7)' }}>
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Cpu className="w-5 h-5" /> Add Installed System</h2>
              </div>
              <form onSubmit={handleAddSystem} className="p-6 space-y-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-cyan-800 mb-1.5"><Droplets className="w-3 h-3" /> System *</label>
                  <select required value={systemForm.systemId || ''} onChange={e => setSystemForm({ ...systemForm, systemId: parseInt(e.target.value) })} className="ocean-input w-full px-4 py-2.5 rounded-xl text-gray-700">
                    <option value="">Select system...</option>
                    {dropdowns.systems?.map((s: any) => <option key={s.SystemID} value={s.SystemID}>{s.SystemName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-cyan-800 mb-1.5"><Droplets className="w-3 h-3" /> System Type</label>
                  <input type="text" value={systemForm.systemType || ''} onChange={e => setSystemForm({ ...systemForm, systemType: e.target.value })} className="ocean-input w-full px-4 py-2.5 rounded-xl text-gray-700" placeholder="e.g. Fire Alarm" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-cyan-800 mb-1.5"><Droplets className="w-3 h-3" /> Serial Number</label>
                  <input type="text" value={systemForm.serialNumber || ''} onChange={e => setSystemForm({ ...systemForm, serialNumber: e.target.value })} className="ocean-input w-full px-4 py-2.5 rounded-xl text-gray-700" placeholder="Enter serial number..." />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-cyan-800 mb-1.5"><Droplets className="w-3 h-3" /> Install Date</label>
                  <input type="date" value={systemForm.installDate || ''} onChange={e => setSystemForm({ ...systemForm, installDate: e.target.value })} className="ocean-input w-full px-4 py-2.5 rounded-xl text-gray-700" />
                </div>
                <div className="wave-divider mt-4" />
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowSystemModal(false)} className="water-btn flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-cyan-700" style={{ background: 'rgba(6,182,212,0.1)', border: '1.5px solid rgba(6,182,212,0.3)' }}><XCircle className="w-4 h-4" /> Cancel</button>
                  <button type="submit" className="water-btn flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}><Save className="w-4 h-4" /> <Sparkles className="w-3.5 h-3.5" /> Add System</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Contract Modal */}
        {showContractModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(12,74,110,0.6)', backdropFilter: 'blur(8px)' }}>
            <div className="glass-modal rounded-3xl shadow-2xl w-full max-w-md">
              <div className="p-5 rounded-t-3xl" style={{ background: 'linear-gradient(135deg, #0c4a6e, #0369a1, #0284c7)' }}>
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="w-5 h-5" /> Add Service Contract</h2>
              </div>
              <form onSubmit={handleAddContract} className="p-6 space-y-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-cyan-800 mb-1.5"><Droplets className="w-3 h-3" /> Category *</label>
                  <select required value={contractForm.categoryId || ''} onChange={e => setContractForm({ ...contractForm, categoryId: parseInt(e.target.value) })} className="ocean-input w-full px-4 py-2.5 rounded-xl text-gray-700">
                    <option value="">Select category...</option>
                    {dropdowns.categories?.map((c: any) => <option key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-cyan-800 mb-1.5"><Droplets className="w-3 h-3" /> System</label>
                  <select value={contractForm.customerSystemId || ''} onChange={e => setContractForm({ ...contractForm, customerSystemId: e.target.value ? parseInt(e.target.value) : '' })} className="ocean-input w-full px-4 py-2.5 rounded-xl text-gray-700">
                    <option value="">Select system...</option>
                    {dropdowns.customerSystems?.map((s: any) => <option key={s.CustomerSystemID} value={s.CustomerSystemID}>{s.SystemName}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-cyan-800 mb-1.5"><Droplets className="w-3 h-3" /> Period (mo)</label>
                    <input type="number" value={contractForm.contractPeriod || ''} onChange={e => setContractForm({ ...contractForm, contractPeriod: e.target.value ? parseInt(e.target.value) : '' })} className="ocean-input w-full px-4 py-2.5 rounded-xl text-gray-700" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-cyan-800 mb-1.5"><Droplets className="w-3 h-3" /> Frequency (mo)</label>
                    <input type="number" value={contractForm.frequency || ''} onChange={e => setContractForm({ ...contractForm, frequency: e.target.value ? parseInt(e.target.value) : '' })} className="ocean-input w-full px-4 py-2.5 rounded-xl text-gray-700" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-cyan-800 mb-1.5"><Droplets className="w-3 h-3" /> Start Date *</label>
                    <input type="date" required value={contractForm.startDate || ''} onChange={e => setContractForm({ ...contractForm, startDate: e.target.value })} className="ocean-input w-full px-4 py-2.5 rounded-xl text-gray-700" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-cyan-800 mb-1.5"><Droplets className="w-3 h-3" /> End Date</label>
                    <input type="date" value={contractForm.endDate || ''} onChange={e => setContractForm({ ...contractForm, endDate: e.target.value })} className="ocean-input w-full px-4 py-2.5 rounded-xl text-gray-700" />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-cyan-800 mb-1.5"><Droplets className="w-3 h-3" /> Notes</label>
                  <input type="text" value={contractForm.notes || ''} onChange={e => setContractForm({ ...contractForm, notes: e.target.value })} className="ocean-input w-full px-4 py-2.5 rounded-xl text-gray-700" placeholder="Optional notes..." />
                </div>
                <div className="wave-divider mt-4" />
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowContractModal(false)} className="water-btn flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-cyan-700" style={{ background: 'rgba(6,182,212,0.1)', border: '1.5px solid rgba(6,182,212,0.3)' }}><XCircle className="w-4 h-4" /> Cancel</button>
                  <button type="submit" className="water-btn flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}><Save className="w-4 h-4" /> <Sparkles className="w-3.5 h-3.5" /> Add Contract</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CustomerDetails;