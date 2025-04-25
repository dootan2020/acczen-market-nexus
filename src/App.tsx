
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import Layout from "./components/Layout";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Dashboard from "./pages/Dashboard";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminDeposits from "./pages/admin/AdminDeposits";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReports from "./pages/admin/AdminReports";
import ProductIntegration from "./pages/admin/ProductIntegration";
import ApiMonitoring from "./pages/admin/ApiMonitoring";
import NotFound from "./pages/NotFound";
import Deposit from "./pages/Deposit";
import DepositSuccess from "./pages/DepositSuccess";
import Checkout from "./pages/Checkout";
import VerifyEmail from "./pages/auth/VerifyEmail";
import VerifiedEmail from "./pages/auth/VerifiedEmail";
import ResetPassword from "./pages/auth/ResetPassword";
import ApiDocumentation from "./pages/admin/ApiDocumentation";
import { Toaster as UIToaster } from "./components/ui/toaster";
import Help from "./pages/Help";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Index />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:slug" element={<ProductDetail />} />
          <Route path="deposit" element={<Deposit />} />
          <Route path="deposit/success" element={<DepositSuccess />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="help" element={<Help />} />
        </Route>

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="purchases" element={<Dashboard />} />
          <Route path="history" element={<Dashboard />} />
          <Route path="settings" element={<Dashboard />} />
        </Route>

        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="deposits" element={<AdminDeposits />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="integrations" element={<ProductIntegration />} />
          <Route path="api-monitoring" element={<ApiMonitoring />} />
          <Route path="api-docs" element={<ApiDocumentation />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verified-email" element={<VerifiedEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" richColors closeButton />
      <UIToaster />
    </AuthProvider>
  );
}

export default App;
