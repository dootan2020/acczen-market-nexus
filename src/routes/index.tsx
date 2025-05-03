
import React from 'react';

// Placeholder components for missing pages
const HomePage = () => <div>Home Page</div>;
const ProductDetail = () => <div>Product Detail</div>;
const LoginPage = () => <div>Login Page</div>;
const SignupPage = () => <div>Signup Page</div>;
const ProductsPage = () => <div>Products Page</div>;
const CategoryPage = () => <div>Category Page</div>;
const AdminDashboard = () => <div>Admin Dashboard</div>;
const AdminProducts = () => <div>Admin Products</div>;
const AdminCategories = () => <div>Admin Categories</div>;
const AdminOrders = () => <div>Admin Orders</div>;
const AdminUsers = () => <div>Admin Users</div>;
const AdminLogin = () => <div>Admin Login</div>;
const AdminProtectedRoute = ({ element }: { element: React.ReactNode }) => <>{element}</>;
const PrivateRoute = ({ element }: { element: React.ReactNode }) => <>{element}</>;
const UserOrdersPage = () => <div>User Orders Page</div>;
const UserProfilePage = () => <div>User Profile Page</div>;
const UserDepositPage = () => <div>User Deposit Page</div>;
const CheckoutPage = () => <div>Checkout Page</div>;
const AdminDiscounts = () => <div>Admin Discounts</div>;
const InventoryMonitoring = () => <div>Inventory Monitoring</div>;
const AdminMonitoring = () => <div>Admin Monitoring</div>;
const OrderSuccessPage = () => <div>Order Success Page</div>;
const OrderDetailPage = () => <div>Order Detail Page</div>;

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
