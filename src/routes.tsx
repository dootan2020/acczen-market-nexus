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

// This component is kept for reference but is not used anymore
const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes content removed as it's now in App.tsx */}
    </Routes>
  );
};

export default AppRoutes;
