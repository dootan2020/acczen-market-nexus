
import React from 'react';

// Import your pages
import Index from './pages/Index';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import NotFound from './pages/NotFound';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderComplete from './pages/OrderComplete';
import OrderDetail from './pages/OrderDetail';
import Help from './pages/Help';

// Import private route components
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import AccountPage from './pages/AccountPage';
import PurchasesPage from './pages/PurchasesPage';
import TransactionsPage from './pages/TransactionsPage';
import Deposit from './pages/Deposit';
import DepositSuccess from './pages/DepositSuccess';
import DepositPending from './pages/DepositPending';

// Import admin pages
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminHome from './pages/admin/AdminHome';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSettings from './pages/admin/AdminSettings';
import AdminDeposits from './pages/admin/AdminDeposits';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminReports from './pages/admin/AdminReports';
import AdminExchangeRates from './pages/admin/AdminExchangeRates';
import ProductEditPage from './pages/admin/ProductEditPage';
import ProductsImport from './pages/admin/ProductsImport';
import CategoryEditPage from './pages/admin/CategoryEditPage';
import InventoryManagement from './pages/admin/InventoryManagement';
import DiscountAnalyticsPage from './pages/admin/DiscountAnalyticsPage';
import ApiMonitoring from './pages/admin/ApiMonitoring';

// Define route configurations
const routes = {
  mainRoutes: [
    { path: '/', element: <Index /> },
    { path: '/products', element: <Products /> },
    { path: '/product/:slug', element: <ProductDetail /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
    { path: '/reset-password', element: <ResetPasswordPage /> },
    { path: '/update-password', element: <UpdatePasswordPage /> },
    { path: '/cart', element: <Cart /> },
    { path: '/checkout', element: <Checkout /> },
    { path: '/order-complete/:id', element: <OrderComplete /> },
    { path: '/order/:id', element: <PrivateRoute element={<OrderDetail />} /> },
    { path: '/help', element: <Help /> },
    { path: '*', element: <NotFound /> },
  ],
  
  dashboardRoutes: [
    {
      path: '/dashboard',
      element: <PrivateRoute element={<Dashboard />} />,
    },
    {
      path: '/account',
      element: <PrivateRoute element={<AccountPage />} />,
    },
    {
      path: '/dashboard/purchases',
      element: <PrivateRoute element={<PurchasesPage />} />,
    },
    {
      path: '/dashboard/transactions',
      element: <PrivateRoute element={<TransactionsPage />} />,
    },
    {
      path: '/deposit',
      element: <PrivateRoute element={<Deposit />} />,
    },
    {
      path: '/deposit/success',
      element: <PrivateRoute element={<DepositSuccess />} />,
    },
    {
      path: '/deposit/pending',
      element: <PrivateRoute element={<DepositPending />} />,
    },
  ],
  
  adminRoutes: [
    { path: '/admin', element: <AdminProtectedRoute element={<AdminHome />} /> },
    { path: '/admin/dashboard', element: <AdminProtectedRoute element={<AdminDashboard />} /> },
    { path: '/admin/products', element: <AdminProtectedRoute element={<AdminProducts />} /> },
    { path: '/admin/products/edit/:id', element: <AdminProtectedRoute element={<ProductEditPage />} /> },
    { path: '/admin/products/import', element: <AdminProtectedRoute element={<ProductsImport />} /> },
    { path: '/admin/categories', element: <AdminProtectedRoute element={<AdminCategories />} /> },
    { path: '/admin/categories/edit/:id', element: <AdminProtectedRoute element={<CategoryEditPage />} /> },
    { path: '/admin/orders', element: <AdminProtectedRoute element={<AdminOrders />} /> },
    { path: '/admin/users', element: <AdminProtectedRoute element={<AdminUsers />} /> },
    { path: '/admin/deposits', element: <AdminProtectedRoute element={<AdminDeposits />} /> },
    { path: '/admin/transactions', element: <AdminProtectedRoute element={<AdminTransactions />} /> },
    { path: '/admin/reports', element: <AdminProtectedRoute element={<AdminReports />} /> },
    { path: '/admin/exchange-rates', element: <AdminProtectedRoute element={<AdminExchangeRates />} /> },
    { path: '/admin/settings', element: <AdminProtectedRoute element={<AdminSettings />} /> },
    { path: '/admin/inventory', element: <AdminProtectedRoute element={<InventoryManagement />} /> },
    { path: '/admin/discount-analytics', element: <AdminProtectedRoute element={<DiscountAnalyticsPage />} /> },
    { path: '/admin/api-monitoring', element: <AdminProtectedRoute element={<ApiMonitoring />} /> },
  ],
};

export default routes;
