import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminCategories from './pages/admin/AdminCategories';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/OrdersPage';
import AdminHome from './pages/admin/AdminHome';
import AdminDeposits from './pages/admin/AdminDeposits';
import Cart from './pages/Cart';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import PrivateRoute from './components/PrivateRoute';
import Deposit from './pages/Deposit';
import DepositPending from './pages/DepositPending';
import DepositSuccess from './pages/DepositSuccess';
import AdminApiMonitoring from './pages/admin/AdminApiMonitoring';
import AdminProductImport from './pages/admin/ProductsImport';
import AdminProductIntegration from './pages/admin/ProductIntegration';

import { lazy, Suspense } from 'react';

// Use lazy loading for the missing components
const DashboardPage = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.default })));
const ProductsPage = lazy(() => import('./pages/Products').then(module => ({ default: module.default })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetail').then(module => ({ default: module.default })));
const CheckoutPage = lazy(() => import('./pages/Checkout').then(module => ({ default: module.default })));
const OrderCompletePage = lazy(() => import('./pages/OrderComplete').then(module => ({ default: module.default })));
const OrderDetailsPage = lazy(() => import('./pages/OrderDetail').then(module => ({ default: module.default })));
const PurchasesPage = lazy(() => import('./pages/PurchasesPage').then(module => ({ default: module.default })));
const AccountPage = lazy(() => import('./pages/AccountPage').then(module => ({ default: module.default })));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage').then(module => ({ default: module.default })));

// Loading fallback component
const LoadingFallback = () => <div className="p-8 text-center">Loading...</div>;

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
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

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<AdminHome />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/import" element={<AdminProductImport />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="deposits" element={<AdminDeposits />} />
        <Route path="integration" element={<AdminProductIntegration />} />
        <Route path="api-monitoring" element={<AdminApiMonitoring />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
