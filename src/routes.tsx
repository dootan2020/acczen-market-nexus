
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Index from './pages/Index';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminCategories from './pages/admin/AdminCategories';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/OrdersPage';
import AdminHome from './pages/admin/AdminHome';
import AdminDeposits from './pages/admin/AdminDeposits';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AdminExchangeRates from './pages/admin/AdminExchangeRates';
import Cart from './pages/Cart';
import AdminGuard from './components/AdminGuard';
import PrivateRoute from './components/PrivateRoute';
import Deposit from './pages/Deposit';
import DepositPending from './pages/DepositPending';
import DepositSuccess from './pages/DepositSuccess';
import AdminApiMonitoring from './pages/admin/AdminApiMonitoring';
import ProductsImport from './pages/admin/ProductsImport';
import ProductIntegration from './pages/admin/ProductIntegration';

import { lazy, Suspense } from 'react';

// Use lazy loading for the missing components
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const ProductsPage = lazy(() => import('./pages/Products'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetail'));
const CheckoutPage = lazy(() => import('./pages/Checkout'));
const OrderCompletePage = lazy(() => import('./pages/OrderComplete'));
const OrderDetailsPage = lazy(() => import('./pages/OrderDetail'));
const PurchasesPage = lazy(() => import('./pages/PurchasesPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));

// Loading fallback component
const LoadingFallback = () => <div className="p-8 text-center">Loading...</div>;

const AppRoutes = () => {
  // Debug log for route rendering
  console.log("Rendering AppRoutes component");
  
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Index />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="products" element={
          <Suspense fallback={<LoadingFallback />}>
            <ProductsPage />
          </Suspense>
        } />
        <Route path="products/:slug" element={
          <Suspense fallback={<LoadingFallback />}>
            <ProductDetailPage />
          </Suspense>
        } />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={
          <Suspense fallback={<LoadingFallback />}>
            <CheckoutPage />
          </Suspense>
        } />
        <Route path="order-complete" element={
          <Suspense fallback={<LoadingFallback />}>
            <OrderCompletePage />
          </Suspense>
        } />
        
        {/* Deposit related routes */}
        <Route
          path="deposit"
          element={
            <PrivateRoute>
              <Deposit />
            </PrivateRoute>
          }
        />
        <Route
          path="deposit/pending"
          element={
            <PrivateRoute>
              <DepositPending />
            </PrivateRoute>
          }
        />
        <Route
          path="deposit/success"
          element={
            <PrivateRoute>
              <DepositSuccess />
            </PrivateRoute>
          }
        />

        {/* Dashboard routes */}
        <Route
          path="dashboard"
          element={
            <PrivateRoute>
              <Suspense fallback={<LoadingFallback />}>
                <DashboardPage />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path="dashboard/purchases"
          element={
            <PrivateRoute>
              <Suspense fallback={<LoadingFallback />}>
                <PurchasesPage />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path="dashboard/orders/:id"
          element={
            <PrivateRoute>
              <Suspense fallback={<LoadingFallback />}>
                <OrderDetailsPage />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path="dashboard/account"
          element={
            <PrivateRoute>
              <Suspense fallback={<LoadingFallback />}>
                <AccountPage />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path="dashboard/transactions"
          element={
            <PrivateRoute>
              <Suspense fallback={<LoadingFallback />}>
                <TransactionsPage />
              </Suspense>
            </PrivateRoute>
          }
        />
      </Route>

      {/* Admin routes - with improved AdminGuard */}
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<AdminHome />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/import" element={<ProductsImport />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="deposits" element={<AdminDeposits />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="integration" element={<ProductIntegration />} />
        <Route path="api-monitoring" element={<AdminApiMonitoring />} />
        <Route path="exchange-rates" element={<AdminExchangeRates />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
