
import React from 'react';
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
import Layout from './components/Layout';
import BottomNav from './components/mobile/BottomNav';
import { useIsMobile } from './hooks/use-mobile';

// Import necessary components from routes.tsx or create placeholder components if needed
import DashboardLayout from './components/dashboard/DashboardLayout';
import Dashboard from './components/dashboard/Dashboard';

// Create placeholder components for missing components
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

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

// Placeholder components for missing components
const ProductsPage = () => (
  <Layout>
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Products Page</h1>
      <p>Products listing will go here.</p>
    </div>
  </Layout>
);

const ProductDetailPage = () => (
  <Layout>
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Product Detail Page</h1>
      <p>Product details will go here.</p>
    </div>
  </Layout>
);

const OrderComplete = () => (
  <Layout>
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Order Complete</h1>
      <p>Thank you for your order!</p>
    </div>
  </Layout>
);

const DepositPage = () => (
  <Layout>
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Deposit</h1>
      <p>Deposit functionality will go here.</p>
    </div>
  </Layout>
);

const DepositHistoryPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">Deposit History</h1>
    <p>Your deposit history will appear here.</p>
  </div>
);

const PurchasesPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">Your Purchases</h1>
    <p>Your purchase history will appear here.</p>
  </div>
);

const SettingsPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
    <p>Account settings will be available here.</p>
  </div>
);

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
        <Route path="/products/:categorySlug" element={<ProductsPage />} />
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
