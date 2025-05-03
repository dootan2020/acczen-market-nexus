
import React from 'react';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductPage from './pages/ProductPage';
import CategoryPage from './pages/CategoryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CheckoutPage from './pages/CheckoutPage';
import CartPage from './pages/CartPage';
import AccountPage from './pages/AccountPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminProductEdit from './pages/admin/AdminProductEdit';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCategoryEdit from './pages/admin/AdminCategoryEdit';
import AdminDeposits from './pages/admin/AdminDeposits';
import NotFoundPage from './pages/NotFoundPage';
import TransactionsPage from './pages/TransactionsPage';
import DepositPage from './pages/Deposit';
import DepositPending from './pages/DepositPending';
import DepositSuccess from './pages/DepositSuccess';

// Main routes accessible to everyone
const mainRoutes = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/products',
    element: <ProductsPage />,
  },
  {
    path: '/product/:slug',
    element: <ProductPage />,
  },
  {
    path: '/category/:slug',
    element: <CategoryPage />,
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
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/cart',
    element: <CartPage />,
  },
  {
    path: '/checkout',
    element: <CheckoutPage />,
  },
  {
    path: '/account',
    element: <AccountPage />,
  },
  {
    path: '/deposit',
    element: <DepositPage />,
  },
  {
    path: '/deposit/pending',
    element: <DepositPending />,
  },
  {
    path: '/deposit/success',
    element: <DepositSuccess />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

// Dashboard routes (for authenticated users)
const dashboardRoutes = [
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/dashboard/orders',
    element: <OrdersPage />,
  },
  {
    path: '/dashboard/orders/:id',
    element: <OrderDetailPage />,
  },
  {
    path: '/dashboard/transactions',
    element: <TransactionsPage />,
  },
];

// Admin routes (for admin users only)
const adminRoutes = [
  {
    path: '/admin',
    element: <AdminDashboard />,
  },
  {
    path: '/admin/products',
    element: <AdminProducts />,
  },
  {
    path: '/admin/products/edit/:id',
    element: <AdminProductEdit />,
  },
  {
    path: '/admin/categories',
    element: <AdminCategories />,
  },
  {
    path: '/admin/categories/edit/:id',
    element: <AdminCategoryEdit />,
  },
  {
    path: '/admin/orders',
    element: <AdminOrders />,
  },
  {
    path: '/admin/deposits',
    element: <AdminDeposits />,
  },
  {
    path: '/admin/orders/:id',
    element: <AdminOrderDetail />,
  },
  {
    path: '/admin/users',
    element: <AdminUsers />,
  },
  {
    path: '/admin/users/:id',
    element: <AdminUserDetail />,
  },
  {
    path: '/admin/settings',
    element: <AdminSettings />,
  },
];

export default {
  mainRoutes,
  dashboardRoutes,
  adminRoutes,
};
