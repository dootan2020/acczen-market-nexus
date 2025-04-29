
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminLayout from './components/AdminLayout';

// Public Pages
import Home from './pages/Index';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderComplete from './pages/OrderComplete';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Deposit from './pages/Deposit';
import DepositPending from './pages/DepositPending';
import DepositSuccess from './pages/DepositSuccess';
import LoyaltyProgram from './pages/LoyaltyProgram';

// Dashboard Pages
import Dashboard from './pages/Dashboard';
import PurchasesPage from './pages/PurchasesPage';
import OrderDetailPage from './pages/OrderDetail';
import AccountPage from './pages/AccountPage';
import TransactionsPage from './pages/TransactionsPage';
import LoyaltyPage from './pages/dashboard/LoyaltyPage';

// Admin Pages
import AdminHome from './pages/admin/AdminHome';
import AdminCategories from './pages/admin/AdminCategories';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductsImport from './pages/admin/ProductsImport';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDeposits from './pages/admin/AdminDeposits';
import ReportsPage from './pages/admin/ReportsPage';
import ProductIntegration from './pages/admin/ProductIntegration';
import ApiMonitoring from './pages/admin/ApiMonitoring';
import ExchangeRates from './pages/admin/AdminExchangeRates';
import LoyaltyProgramPage from './pages/admin/LoyaltyProgramPage';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CurrencyProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                {/* Public Routes */}
                <Route index element={<Home />} />
                <Route path="products" element={<Products />} />
                <Route path="products/:slug" element={<ProductDetail />} />
                <Route path="cart" element={<Cart />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="order-complete" element={<OrderComplete />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />
                <Route path="deposit" element={<Deposit />} />
                <Route path="deposit/pending" element={<DepositPending />} />
                <Route path="deposit/success" element={<DepositSuccess />} />
                <Route path="loyalty-program" element={<LoyaltyProgram />} />

                {/* Protected Routes */}
                <Route path="dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="dashboard/purchases" element={<PrivateRoute><PurchasesPage /></PrivateRoute>} />
                <Route path="dashboard/orders/:id" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
                <Route path="dashboard/account" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
                <Route path="dashboard/transactions" element={<PrivateRoute><TransactionsPage /></PrivateRoute>} />
                <Route path="dashboard/loyalty" element={<PrivateRoute><LoyaltyPage /></PrivateRoute>} />

                {/* Admin Routes */}
                <Route path="admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
                  <Route index element={<AdminHome />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products-import" element={<AdminProductsImport />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="deposits" element={<AdminDeposits />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="integrations" element={<ProductIntegration />} />
                  <Route path="api-monitoring" element={<ApiMonitoring />} />
                  <Route path="exchange-rates" element={<ExchangeRates />} />
                  <Route path="marketing/loyalty" element={<LoyaltyProgramPage />} />
                </Route>
              </Route>
            </Routes>
          </Router>
          <Toaster />
        </CurrencyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
