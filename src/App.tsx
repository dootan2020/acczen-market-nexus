import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { ToastProvider } from "@/components/ui/sonner"
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import VerifiedEmail from './pages/auth/VerifiedEmail';
import ResetPassword from './pages/auth/ResetPassword';
import UpdatePassword from './pages/auth/UpdatePassword';
import Home from './pages/Home';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import DepositPage from './pages/DepositPage';
import DepositHistoryPage from './pages/dashboard/DepositHistoryPage';
import PurchasesPage from './pages/dashboard/PurchasesPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import Dashboard from './pages/dashboard/Dashboard';
import DashboardLayout from './components/dashboard/DashboardLayout';
import AdminRoute from './components/admin/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminHome from './pages/admin/AdminHome';
import OrdersPage from './pages/admin/OrdersPage';
import ProductsAdminPage from './pages/admin/ProductsAdminPage';
import CategoriesAdminPage from './pages/admin/CategoriesAdminPage';
import UsersAdminPage from './pages/admin/UsersAdminPage';
import DepositsAdminPage from './pages/admin/DepositsAdminPage';
import CreateProductPage from './pages/admin/CreateProductPage';
import EditProductPage from './pages/admin/EditProductPage';
import OrderComplete from './pages/OrderComplete';
import NotificationsPage from './pages/dashboard/NotificationsPage';

// ProtectedRoute component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Store the attempted URL in localStorage
    if (!user && !loading) {
      localStorage.setItem('previousPath', location.pathname);
    }
  }, [user, loading, location.pathname]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <ToastProvider>
      <CurrencyProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/verified-email" element={<VerifiedEmail />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/update-password" element={<UpdatePassword />} />
              <Route path="/products/:categorySlug" element={<ProductsPage />} />
              <Route path="/product/:productSlug" element={<ProductDetailPage />} />
              <Route path="/order-complete" element={<OrderComplete />} />

              {/* Protected Routes */}
              <Route
                path="/deposit"
                element={
                  <ProtectedRoute>
                    <DepositPage />
                  </ProtectedRoute>
                }
              />

              {/* Dashboard Routes */}
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <Routes>
                      <Route path="" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
                      <Route path="deposits" element={<DashboardLayout><DepositHistoryPage /></DashboardLayout>} />
                      <Route path="purchases" element={<DashboardLayout><PurchasesPage /></DashboardLayout>} />
                      <Route path="settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
                      <Route path="notifications" element={<DashboardLayout><NotificationsPage /></DashboardLayout>} />
                    </Routes>
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <Routes>
                        <Route path="" element={<AdminHome />} />
                        <Route path="orders" element={<OrdersPage />} />
                        <Route path="products" element={<ProductsAdminPage />} />
                        <Route path="products/create" element={<CreateProductPage />} />
                        <Route path="products/edit/:productId" element={<EditProductPage />} />
                        <Route path="categories" element={<CategoriesAdminPage />} />
                        <Route path="users" element={<UsersAdminPage />} />
                        <Route path="deposits" element={<DepositsAdminPage />} />
                      </Routes>
                    </AdminLayout>
                  </AdminRoute>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </CurrencyProvider>
    </ToastProvider>
  );
}

export default App;
