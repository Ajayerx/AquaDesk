import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  User,
  FileText,
  ShoppingCart,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Cpu,
  Wrench,
  Package,
  MapPin,
  Clock,
  DollarSign,
  Database,
  Wind,
  Palmtree
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Companies', path: '/companies', icon: Building2 },
  { name: 'Users', path: '/users', icon: Users },
  { name: 'Customers', path: '/customers', icon: User },
  { name: 'Contracts', path: '/contracts', icon: FileText },
  { name: 'Sales', path: '/sales', icon: ShoppingCart },
  { name: 'Sales Master Plans', path: '/sales-master-plans', icon: FileText },
  { name: 'Schedule', path: '/schedule', icon: Calendar },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  {
    name: 'Admin',
    icon: Settings,
    children: [
      { name: 'Engineers', path: '/admin/engineers', icon: Users },
      { name: 'Teams', path: '/admin/teams', icon: Building2 },
      { name: 'Systems', path: '/admin/systems', icon: Cpu },
      { name: 'Services', path: '/admin/services', icon: Wrench },
      { name: 'Items', path: '/admin/items', icon: Package },
      { name: 'Item Stock', path: '/admin/item-stock', icon: Database },
      { name: 'Area Codes', path: '/admin/area-codes', icon: MapPin },
      { name: 'Categories', path: '/admin/categories', icon: FileText },
      { name: 'Contract Periods', path: '/admin/contract-periods', icon: Calendar },
      { name: 'Contract Intervals', path: '/admin/contract-intervals', icon: Clock },
      { name: 'Service Intervals', path: '/admin/service-intervals', icon: Wind },
      { name: 'Service Hours', path: '/admin/service-hours', icon: Clock },
      { name: 'Service Cost', path: '/admin/service-cost', icon: DollarSign },
      { name: 'System Cost', path: '/admin/system-cost', icon: Cpu },
      { name: 'Item Cost', path: '/admin/item-cost', icon: Package },
      { name: 'Holidays', path: '/admin/holidays', icon: Palmtree },
    ],
  },
];

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-sidebar text-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-sidebar-hover">
          <h1 className="text-xl font-bold">Qsystech Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-120px)]">
          {navItems.map((item) => {
            if (item.children) {
              return (
                <div key={item.name}>
                  <button
                    onClick={() => setAdminOpen(!adminOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-sidebar-hover hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${adminOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {adminOpen && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                            isActive(child.path)
                              ? 'bg-sidebar-active text-white'
                              : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
                          }`}
                        >
                          {child.icon && <child.icon className="w-4 h-4" />}
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-sidebar-active text-white'
                    : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-hover">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-sidebar-hover hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 ml-auto">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                {user?.fullName?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
