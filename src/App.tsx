
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from "sonner";

// Import trực tiếp các components thay vì lazy loading
import Layout from './components/Layout';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import VerifiedEmail from './pages/auth/VerifiedEmail';
import ResetPassword from './pages/auth/ResetPassword';
import UpdatePassword from './pages/auth/UpdatePassword';
import NotificationsPage from './pages/dashboard/NotificationsPage';
import AdminLayout from './components/AdminLayout';
import AdminHome from './pages/admin/AdminHome';
import OrdersPage from './pages/admin/OrdersPage';
import ProductsAdminPage from './pages/admin/ProductsAdminPage';
import CreateProductPage from './pages/admin/CreateProductPage';
import EditProductPage from './pages/admin/EditProductPage';
import CategoriesAdminPage from './pages/admin/CategoriesAdminPage';
import UsersAdminPage from './pages/admin/UsersAdminPage';
import DepositsAdminPage from './pages/admin/DepositsAdminPage';
import Products from './pages/Products';
import ProductDetailPage from './pages/ProductDetail';
import OrderComplete from './pages/OrderComplete';
import DepositPage from './pages/Deposit';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';
import Dashboard from './components/dashboard/Dashboard';
import DepositHistoryPage from './pages/DepositHistoryPage';
import PurchasesPage from './pages/PurchasesPage';
import SettingsPage from './pages/SettingsPage';
import { useIsMobile } from './hooks/use-mobile';

// ProtectedRoute component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    // Store the attempted URL in localStorage
    if (!user && !isLoading) {
      localStorage.setItem('previousPath', location.pathname);
    }
  }, [user, isLoading, location.pathname]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const isMobile = useIsMobile();
  
  return (
    <>
      <Toaster position={isMobile ? "top-center" : "top-right"} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verified-email" element={<VerifiedEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/update-password" element={<UpdatePassword />} />
        <Route path="/products/:categorySlug" element={<Products />} />
        <Route path="/product/:productSlug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<Cart />} />
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
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
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
      
      {isMobile && <div className="h-16" />}
    </>
  );
}

export default App;
