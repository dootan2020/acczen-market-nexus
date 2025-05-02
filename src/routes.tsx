
import React from 'react';
import Layout from './components/Layout';
import Index from './pages/Index';
import Products from './pages/Products';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/Dashboard';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import Help from './pages/Help';

// Import admin pages
import AdminHome from './pages/admin/AdminHome';
import ProductsPage from './pages/admin/ProductsPage';
import APIMonitoringPage from './pages/admin/APIMonitoringPage';
import ProductsImport from './pages/admin/ProductsImport';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import UsersPage from './pages/admin/UsersPage';
import DepositsPage from './pages/admin/DepositsPage';
import ReportsPage from './pages/admin/ReportsPage';
import AdminExchangeRates from './pages/admin/AdminExchangeRates';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminSettings from './pages/admin/AdminSettings';
import DiscountAnalyticsPage from './pages/admin/DiscountAnalyticsPage';

// Create placeholder components for routes that are missing
const CategoriesPage = () => <div>Categories Page</div>;
const ProfilePage = () => <div>Profile Page</div>;
const AdminIntegrationsPage = () => <div>Admin Integrations Page</div>;
const CategoryEditPage = () => <div>Category Edit Page</div>;
const AdminOrderDetailsPage = () => <div>Admin Order Details Page</div>;
const DepositDetailsPage = () => <div>Deposit Details Page</div>;
const AdminProductEditPage = () => <div>Admin Product Edit Page</div>;
const AdminProductCreatePage = () => <div>Admin Product Create Page</div>;
const CategoryCreatePage = () => <div>Category Create Page</div>;

// Define routes that should use the main Layout (with Header and Footer)
const mainRoutes = [
  { path: '/', element: <Index /> },
  { path: '/products', element: <Products /> },
  { path: '/categories', element: <CategoriesPage /> },
  { path: '/profile', element: <ProfilePage /> },
  { path: '/help', element: <Help /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/update-password', element: <UpdatePasswordPage /> },
];

// Define routes that don't need the main Layout (like auth pages)
const authRoutes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
];

// Define routes for dashboard that might have their own layout
const dashboardRoutes = [
  { path: '/dashboard', element: <DashboardPage /> },
];

// Define routes for admin section that might have their own layout
const adminRoutes = [
  { path: '/admin', element: <AdminHome /> },
  { path: '/admin/products', element: <ProductsPage /> },
  { path: '/admin/products/edit/:id', element: <AdminProductEditPage /> },
  { path: '/admin/products/create', element: <AdminProductCreatePage /> },
  { path: '/admin/products-import', element: <ProductsImport /> },
  { path: '/admin/categories', element: <AdminCategories /> },
  { path: '/admin/categories/edit/:id', element: <CategoryEditPage /> },
  { path: '/admin/categories/create', element: <CategoryCreatePage /> },
  { path: '/admin/orders', element: <AdminOrders /> },
  { path: '/admin/orders/:id', element: <AdminOrderDetailsPage /> },
  { path: '/admin/users', element: <UsersPage /> },
  { path: '/admin/deposits', element: <DepositsPage /> },
  { path: '/admin/deposits/:id', element: <DepositDetailsPage /> },
  { path: '/admin/reports', element: <ReportsPage /> },
  { path: '/admin/integrations', element: <AdminIntegrationsPage /> },
  { path: '/admin/api-monitoring', element: <APIMonitoringPage /> },
  { path: '/admin/exchange-rates', element: <AdminExchangeRates /> },
  { path: '/admin/discount-analytics', element: <DiscountAnalyticsPage /> },
  { path: '/admin/transactions', element: <AdminTransactions /> },
  { path: '/admin/settings', element: <AdminSettings /> },
];

// Combine all routes for export
const routes = {
  mainRoutes,
  authRoutes,
  dashboardRoutes,
  adminRoutes
};

export default routes;
