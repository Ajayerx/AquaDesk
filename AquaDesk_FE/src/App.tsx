import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';
import CustomerPortalLayout from './components/CustomerPortalLayout';
import RoleGuard from './components/RoleGuard';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Users from './pages/Users';
import Customers from './pages/Customers';
import Contracts from './pages/Contracts';
import Sales from './pages/Sales';
import SchedulePage from './pages/Schedule';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import SalesMasterPlans from './pages/SalesMasterPlans';
import CustomerDetails from './pages/CustomerDetails';
import Forbidden from './pages/Forbidden';
import NotFound from './pages/NotFound';
import ComplaintsPage from './pages/Complaints';
import ScheduleRequestsPage from './pages/ScheduleRequests';

import CustomerDashboard from './pages/customer/Dashboard';
import CustomerSchedule from './pages/customer/Schedule';
import CustomerContracts from './pages/customer/Contracts';
import CustomerComplaints from './pages/customer/Complaints';
import CustomerProfile from './pages/customer/Profile';
import type { ReactNode } from 'react';

const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forbidden" element={<ProtectedRoute><Forbidden /></ProtectedRoute>} />

      {/* Customer Portal Routes */}
      <Route
        path="/customer/*"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['Customer']}>
              <CustomerPortalLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="schedule" element={<CustomerSchedule />} />
        <Route path="contracts" element={<CustomerContracts />} />
        <Route path="complaints" element={<CustomerComplaints />} />
        <Route path="profile" element={<CustomerProfile />} />
      </Route>

      {/* Internal App Routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            {user?.role === 'Customer' ? (
              <Navigate to="/customer/dashboard" replace />
            ) : (
              <Layout />
            )}
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<RoleGuard allowedRoles={['SuperAdmin', 'Admin', 'Manager']}><Dashboard /></RoleGuard>} />
        <Route path="companies" element={<RoleGuard allowedRoles={['SuperAdmin']}><Companies /></RoleGuard>} />
        <Route path="users" element={<RoleGuard allowedRoles={['SuperAdmin', 'Admin']}><Users /></RoleGuard>} />
        <Route path="customers" element={<RoleGuard allowedRoles={['Admin', 'Manager']}><Customers /></RoleGuard>} />
        <Route path="customers/:id" element={<RoleGuard allowedRoles={['Admin', 'Manager']}><CustomerDetails /></RoleGuard>} />
        <Route path="contracts" element={<RoleGuard allowedRoles={['Admin', 'Manager']}><Contracts /></RoleGuard>} />
        <Route path="sales" element={<RoleGuard allowedRoles={['Admin', 'Manager']}><Sales /></RoleGuard>} />
        <Route path="sales-master-plans" element={<RoleGuard allowedRoles={['Admin', 'Manager']}><SalesMasterPlans /></RoleGuard>} />
        <Route path="schedule" element={<RoleGuard allowedRoles={['Admin', 'Manager', 'Engineer']}><SchedulePage /></RoleGuard>} />
        <Route path="reports" element={<RoleGuard allowedRoles={['Admin', 'Manager']}><Reports /></RoleGuard>} />
        <Route path="complaints" element={<RoleGuard allowedRoles={['Admin', 'Manager']}><ComplaintsPage /></RoleGuard>} />
        <Route path="schedule-requests" element={<RoleGuard allowedRoles={['Admin', 'Manager']}><ScheduleRequestsPage /></RoleGuard>} />
        <Route path="admin" element={<RoleGuard allowedRoles={['SuperAdmin', 'Admin']}><Admin /></RoleGuard>}>
          <Route index element={<Navigate to="engineers" replace />} />
          <Route path="engineers" element={<Admin />} />
          <Route path="teams" element={<Admin />} />
          <Route path="systems" element={<Admin />} />
          <Route path="services" element={<Admin />} />
          <Route path="items" element={<Admin />} />
          <Route path="item-stock" element={<Admin />} />
          <Route path="area-codes" element={<Admin />} />
          <Route path="categories" element={<Admin />} />
          <Route path="contract-periods" element={<Admin />} />
          <Route path="contract-intervals" element={<Admin />} />
          <Route path="service-intervals" element={<Admin />} />
          <Route path="service-hours" element={<Admin />} />
          <Route path="service-cost" element={<Admin />} />
          <Route path="system-cost" element={<Admin />} />
          <Route path="item-cost" element={<Admin />} />
          <Route path="holidays" element={<Admin />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
