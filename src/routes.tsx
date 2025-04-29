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
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/error/ErrorBoundary';

import { lazy, Suspense } from 'react';

// Loading fallback component with improved design
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <div className="flex flex-col items-center space-y-4">
      <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      <p className="text-muted-foreground">Đang tải...</p>
    </div>
  </div>
);

// Improved code splitting with custom chunk naming and priority hints
const DashboardPage = React.lazy(() => import(/* webpackChunkName: "dashboard" */ /* webpackPrefetch: true */ './pages/Dashboard'));
const ProductsPage = React.lazy(() => import(/* webpackChunkName: "products" */ /* webpackPrefetch: true */ './pages/Products'));
const ProductDetailPage = React.lazy(() => import(/* webpackChunkName: "product-detail" */ './pages/ProductDetail'));
const CheckoutPage = React.lazy(() => import(/* webpackChunkName: "checkout" */ './pages/Checkout'));
const OrderCompletePage = React.lazy(() => import(/* webpackChunkName: "order-complete" */ './pages/OrderComplete'));
const OrderDetail = React.lazy(() => import(/* webpackChunkName: "order-detail" */ './pages/OrderDetail'));
const PurchasesPage = React.lazy(() => import(/* webpackChunkName: "purchases" */ './pages/PurchasesPage'));
const AccountPage = React.lazy(() => import(/* webpackChunkName: "account" */ './pages/AccountPage'));
const TransactionsPage = React.lazy(() => import(/* webpackChunkName: "transactions" */ './pages/TransactionsPage'));

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ErrorBoundary><Index /></ErrorBoundary>} />
        <Route path="login" element={<ErrorBoundary><LoginPage /></ErrorBoundary>} />
        <Route path="register" element={<ErrorBoundary><RegisterPage /></ErrorBoundary>} />
        <Route path="products" element={
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <ProductsPage />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="products/:slug" element={
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <ProductDetailPage />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="cart" element={<ErrorBoundary><Cart /></ErrorBoundary>} />
        <Route path="checkout" element={
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <CheckoutPage />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="order-complete" element={
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <OrderCompletePage />
            </Suspense>
          </ErrorBoundary>
        } />
        
        {/* Deposit related routes */}
        <Route
          path="deposit"
          element={
            <PrivateRoute>
              <ErrorBoundary>
                <Deposit />
              </ErrorBoundary>
            </PrivateRoute>
          }
        />
        <Route
          path="deposit/pending"
          element={
            <PrivateRoute>
              <ErrorBoundary>
                <DepositPending />
              </ErrorBoundary>
            </PrivateRoute>
          }
        />
        <Route
          path="deposit/success"
          element={
            <PrivateRoute>
              <ErrorBoundary>
                <DepositSuccess />
              </ErrorBoundary>
            </PrivateRoute>
          }
        />

        {/* Dashboard routes */}
        <Route
          path="dashboard"
          element={
            <PrivateRoute>
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <DashboardPage />
                </Suspense>
              </ErrorBoundary>
            </PrivateRoute>
          }
        />
        <Route
          path="dashboard/purchases"
          element={
            <PrivateRoute>
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <PurchasesPage />
                </Suspense>
              </ErrorBoundary>
            </PrivateRoute>
          }
        />
        <Route
          path="dashboard/orders/:id"
          element={
            <PrivateRoute>
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <OrderDetail />
                </Suspense>
              </ErrorBoundary>
            </PrivateRoute>
          }
        />
        <Route
          path="dashboard/account"
          element={
            <PrivateRoute>
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <AccountPage />
                </Suspense>
              </ErrorBoundary>
            </PrivateRoute>
          }
        />
        <Route
          path="dashboard/transactions"
          element={
            <PrivateRoute>
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <TransactionsPage />
                </Suspense>
              </ErrorBoundary>
            </PrivateRoute>
          }
        />
        
        {/* 404 page */}
        <Route path="*" element={<ErrorBoundary><NotFound /></ErrorBoundary>} />
      </Route>

      {/* Admin routes - with improved AdminGuard */}
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <ErrorBoundary>
              <AdminLayout />
            </ErrorBoundary>
          </AdminGuard>
        }
      >
        <Route index element={<AdminHome />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products-import" element={<ProductsImport />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="deposits" element={<AdminDeposits />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="integrations" element={<ProductIntegration />} />
        <Route path="api-monitoring" element={<AdminApiMonitoring />} />
        <Route path="exchange-rates" element={<AdminExchangeRates />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
