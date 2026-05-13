import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import {
  Settings, Plus, Edit3, Trash2, Search, Users, Building2, Cpu, Wrench,
  Package, MapPin, FileText, Clock, DollarSign, Waves, Droplets, Sparkles,
  Save, XCircle, Calendar, Wind, Database, Palmtree
} from 'lucide-react';

type AdminTab = 'engineers' | 'teams' | 'systems' | 'services' | 'items' | 'item-stock' | 'area-codes' | 'categories' | 'contract-periods' | 'contract-intervals' | 'service-intervals' | 'service-hours' | 'service-cost' | 'system-cost' | 'item-cost' | 'holidays';

interface TabConfig {
  id: AdminTab;
  label: string;
  icon: any;
  idField: string;
  columns: { key: string; label: string; type?: string }[];
  formFields: { name: string; label: string; type: string; required?: boolean; options?: { value: string; label: string }[] }[];
}

const Admin: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('engineers');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [dropdownData, setDropdownData] = useState<any>({});

  // Sync active tab with URL
  useEffect(() => {
    const pathSegment = location.pathname.split('/admin/')[1]?.replace(/\//g, '') || 'engineers';
    if (tabs.find(t => t.id === pathSegment)) {
      setActiveTab(pathSegment as AdminTab);
    }
  }, [location.pathname]);

  const tabs: TabConfig[] = [
    {
      id: 'engineers', label: 'Engineers', icon: Users, idField: 'EngineerID',
      columns: [
        { key: 'EngineerName', label: 'Name' },
        { key: 'Phone', label: 'Phone' },
        { key: 'Email', label: 'Email' },
        { key: 'TeamName', label: 'Team' },
        { key: 'Status', label: 'Status' },
      ],
      formFields: [
        { name: 'engineerName', label: 'Engineer Name', type: 'text', required: true },
        { name: 'phone', label: 'Phone', type: 'text' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'teamId', label: 'Team', type: 'select' },
      ],
    },
    {
      id: 'teams', label: 'Teams', icon: Building2, idField: 'TeamID',
      columns: [
        { key: 'TeamName', label: 'Team Name' },
        { key: 'Description', label: 'Description' },
        { key: 'Status', label: 'Status' },
      ],
      formFields: [
        { name: 'teamName', label: 'Team Name', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'text' },
      ],
    },
    {
      id: 'systems', label: 'Systems', icon: Cpu, idField: 'SystemID',
      columns: [
        { key: 'SystemCode', label: 'Code' },
        { key: 'SystemName', label: 'Name' },
        { key: 'Description', label: 'Description' },
      ],
      formFields: [
        { name: 'systemCode', label: 'System Code', type: 'text', required: true },
        { name: 'systemName', label: 'System Name', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'text' },
      ],
    },
    {
      id: 'services', label: 'Services', icon: Wrench, idField: 'ServiceID',
      columns: [
        { key: 'ServiceCode', label: 'Code' },
        { key: 'ServiceName', label: 'Name' },
        { key: 'Description', label: 'Description' },
      ],
      formFields: [
        { name: 'serviceCode', label: 'Service Code', type: 'text', required: true },
        { name: 'serviceName', label: 'Service Name', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'text' },
      ],
    },
    {
      id: 'items', label: 'Items', icon: Package, idField: 'ItemID',
      columns: [
        { key: 'ItemCode', label: 'Code' },
        { key: 'ItemName', label: 'Name' },
        { key: 'Unit', label: 'Unit' },
        { key: 'Description', label: 'Description' },
      ],
      formFields: [
        { name: 'itemCode', label: 'Item Code', type: 'text', required: true },
        { name: 'itemName', label: 'Item Name', type: 'text', required: true },
        { name: 'unit', label: 'Unit', type: 'text' },
        { name: 'description', label: 'Description', type: 'text' },
      ],
    },
    {
      id: 'item-stock', label: 'Item Stock', icon: Database, idField: 'StockID',
      columns: [
        { key: 'ItemName', label: 'Item Name' },
        { key: 'ItemCode', label: 'Item Code' },
        { key: 'Quantity', label: 'Quantity' },
        { key: 'Price', label: 'Price (BD)' },
        { key: 'ReorderLevel', label: 'Reorder Level' },
      ],
      formFields: [
        { name: 'itemId', label: 'Item', type: 'select' },
        { name: 'quantity', label: 'Quantity', type: 'number' },
        { name: 'price', label: 'Price (BD)', type: 'number' },
        { name: 'reorderLevel', label: 'Reorder Level', type: 'number' },
      ],
    },
    {
      id: 'area-codes', label: 'Area Codes', icon: MapPin, idField: 'AreaCodeID',
      columns: [
        { key: 'AreaCode', label: 'Area Code' },
        { key: 'Description', label: 'Description' },
        { key: 'Priority', label: 'Priority' },
      ],
      formFields: [
        { name: 'areaCode', label: 'Area Code', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'text' },
        { name: 'priority', label: 'Priority', type: 'number' },
      ],
    },
    {
      id: 'categories', label: 'Categories', icon: FileText, idField: 'CategoryID',
      columns: [
        { key: 'CategoryCode', label: 'Code' },
        { key: 'CategoryName', label: 'Name' },
        { key: 'Description', label: 'Description' },
      ],
      formFields: [
        { name: 'categoryCode', label: 'Category Code', type: 'text', required: true },
        { name: 'categoryName', label: 'Category Name', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'text' },
      ],
    },
    {
      id: 'contract-periods', label: 'Contract Periods', icon: Calendar, idField: 'PeriodID',
      columns: [
        { key: 'PeriodName', label: 'Period Name' },
        { key: 'DurationMonths', label: 'Duration (Months)' },
        { key: 'Description', label: 'Description' },
      ],
      formFields: [
        { name: 'periodName', label: 'Period Name', type: 'text', required: true },
        { name: 'durationMonths', label: 'Duration (Months)', type: 'number', required: true },
        { name: 'description', label: 'Description', type: 'text' },
      ],
    },
    {
      id: 'contract-intervals', label: 'Contract Intervals', icon: Clock, idField: 'IntervalID',
      columns: [
        { key: 'IntervalName', label: 'Name' },
        { key: 'IntervalDays', label: 'Days' },
        { key: 'Description', label: 'Description' },
      ],
      formFields: [
        { name: 'intervalDays', label: 'Interval Days', type: 'number', required: true },
        { name: 'intervalName', label: 'Interval Name', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'text' },
      ],
    },
    {
      id: 'service-intervals', label: 'Service Intervals', icon: Wind, idField: 'ServiceIntervalID',
      columns: [
        { key: 'IntervalName', label: 'Name' },
        { key: 'IntervalDays', label: 'Days' },
        { key: 'Description', label: 'Description' },
      ],
      formFields: [
        { name: 'intervalDays', label: 'Interval Days', type: 'number', required: true },
        { name: 'intervalName', label: 'Interval Name', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'text' },
      ],
    },
    {
      id: 'service-hours', label: 'Service Hours', icon: Clock, idField: 'ServiceHoursID',
      columns: [
        { key: 'DayOfWeek', label: 'Day' },
        { key: 'StartTime', label: 'Start' },
        { key: 'EndTime', label: 'End' },
      ],
      formFields: [
        { name: 'dayOfWeek', label: 'Day of Week', type: 'select', required: true, options: [
          { value: '1', label: 'Monday' }, { value: '2', label: 'Tuesday' },
          { value: '3', label: 'Wednesday' }, { value: '4', label: 'Thursday' },
          { value: '5', label: 'Friday' }, { value: '6', label: 'Saturday' },
          { value: '7', label: 'Sunday' },
        ]},
        { name: 'startTime', label: 'Start Time', type: 'time', required: true },
        { name: 'endTime', label: 'End Time', type: 'time', required: true },
      ],
    },
    {
      id: 'service-cost', label: 'Service Cost', icon: DollarSign, idField: 'ServiceCostID',
      columns: [
        { key: 'CategoryName', label: 'Category' },
        { key: 'ServiceName', label: 'Service' },
        { key: 'Cost', label: 'Cost' },
        { key: 'ServiceTime', label: 'Time (min)' },
      ],
      formFields: [
        { name: 'categoryId', label: 'Category', type: 'select' },
        { name: 'serviceId', label: 'Service', type: 'select' },
        { name: 'cost', label: 'Cost', type: 'number' },
        { name: 'serviceTime', label: 'Service Time (min)', type: 'number' },
      ],
    },
    {
      id: 'system-cost', label: 'System Cost', icon: Cpu, idField: 'SystemCostID',
      columns: [
        { key: 'CategoryName', label: 'Category' },
        { key: 'SystemName', label: 'System' },
        { key: 'Cost', label: 'Cost' },
      ],
      formFields: [
        { name: 'categoryId', label: 'Category', type: 'select' },
        { name: 'systemId', label: 'System', type: 'select' },
        { name: 'cost', label: 'Cost', type: 'number' },
      ],
    },
    {
      id: 'holidays', label: 'Holidays', icon: Palmtree, idField: 'HolidayID',
      columns: [
        { key: 'HolidayName', label: 'Holiday Name' },
        { key: 'HolidayDate', label: 'Date' },
        { key: 'Description', label: 'Description' },
        { key: 'Status', label: 'Status' },
      ],
      formFields: [
        { name: 'holidayName', label: 'Holiday Name', type: 'text', required: true },
        { name: 'holidayDate', label: 'Holiday Date', type: 'date', required: true },
        { name: 'description', label: 'Description', type: 'text' },
      ],
    },
    {
      id: 'item-cost', label: 'Item Cost', icon: Package, idField: 'ItemCostID',
      columns: [
        { key: 'CategoryName', label: 'Category' },
        { key: 'ItemName', label: 'Item' },
        { key: 'Cost', label: 'Cost' },
      ],
      formFields: [
        { name: 'categoryId', label: 'Category', type: 'select' },
        { name: 'itemId', label: 'Item', type: 'select' },
        { name: 'cost', label: 'Cost', type: 'number' },
      ],
    },
  ];

  const currentTab = tabs.find(t => t.id === activeTab)!;

  useEffect(() => {
    loadData();
    loadDropdowns();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      let response;
      switch (activeTab) {
        case 'engineers': response = await adminService.getEngineers(); break;
        case 'teams': response = await adminService.getTeams(); break;
        case 'systems': response = await adminService.getSystems(); break;
        case 'services': response = await adminService.getServices(); break;
        case 'items': response = await adminService.getItems(); break;
        case 'item-stock': response = await adminService.getItemStock(); break;
        case 'area-codes': response = await adminService.getAreaCodes(); break;
        case 'categories': response = await adminService.getContractCategories(); break;
        case 'contract-periods': response = await adminService.getContractPeriods(); break;
        case 'contract-intervals': response = await adminService.getContractIntervals(); break;
        case 'service-intervals': response = await adminService.getServiceIntervals(); break;
        case 'service-hours': response = await adminService.getServiceHours(); break;
        case 'service-cost': response = await adminService.getServiceCost(); break;
        case 'system-cost': response = await adminService.getSystemCost(); break;
        case 'item-cost': response = await adminService.getItemCost(); break;
        case 'holidays': response = await adminService.getHolidays(); break;
      }
      setData(response?.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDropdowns = async () => {
    try {
      const dd: any = {};
      const [teamsRes, categoriesRes, systemsRes, servicesRes, itemsRes] = await Promise.all([
        adminService.getTeams().catch(() => ({ data: [] })),
        adminService.getContractCategories().catch(() => ({ data: [] })),
        adminService.getSystems().catch(() => ({ data: [] })),
        adminService.getServices().catch(() => ({ data: [] })),
        adminService.getItems().catch(() => ({ data: [] })),
      ]);
      dd.teams = teamsRes.data || [];
      dd.categories = categoriesRes.data || [];
      dd.systems = systemsRes.data || [];
      dd.services = servicesRes.data || [];
      dd.items = itemsRes.data || [];
      setDropdownData(dd);
    } catch (error) {
      console.error('Failed to load dropdowns:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateItem(activeTab, editingItem.id, formData);
      } else {
        await createItem(activeTab, formData);
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({});
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save');
    }
  };

  const createItem = async (tab: AdminTab, data: any) => {
    switch (tab) {
      case 'engineers': return adminService.createEngineer(data);
      case 'teams': return adminService.createTeam(data);
      case 'systems': return adminService.createSystem(data);
      case 'services': return adminService.createService(data);
      case 'items': return adminService.createItem(data);
      case 'area-codes': return adminService.createAreaCode(data);
      case 'categories': return adminService.createContractCategory(data);
      case 'contract-periods': return adminService.createContractPeriod(data);
      case 'contract-intervals': return adminService.createContractInterval(data);
      case 'service-intervals': return adminService.createServiceInterval(data);
      case 'service-hours': return adminService.createServiceHours(data);
      case 'service-cost': return adminService.createServiceCost(data);
      case 'system-cost': return adminService.createSystemCost(data);
      case 'item-cost': return adminService.createItemCost(data);
      case 'holidays': return adminService.createHoliday(data);
      default: return;
    }
  };

  const updateItem = async (tab: AdminTab, id: number, data: any) => {
    switch (tab) {
      case 'engineers': return adminService.updateEngineer(id, data);
      case 'teams': return adminService.updateTeam(id, data);
      case 'systems': return adminService.updateSystem(id, data);
      case 'services': return adminService.updateService(id, data);
      case 'items': return adminService.updateItem(id, data);
      case 'item-stock': return adminService.updateItemStock(data);
      case 'area-codes': return adminService.updateAreaCode(id, data);
      case 'categories': return adminService.updateContractCategory(id, data);
      case 'contract-periods': return adminService.updateContractPeriod(id, data);
      case 'contract-intervals': return adminService.updateContractInterval(id, data);
      case 'service-intervals': return adminService.updateServiceInterval(id, data);
      case 'service-hours': return adminService.updateServiceHours(id, data);
      case 'service-cost': return adminService.updateServiceCost(data);
      case 'system-cost': return adminService.updateSystemCost(data);
      case 'item-cost': return adminService.updateItemCost(data);
      case 'holidays': return adminService.updateHoliday(id, data);
      default: return;
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      switch (activeTab) {
        case 'engineers': await adminService.deleteEngineer(id); break;
        case 'teams': await adminService.deleteTeam(id); break;
        case 'systems': await adminService.deleteSystem(id); break;
        case 'services': await adminService.deleteService(id); break;
        case 'items': await adminService.deleteItem(id); break;
        case 'area-codes': await adminService.deleteAreaCode(id); break;
        case 'categories': await adminService.deleteContractCategory(id); break;
        case 'contract-periods': await adminService.deleteContractPeriod(id); break;
        case 'contract-intervals': await adminService.deleteContractInterval(id); break;
        case 'service-intervals': await adminService.deleteServiceInterval(id); break;
        case 'service-hours': await adminService.deleteServiceHours(id); break;
        case 'holidays': await adminService.deleteHoliday(id); break;
      }
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete');
    }
  };

  const getDropdownOptions = (fieldName: string) => {
    if (fieldName === 'teamId') return dropdownData.teams?.map((t: any) => ({ value: String(t.TeamID), label: t.TeamName })) || [];
    if (fieldName === 'categoryId') return dropdownData.categories?.map((c: any) => ({ value: String(c.CategoryID), label: c.CategoryName })) || [];
    if (fieldName === 'systemId') return dropdownData.systems?.map((s: any) => ({ value: String(s.SystemID), label: s.SystemName })) || [];
    if (fieldName === 'serviceId') return dropdownData.services?.map((s: any) => ({ value: String(s.ServiceID), label: s.ServiceName })) || [];
    if (fieldName === 'itemId') return dropdownData.items?.map((i: any) => ({ value: String(i.ItemID), label: i.ItemName })) || [];
    return [];
  };

  const canDelete = !['item-stock', 'service-cost', 'system-cost', 'item-cost'].includes(activeTab);

  const filteredData = data.filter((item) =>
    Object.values(item).some((val) => String(val).toLowerCase().includes(search.toLowerCase()))
  );

  const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const renderCellValue = (key: string, val: any) => {
    if (val === null || val === undefined) return '-';
    if (key === 'DayOfWeek') return dayNames[val] || val;
    if (key === 'Status') return val ? '✅ Active' : '❌ Inactive';
    if (key === 'HolidayDate') return new Date(val).toLocaleDateString();
    if (typeof val === 'number' && (key.toLowerCase().includes('cost') || key === 'Cost' || key === 'Price')) return `BD ${val}`;
    return String(val);
  };

  return (
    <>
      <style>{`
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
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes waveMove {
          0% { transform: translateX(0) translateZ(0) scaleY(1); }
          50% { transform: translateX(-25%) translateZ(0) scaleY(0.55); }
          100% { transform: translateX(-50%) translateZ(0) scaleY(1); }
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
          top: 50%; left: 50%;
          width: 0; height: 0;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        .water-btn:active::after { width: 300px; height: 300px; }
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
        .wave-divider {
          height: 3px;
          border-radius: 2px;
          background: linear-gradient(90deg, #06b6d4, #0ea5e9, #38bdf8, #06b6d4);
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }
        .tab-pill {
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        .tab-pill.active {
          background: linear-gradient(135deg, #06b6d4, #0891b2);
          color: white;
          box-shadow: 0 4px 12px rgba(6,182,212,0.4);
        }
      `}</style>

      <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 25%, #0284c7 50%, #0ea5e9 75%, #38bdf8 100%)' }}>
        {/* Bubbles */}
        {[...Array(10)].map((_, i) => (
          <div key={i} className="bubble" style={{
            left: `${Math.random() * 100}%`,
            width: `${8 + Math.random() * 25}px`,
            height: `${8 + Math.random() * 25}px`,
            animationDuration: `${8 + Math.random() * 12}s`,
            animationDelay: `${Math.random() * 8}s`,
          }} />
        ))}

        {/* Wave */}
        <div className="absolute top-0 left-0 right-0 h-24 overflow-hidden opacity-15 pointer-events-none">
          <svg viewBox="0 0 1440 320" className="w-full h-full" style={{ animation: 'waveMove 8s linear infinite' }}>
            <path fill="white" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L0,320Z" />
          </svg>
        </div>

        <div className="relative z-10 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.3), rgba(14,165,233,0.3))', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Settings className="w-8 h-8 text-white" style={{ filter: 'drop-shadow(0 0 8px rgba(6,182,212,0.5))' }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>Admin Settings</h1>
                <p className="text-cyan-200 flex items-center gap-1">
                  <Droplets className="w-4 h-4" />
                  Manage master data & configurations
                </p>
              </div>
            </div>
            <button
              onClick={() => { setEditingItem(null); setFormData({}); setShowModal(true); }}
              className="water-btn flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)', boxShadow: '0 4px 15px rgba(6,182,212,0.4)' }}
            >
              <Plus className="w-5 h-5" />
              <Sparkles className="w-4 h-4" />
              Add New
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="glass-card rounded-2xl p-3 shadow-lg">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { navigate(`/admin/${tab.id}`); setSearch(''); }}
                  className={`tab-pill flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-sm ${
                    activeTab === tab.id ? 'active' : 'text-cyan-700 hover:bg-white/40'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="glass-card rounded-2xl p-4 shadow-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
              <input
                type="text"
                placeholder={`Dive in & search ${currentTab.label.toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ocean-input w-full pl-10 pr-4 py-2.5 rounded-xl outline-none text-gray-700 placeholder-gray-400"
              />
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
              <p className="text-cyan-700 mt-4 font-medium">Loading {currentTab.label}...</p>
            </div>
          ) : (
            <div className="glass-card rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(14,165,233,0.15))' }}>
                    {currentTab.columns.map(col => (
                      <th key={col.key} className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-cyan-700">
                        {col.label}
                      </th>
                    ))}
                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-cyan-700">
                      <Sparkles className="w-3.5 h-3.5 inline" /> Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-100/50">
                  {filteredData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-cyan-50/30 transition-all duration-300">
                      {currentTab.columns.map(col => (
                        <td key={col.key} className="px-5 py-3.5 text-sm text-gray-700">
                          {renderCellValue(col.key, item[col.key])}
                        </td>
                      ))}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              const id = item[currentTab.idField];
                              setEditingItem({ ...item, id });
                              setFormData(item);
                              setShowModal(true);
                            }}
                            className="water-btn p-2 rounded-lg text-cyan-600 hover:text-white transition-all duration-300 hover:scale-110"
                            style={{ background: 'rgba(6,182,212,0.1)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #06b6d4, #0891b2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(6,182,212,0.1)'}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => deleteItem(item[currentTab.idField])}
                              className="water-btn p-2 rounded-lg text-red-400 hover:text-white transition-all duration-300 hover:scale-110"
                              style={{ background: 'rgba(239,68,68,0.1)' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan={currentTab.columns.length + 1} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="p-4 rounded-full mb-4" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(14,165,233,0.1))' }}>
                            <Waves className="w-12 h-12 text-cyan-400" />
                          </div>
                          <p className="text-cyan-600 font-medium text-lg">No {currentTab.label.toLowerCase()} found</p>
                          <p className="text-cyan-400 text-sm mt-1">Add a new entry to get started</p>
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
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bubble" style={{
                left: `${20 + Math.random() * 60}%`,
                width: `${6 + Math.random() * 12}px`,
                height: `${6 + Math.random() * 12}px`,
                animationDuration: `${6 + Math.random() * 8}s`,
                animationDelay: `${Math.random() * 4}s`,
              }} />
            ))}

            <div className="glass-modal rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 rounded-t-3xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0c4a6e, #0369a1, #0284c7)' }}>
                <div className="absolute inset-0 opacity-10">
                  <svg viewBox="0 0 1440 320" className="w-full h-full">
                    <path fill="white" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L0,320Z" />
                  </svg>
                </div>
                <div className="relative flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/20">
                    <currentTab.icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {editingItem ? 'Edit' : 'Create'} {currentTab.label.slice(0, -1)}
                  </h2>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {currentTab.formFields.map((field) => (
                  <div key={field.name}>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-cyan-800 mb-1.5">
                      <Droplets className="w-3 h-3" />
                      {field.label}
                      {field.required && <span className="text-red-400">*</span>}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        required={field.required}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value ? (field.name === 'dayOfWeek' ? parseInt(e.target.value) : parseInt(e.target.value)) : '' })}
                        className="ocean-input w-full px-4 py-2.5 rounded-xl outline-none text-gray-700"
                      >
                        <option value="">Select {field.label.toLowerCase()}...</option>
                        {(field.options || getDropdownOptions(field.name)).map((opt: any) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        required={field.required}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: field.type === 'number' ? (e.target.value ? parseInt(e.target.value) : '') : e.target.value })}
                        className="ocean-input w-full px-4 py-2.5 rounded-xl outline-none text-gray-700 placeholder-gray-400"
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                      />
                    )}
                  </div>
                ))}

                <div className="wave-divider mt-6" />

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingItem(null); setFormData({}); }}
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
                    {editingItem ? 'Update' : 'Create'}
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

export default Admin;
