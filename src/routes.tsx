
import React from 'react';
import Index from './pages/Index';
import Products from './pages/Products';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/Dashboard';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import Help from './pages/Help';
import Categories from './pages/Categories';
import HowItWorks from './pages/HowItWorks';
import Support from './pages/Support';
import DepositPage from './pages/Deposit';
import TransactionsPage from './pages/TransactionsPage';
import PurchasesPage from './pages/PurchasesPage';
import OrderDetail from './pages/OrderDetail';
import NotFound from './pages/NotFound';

// Import admin pages
import AdminHome from './pages/admin/AdminHome';
import ProductsPage from './pages/admin/ProductsPage';
import APIMonitoringPage from './pages/admin/APIMonitoringPage';
import ProductsImport from './pages/admin/ProductsImport';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import UsersPage from './pages/admin/UsersPage';
import DepositsPage from './pages/admin/DepositsPage';
import ReportsPage from './pages/admin/ReportsPage';
import AdminExchangeRates from './pages/admin/AdminExchangeRates';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminSettings from './pages/admin/AdminSettings';
import DiscountAnalyticsPage from './pages/admin/DiscountAnalyticsPage';

// Define placeholders for routes that are missing actual components
const ProfilePage = () => <div className="container mx-auto p-8"><h1 className="text-3xl font-bold mb-6">Trang Cá Nhân</h1><p>Trang đang được xây dựng.</p></div>;
const ContactPage = () => <div className="container mx-auto p-8"><h1 className="text-3xl font-bold mb-6">Liên Hệ</h1><p>Trang đang được xây dựng.</p></div>;
const AdminIntegrationsPage = () => <div className="container mx-auto p-8"><h1 className="text-3xl font-bold mb-6">Admin Integrations</h1><p>Trang đang được xây dựng.</p></div>;
const CategoryEditPage = () => <div className="container mx-auto p-8"><h1 className="text-3xl font-bold mb-6">Category Edit</h1><p>Trang đang được xây dựng.</p></div>;
const AdminOrderDetailsPage = () => <div className="container mx-auto p-8"><h1 className="text-3xl font-bold mb-6">Admin Order Details</h1><p>Trang đang được xây dựng.</p></div>;
const DepositDetailsPage = () => <div className="container mx-auto p-8"><h1 className="text-3xl font-bold mb-6">Deposit Details</h1><p>Trang đang được xây dựng.</p></div>;
const AdminProductEditPage = () => <div className="container mx-auto p-8"><h1 className="text-3xl font-bold mb-6">Admin Product Edit</h1><p>Trang đang được xây dựng.</p></div>;
const AdminProductCreatePage = () => <div className="container mx-auto p-8"><h1 className="text-3xl font-bold mb-6">Admin Product Create</h1><p>Trang đang được xây dựng.</p></div>;
const CategoryCreatePage = () => <div className="container mx-auto p-8"><h1 className="text-3xl font-bold mb-6">Category Create</h1><p>Trang đang được xây dựng.</p></div>;
const CartPage = () => <div className="container mx-auto p-8"><h1 className="text-3xl font-bold mb-6">Giỏ Hàng</h1><p>Trang đang được xây dựng.</p></div>;
const CheckoutPage = () => <div className="container mx-auto p-8"><h1 className="text-3xl font-bold mb-6">Thanh Toán</h1><p>Trang đang được xây dựng.</p></div>;

// Define routes that should use the main Layout (with Header and Footer)
const mainRoutes = [
  { path: '/', element: <Index /> },
  { path: '/products', element: <Products /> },
  { path: '/categories', element: <Categories /> },
  { path: '/how-it-works', element: <HowItWorks /> },
  { path: '/support', element: <Support /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/help', element: <Help /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/update-password', element: <UpdatePasswordPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
];

// Define routes for dashboard that require authentication
const dashboardRoutes = [
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/profile', element: <ProfilePage /> },
  { path: '/deposit', element: <DepositPage /> },
  { path: '/transactions', element: <TransactionsPage /> },
  { path: '/purchases', element: <PurchasesPage /> },
  { path: '/order/:id', element: <OrderDetail /> },
  { path: '/cart', element: <CartPage /> },
  { path: '/checkout', element: <CheckoutPage /> },
];

// Define routes for admin section that might have their own layout
const adminRoutes = [
  { path: '/admin', element: <AdminHome /> },
  { path: '/admin/products', element: <ProductsPage /> },
  { path: '/admin/products/edit/:id', element: <AdminProductEditPage /> },
  { path: '/admin/products/create', element: <AdminProductCreatePage /> },
  { path: '/admin/products-import', element: <ProductsImport /> },
  { path: '/admin/categories', element: <AdminCategories /> },
  { path: '/admin/categories/edit/:id', element: <CategoryEditPage /> },
  { path: '/admin/categories/create', element: <CategoryCreatePage /> },
  { path: '/admin/orders', element: <AdminOrders /> },
  { path: '/admin/orders/:id', element: <AdminOrderDetailsPage /> },
  { path: '/admin/users', element: <UsersPage /> },
  { path: '/admin/deposits', element: <DepositsPage /> },
  { path: '/admin/deposits/:id', element: <DepositDetailsPage /> },
  { path: '/admin/reports', element: <ReportsPage /> },
  { path: '/admin/integrations', element: <AdminIntegrationsPage /> },
  { path: '/admin/api-monitoring', element: <APIMonitoringPage /> },
  { path: '/admin/exchange-rates', element: <AdminExchangeRates /> },
  { path: '/admin/discount-analytics', element: <DiscountAnalyticsPage /> },
  { path: '/admin/transactions', element: <AdminTransactions /> },
  { path: '/admin/settings', element: <AdminSettings /> },
];

// Combine all routes for export
const routes = {
  mainRoutes,
  dashboardRoutes,
  adminRoutes
};

export default routes;
