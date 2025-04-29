import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailsPage from '@/pages/ProductDetailsPage';
import CategoriesPage from '@/pages/CategoriesPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminLayout from '@/components/AdminLayout';
import AdminHomePage from '@/pages/admin/AdminHomePage';
import AdminProductsPage from '@/pages/admin/AdminProductsPage';
import AdminCategoriesPage from '@/pages/admin/AdminCategoriesPage';
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage';
import AdminUsersPage from '@/pages/admin/UsersPage';
import AdminDepositsPage from '@/pages/admin/AdminDepositsPage';
import AdminReportsPage from '@/pages/admin/AdminReportsPage';
import AdminIntegrationsPage from '@/pages/admin/AdminIntegrationsPage';
import AdminAPIMonitoringPage from '@/pages/admin/AdminAPIMonitoringPage';
import AdminExchangeRatesPage from '@/pages/admin/AdminExchangeRatesPage';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import ProductsImportPage from '@/pages/admin/ProductsImportPage';
import { useAuth } from '@/contexts/AuthContext';
import AdminProductEditPage from '@/pages/admin/AdminProductEditPage';
import CategoryEditPage from '@/pages/admin/CategoryEditPage';
import AdminOrderDetailsPage from '@/pages/admin/AdminOrderDetailsPage';
import DepositDetailsPage from '@/pages/admin/DepositDetailsPage';
import AdminProductCreatePage from '@/pages/admin/AdminProductCreatePage';
import CategoryCreatePage from '@/pages/admin/CategoryCreatePage';
import DiscountAnalyticsPage from '@/pages/admin/DiscountAnalyticsPage';

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
      // Inside the AdminLayout route definition, add a new route for discount analytics
      {
        path: "discount-analytics",
        element: <AdminProtectedRoute><DiscountAnalyticsPage /></AdminProtectedRoute>,
      },
    ],
  },
]);

export default router;
