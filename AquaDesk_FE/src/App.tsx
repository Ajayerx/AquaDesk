import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="companies" element={<Companies />} />
            <Route path="users" element={<Users />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerDetails />} />
            <Route path="contracts" element={<Contracts />} />
            <Route path="sales" element={<Sales />} />
            <Route path="sales-master-plans" element={<SalesMasterPlans />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="reports" element={<Reports />} />
            <Route path="admin" element={<Admin />}>
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
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
