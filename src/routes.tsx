
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AdminCategories from './pages/admin/AdminCategories';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/OrdersPage';
import AdminHome from './pages/admin/AdminHome';
import AdminDeposits from './pages/admin/AdminDeposits';
import Cart from './pages/Cart';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import PrivateRoute from './components/PrivateRoute';
import CheckoutPage from './pages/CheckoutPage';
import OrderCompletePage from './pages/OrderCompletePage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import PurchasesPage from './pages/PurchasesPage';
import AdminProductImport from './pages/admin/ProductsImport';
import AdminProductIntegration from './pages/admin/ProductIntegration';
import Deposit from './pages/Deposit';
import DepositPending from './pages/DepositPending';
import DepositSuccess from './pages/DepositSuccess';
import AdminApiMonitoring from './pages/admin/AdminApiMonitoring';
import AccountPage from './pages/AccountPage';
import TransactionsPage from './pages/TransactionsPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-complete" element={<OrderCompletePage />} />
        
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
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="dashboard/purchases"
          element={
            <PrivateRoute>
              <PurchasesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="dashboard/orders/:id"
          element={
            <PrivateRoute>
              <OrderDetailsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="dashboard/account"
          element={
            <PrivateRoute>
              <AccountPage />
            </PrivateRoute>
          }
        />
        <Route
          path="dashboard/transactions"
          element={
            <PrivateRoute>
              <TransactionsPage />
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
