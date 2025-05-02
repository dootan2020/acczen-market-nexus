import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from '@/components/Layout'; 
import AdminLayout from '@/components/AdminLayout';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DiscountAnalyticsPage from '@/pages/admin/DiscountAnalyticsPage';
import Index from '@/pages/Index'; 
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/Dashboard';
import CartPage from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import OrderComplete from '@/pages/OrderComplete';
import Deposit from '@/pages/Deposit';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import UpdatePasswordPage from '@/pages/UpdatePasswordPage';
import ProfilePage from '@/pages/ProfilePage';
import PurchasesPage from '@/pages/PurchasesPage';
import DepositHistoryPage from '@/pages/DepositHistoryPage';
import DashboardSettingsPage from '@/pages/DashboardSettingsPage';

// Import admin pages
import AdminHome from '@/pages/admin/AdminHome';
import ProductsPage from '@/pages/admin/ProductsPage';
import APIMonitoringPage from '@/pages/admin/APIMonitoringPage';
import ProductsImport from '@/pages/admin/ProductsImport';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminOrders from '@/pages/admin/AdminOrders';
import UsersPage from '@/pages/admin/UsersPage';
import DepositsPage from '@/pages/admin/DepositsPage';
import ReportsPage from '@/pages/admin/ReportsPage';
import AdminExchangeRates from '@/pages/admin/AdminExchangeRates';
import AdminTransactions from '@/pages/admin/AdminTransactions';
import AdminSettings from '@/pages/admin/AdminSettings';

// Create placeholder components for routes that are missing
const CategoriesPage = () => <div>Categories Page</div>;
const AdminIntegrationsPage = () => <div>Admin Integrations Page</div>;
const CategoryEditPage = () => <div>Category Edit Page</div>;
const AdminOrderDetailsPage = () => <div>Admin Order Details Page</div>;
const DepositDetailsPage = () => <div>Deposit Details Page</div>;
const AdminProductEditPage = () => <div>Admin Product Edit Page</div>;
const AdminProductCreatePage = () => <div>Admin Product Create Page</div>;
const CategoryCreatePage = () => <div>Category Create Page</div>;

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: 'products',
        element: <Products />,
      },
      {
        path: 'product/:slug',
        element: <ProductDetail />,
      },
      {
        path: 'categories',
        element: <CategoriesPage />,
      },
      {
        path: 'cart',
        element: <CartPage />,
      },
      {
        path: 'checkout',
        element: <ProtectedRoute><Checkout /></ProtectedRoute>,
      },
      {
        path: 'order-complete',
        element: <ProtectedRoute><OrderComplete /></ProtectedRoute>,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
      {
        path: 'update-password',
        element: <ProtectedRoute><UpdatePasswordPage /></ProtectedRoute>,
      },
    ],
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'history',
        element: <DepositHistoryPage />,
      },
      {
        path: 'purchases',
        element: <PurchasesPage />,
      },
      {
        path: 'settings',
        element: <DashboardSettingsPage />,
      },
    ],
  },
  {
    path: '/deposit',
    element: <ProtectedRoute><Deposit /></ProtectedRoute>,
  },
  {
    path: 'admin',
    element: <AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>,
    children: [
      {
        index: true,
        element: (
          <AdminProtectedRoute>
            <AdminHome />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'products',
        element: (
          <AdminProtectedRoute>
            <ProductsPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'products/edit/:id',
        element: (
          <AdminProtectedRoute>
            <AdminProductEditPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'products/create',
        element: (
          <AdminProtectedRoute>
            <AdminProductCreatePage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'products-import',
        element: (
          <AdminProtectedRoute>
            <ProductsImport />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'categories',
        element: (
          <AdminProtectedRoute>
            <AdminCategories />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'categories/edit/:id',
        element: (
          <AdminProtectedRoute>
            <CategoryEditPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'categories/create',
        element: (
          <AdminProtectedRoute>
            <CategoryCreatePage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'orders',
        element: (
          <AdminProtectedRoute>
            <AdminOrders />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <AdminProtectedRoute>
            <AdminOrderDetailsPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <AdminProtectedRoute>
            <UsersPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'deposits',
        element: (
          <AdminProtectedRoute>
            <DepositsPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'deposits/:id',
        element: (
          <AdminProtectedRoute>
            <DepositDetailsPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'reports',
        element: (
          <AdminProtectedRoute>
            <ReportsPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'integrations',
        element: (
          <AdminProtectedRoute>
            <AdminIntegrationsPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'api-monitoring',
        element: (
          <AdminProtectedRoute>
            <APIMonitoringPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'exchange-rates',
        element: (
          <AdminProtectedRoute>
            <AdminExchangeRates />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'discount-analytics',
        element: (
          <AdminProtectedRoute>
            <DiscountAnalyticsPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'transactions',
        element: (
          <AdminProtectedRoute>
            <AdminTransactions />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <AdminProtectedRoute>
            <AdminSettings />
          </AdminProtectedRoute>
        ),
      },
    ],
  }
]);

export default router;
