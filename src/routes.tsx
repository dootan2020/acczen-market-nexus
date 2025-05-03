
import React from 'react';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

// Create stub components for missing pages
const ProductsPage = () => <div>Products Page</div>;
const ProductPage = () => <div>Product Page</div>;
const CategoryPage = () => <div>Category Page</div>;
const LoginPage = () => <div>Login Page</div>;
const RegisterPage = () => <div>Register Page</div>;
const ResetPasswordPage = () => <div>Reset Password Page</div>;
const CheckoutPage = () => <div>Checkout Page</div>;
const CartPage = () => <div>Cart Page</div>;
const AccountPage = () => <div>Account Page</div>;
const OrdersPage = () => <div>Orders Page</div>;
const OrderDetailPage = () => <div>Order Detail Page</div>;
const Dashboard = () => <div>Dashboard</div>;
const AdminDashboard = () => <div>Admin Dashboard</div>;
const AdminProducts = () => <div>Admin Products</div>;
const AdminOrders = () => <div>Admin Orders</div>;
const AdminOrderDetail = () => <div>Admin Order Detail</div>;
const AdminUsers = () => <div>Admin Users</div>;
const AdminUserDetail = () => <div>Admin User Detail</div>;
const AdminProductEdit = () => <div>Admin Product Edit</div>;
const AdminSettings = () => <div>Admin Settings</div>;
const AdminCategories = () => <div>Admin Categories</div>;
const AdminCategoryEdit = () => <div>Admin Category Edit</div>;
const AdminDeposits = () => <div>Admin Deposits</div>;
const TransactionsPage = () => <div>Transactions Page</div>;
const DepositPage = () => <div>Deposit Page</div>;
const DepositPending = () => <div>Deposit Pending</div>;
const DepositSuccess = () => <div>Deposit Success</div>;

// Main routes accessible to everyone
const mainRoutes = [
  {
    path: '/',
    element: <Index />,
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
    element: <NotFound />,
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
