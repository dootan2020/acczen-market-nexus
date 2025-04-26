import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import AdminLayout from './components/AdminLayout';
import AdminGuard from './components/AdminGuard';
import ProductsPage from './pages/admin/ProductsPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import OrdersPage from './pages/admin/OrdersPage';
import UsersPage from './pages/admin/UsersPage';
import DepositsPage from './pages/admin/DepositsPage';
import ReportsPage from './pages/admin/ReportsPage';
import IntegrationsPage from './pages/admin/IntegrationsPage';
import APIMonitoringPage from './pages/admin/APIMonitoringPage';
import ProductEditPage from './pages/admin/ProductEditPage';
import CategoryEditPage from './pages/admin/CategoryEditPage';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import ProductsImportPage from './pages/admin/ProductsImportPage';
import AdminExchangeRates from './pages/admin/AdminExchangeRates';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { ReactQueryProvider } from './contexts/ReactQueryContext';
import ApiLogsPage from './pages/admin/ApiLogsPage';
import { CurrencyIcon } from 'lucide-react';

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/update-password",
    element: <UpdatePasswordPage />,
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/dashboard/*",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <AdminGuard>
        <AdminLayout />
      </AdminGuard>
    ),
    children: [
      {
        index: true,
        element: <AdminProtectedRoute><ProductsPage /></AdminProtectedRoute>,
      },
      {
        path: "products",
        element: <AdminProtectedRoute><ProductsPage /></AdminProtectedRoute>,
      },
      {
        path: "products/edit/:id",
        element: <AdminProtectedRoute><ProductEditPage /></AdminProtectedRoute>,
      },
      {
        path: "products-import",
        element: <AdminProtectedRoute><ProductsImportPage /></AdminProtectedRoute>,
      },
      {
        path: "categories",
        element: <AdminProtectedRoute><CategoriesPage /></AdminProtectedRoute>,
      },
      {
        path: "categories/edit/:id",
        element: <AdminProtectedRoute><CategoryEditPage /></AdminProtectedRoute>,
      },
      {
        path: "orders",
        element: <AdminProtectedRoute><OrdersPage /></AdminProtectedRoute>,
      },
      {
        path: "users",
        element: <AdminProtectedRoute><UsersPage /></AdminProtectedRoute>,
      },
      {
        path: "deposits",
        element: <AdminProtectedRoute><DepositsPage /></AdminProtectedRoute>,
      },
      {
        path: "reports",
        element: <AdminProtectedRoute><ReportsPage /></AdminProtectedRoute>,
      },
      {
        path: "integrations",
        element: <AdminProtectedRoute><IntegrationsPage /></AdminProtectedRoute>,
      },
      {
        path: "api-monitoring",
        element: <AdminProtectedRoute><APIMonitoringPage /></AdminProtectedRoute>,
      },
      {
        path: "api-logs",
        element: <AdminProtectedRoute><ApiLogsPage /></AdminProtectedRoute>,
      },
    ],
  },
  {
    path: "/admin/exchange-rates",
    element: <AdminGuard><AdminExchangeRates /></AdminGuard>
  },
]);

function App() {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <CurrencyProvider>
          <RouterProvider router={router} />
        </CurrencyProvider>
      </AuthProvider>
    </ReactQueryProvider>
  );
}

export default App;
