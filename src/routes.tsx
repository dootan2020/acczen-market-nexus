
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import Layout from '@/components/Layout'; 
import AdminLayout from '@/components/AdminLayout';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import DiscountAnalyticsPage from '@/pages/admin/DiscountAnalyticsPage';

// Create a Layout component for routes that are missing
const MainLayout = () => {
  return <Layout><Outlet /></Layout>;
};

// Create placeholder components for routes that are missing
const HomePage = () => <div>Home Page</div>;
const LoginPage = () => <div>Login Page</div>;
const RegisterPage = () => <div>Register Page</div>;
const ProductsPage = () => <div>Products Page</div>;
const ProductDetailsPage = () => <div>Product Details Page</div>;
const CategoriesPage = () => <div>Categories Page</div>;
const ProfilePage = () => <div>Profile Page</div>;
const AdminHomePage = () => <div>Admin Home Page</div>;
const AdminProductsPage = () => <div>Admin Products Page</div>;
const AdminCategoriesPage = () => <div>Admin Categories Page</div>;
const AdminOrdersPage = () => <div>Admin Orders Page</div>;
const AdminUsersPage = () => <div>Admin Users Page</div>;
const AdminDepositsPage = () => <div>Admin Deposits Page</div>;
const AdminReportsPage = () => <div>Admin Reports Page</div>;
const AdminIntegrationsPage = () => <div>Admin Integrations Page</div>;
const AdminAPIMonitoringPage = () => <div>Admin API Monitoring Page</div>;
const AdminExchangeRatesPage = () => <div>Admin Exchange Rates Page</div>;
const ProductsImportPage = () => <div>Products Import Page</div>;
const AdminProductEditPage = () => <div>Admin Product Edit Page</div>;
const CategoryEditPage = () => <div>Category Edit Page</div>;
const AdminOrderDetailsPage = () => <div>Admin Order Details Page</div>;
const DepositDetailsPage = () => <div>Deposit Details Page</div>;
const AdminProductCreatePage = () => <div>Admin Product Create Page</div>;
const CategoryCreatePage = () => <div>Category Create Page</div>;

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/products',
        element: <ProductsPage />,
      },
      {
        path: '/products/:slug',
        element: <ProductDetailsPage />,
      },
      {
        path: '/categories',
        element: <CategoriesPage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        path: '',
        element: <AdminProtectedRoute><AdminHomePage /></AdminProtectedRoute>,
      },
      {
        path: 'products',
        element: <AdminProtectedRoute><AdminProductsPage /></AdminProtectedRoute>,
      },
      {
        path: 'products/edit/:id',
        element: <AdminProtectedRoute><AdminProductEditPage /></AdminProtectedRoute>,
      },
      {
        path: 'products/create',
        element: <AdminProtectedRoute><AdminProductCreatePage /></AdminProtectedRoute>,
      },
      {
        path: 'products-import',
        element: <AdminProtectedRoute><ProductsImportPage /></AdminProtectedRoute>,
      },
      {
        path: 'categories',
        element: <AdminProtectedRoute><AdminCategoriesPage /></AdminProtectedRoute>,
      },
      {
        path: 'categories/edit/:id',
        element: <AdminProtectedRoute><CategoryEditPage /></AdminProtectedRoute>,
      },
      {
        path: 'categories/create',
        element: <AdminProtectedRoute><CategoryCreatePage /></AdminProtectedRoute>,
      },
      {
        path: 'orders',
        element: <AdminProtectedRoute><AdminOrdersPage /></AdminProtectedRoute>,
      },
      {
        path: 'orders/:id',
        element: <AdminProtectedRoute><AdminOrderDetailsPage /></AdminProtectedRoute>,
      },
      {
        path: 'users',
        element: <AdminProtectedRoute><AdminUsersPage /></AdminProtectedRoute>,
      },
      {
        path: 'deposits',
        element: <AdminProtectedRoute><AdminDepositsPage /></AdminProtectedRoute>,
      },
      {
        path: 'deposits/:id',
        element: <AdminProtectedRoute><DepositDetailsPage /></AdminProtectedRoute>,
      },
      {
        path: 'reports',
        element: <AdminProtectedRoute><AdminReportsPage /></AdminProtectedRoute>,
      },
      {
        path: 'integrations',
        element: <AdminProtectedRoute><AdminIntegrationsPage /></AdminProtectedRoute>,
      },
      {
        path: 'api-monitoring',
        element: <AdminProtectedRoute><AdminAPIMonitoringPage /></AdminProtectedRoute>,
      },
      {
        path: 'exchange-rates',
        element: <AdminProtectedRoute><AdminExchangeRatesPage /></AdminProtectedRoute>,
      },
      {
        path: "discount-analytics",
        element: <AdminProtectedRoute><DiscountAnalyticsPage /></AdminProtectedRoute>,
      },
    ],
  },
]);

export default router;
