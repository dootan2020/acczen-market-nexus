
import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from "sonner";
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import VerifiedEmail from './pages/auth/VerifiedEmail';
import ResetPassword from './pages/auth/ResetPassword';
import UpdatePassword from './pages/auth/UpdatePassword';
import NotificationsPage from './pages/dashboard/NotificationsPage';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminLayout from './components/AdminLayout';
import AdminHome from './pages/admin/AdminHome';
import OrdersPage from './pages/admin/OrdersPage';
import ProductsAdminPage from './pages/admin/ProductsAdminPage';
import CreateProductPage from './pages/admin/CreateProductPage';
import EditProductPage from './pages/admin/EditProductPage';
import CategoriesAdminPage from './pages/admin/CategoriesAdminPage';
import UsersAdminPage from './pages/admin/UsersAdminPage';
import DepositsAdminPage from './pages/admin/DepositsAdminPage';

// Import necessary components from routes.tsx or create placeholder components if needed
import DashboardLayout from './components/dashboard/DashboardLayout';
import Dashboard from './components/dashboard/Dashboard';

// ProtectedRoute component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Store the attempted URL in localStorage
    if (!user && !isLoading) {
      localStorage.setItem('previousPath', location.pathname);
    }
  }, [user, isLoading, location.pathname]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Create placeholder components for missing components
const Home = () => <div>Home Page</div>;
const ProductsPage = () => <div>Products Page</div>;
const ProductDetailPage = () => <div>Product Detail Page</div>;
const OrderComplete = () => <div>Order Complete Page</div>;
const DepositPage = () => <div>Deposit Page</div>;
const DepositHistoryPage = () => <div>Deposit History Page</div>;
const PurchasesPage = () => <div>Purchases Page</div>;
const SettingsPage = () => <div>Settings Page</div>;

function App() {
  return (
    <>
      <Toaster />
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
              <DashboardLayout>
                <Routes>
                  <Route path="" element={<Dashboard />} />
                  <Route path="deposits" element={<DepositHistoryPage />} />
                  <Route path="purchases" element={<PurchasesPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <AdminProtectedRoute>
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
            </AdminProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
