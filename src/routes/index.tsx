
import React from 'react';
import HomePage from '../pages/home';
import ProductDetail from '../pages/ProductDetail';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import ProductsPage from '../pages/products';
import CategoryPage from '../pages/category';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminLogin from '../pages/admin/AdminLogin';
import AdminProtectedRoute from '../components/AdminProtectedRoute';
import PrivateRoute from '../components/PrivateRoute';
import UserOrdersPage from '../pages/user/Orders';
import UserProfilePage from '../pages/user/Profile';
import UserDepositPage from '../pages/user/Deposit';
import CheckoutPage from '../pages/checkout';
import AdminDiscounts from '../pages/admin/AdminDiscounts';
import InventoryMonitoring from '../pages/admin/InventoryMonitoring';
import AdminMonitoring from '../pages/admin/AdminMonitoring';
import OrderSuccessPage from '../pages/OrderSuccess';
import OrderDetailPage from '../pages/user/OrderDetail';

// Main routes that are accessible without authentication
const mainRoutes = [
  { path: '/', element: <HomePage /> },
  { path: '/products', element: <ProductsPage /> },
  { path: '/category/:slug', element: <CategoryPage /> },
  { path: '/product/:slug', element: <ProductDetail /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/order/success', element: <OrderSuccessPage /> },
  { path: '/checkout', element: <CheckoutPage /> },
];

// Dashboard routes that require authentication
const dashboardRoutes = [
  { path: '/user/profile', element: <PrivateRoute element={<UserProfilePage />} /> },
  { path: '/user/orders', element: <PrivateRoute element={<UserOrdersPage />} /> },
  { path: '/user/order/:id', element: <PrivateRoute element={<OrderDetailPage />} /> },
  { path: '/deposit', element: <PrivateRoute element={<UserDepositPage />} /> },
];

// Admin routes that require admin authentication
const adminRoutes = [
  { path: '/admin', element: <AdminProtectedRoute element={<AdminDashboard />} /> },
  { path: '/admin/products', element: <AdminProtectedRoute element={<AdminProducts />} /> },
  { path: '/admin/categories', element: <AdminProtectedRoute element={<AdminCategories />} /> },
  { path: '/admin/orders', element: <AdminProtectedRoute element={<AdminOrders />} /> },
  { path: '/admin/users', element: <AdminProtectedRoute element={<AdminUsers />} /> },
  { path: '/admin/discounts', element: <AdminProtectedRoute element={<AdminDiscounts />} /> },
  { path: '/admin/inventory', element: <AdminProtectedRoute element={<InventoryMonitoring />} /> },
  { path: '/admin/monitoring', element: <AdminProtectedRoute element={<AdminMonitoring />} /> },
  { path: '/admin/login', element: <AdminLogin /> },
];

export default { mainRoutes, dashboardRoutes, adminRoutes };
