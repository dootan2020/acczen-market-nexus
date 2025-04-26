
import React from 'react';
import { Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <CurrencyProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/update-password" element={<UpdatePasswordPage />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/dashboard/*" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            
            <Route path="/admin" element={
              <AdminGuard>
                <AdminLayout />
              </AdminGuard>
            }>
              <Route index element={<AdminProtectedRoute><ProductsPage /></AdminProtectedRoute>} />
              <Route path="products" element={<AdminProtectedRoute><ProductsPage /></AdminProtectedRoute>} />
              <Route path="products/edit/:id" element={<AdminProtectedRoute><ProductEditPage /></AdminProtectedRoute>} />
              <Route path="products-import" element={<AdminProtectedRoute><ProductsImportPage /></AdminProtectedRoute>} />
              <Route path="categories" element={<AdminProtectedRoute><CategoriesPage /></AdminProtectedRoute>} />
              <Route path="categories/edit/:id" element={<AdminProtectedRoute><CategoryEditPage /></AdminProtectedRoute>} />
              <Route path="orders" element={<AdminProtectedRoute><OrdersPage /></AdminProtectedRoute>} />
              <Route path="users" element={<AdminProtectedRoute><UsersPage /></AdminProtectedRoute>} />
              <Route path="deposits" element={<AdminProtectedRoute><DepositsPage /></AdminProtectedRoute>} />
              <Route path="reports" element={<AdminProtectedRoute><ReportsPage /></AdminProtectedRoute>} />
              <Route path="integrations" element={<AdminProtectedRoute><IntegrationsPage /></AdminProtectedRoute>} />
              <Route path="api-monitoring" element={<AdminProtectedRoute><APIMonitoringPage /></AdminProtectedRoute>} />
              <Route path="api-logs" element={<AdminProtectedRoute><ApiLogsPage /></AdminProtectedRoute>} />
            </Route>
            
            <Route path="/admin/exchange-rates" element={
              <AdminGuard>
                <AdminExchangeRates />
              </AdminGuard>
            } />
          </Routes>
        </CurrencyProvider>
      </AuthProvider>
    </ReactQueryProvider>
  );
}

export default App;
