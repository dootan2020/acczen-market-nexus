import React from 'react';
import { BrowserRouter, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { publicRoutes, authRoutes, adminRoutes } from './routes';
import { RouteWithLayout } from './layouts/RouteWithLayout';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { AdminLayout } from './layouts/AdminLayout';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { Toaster } from './components/ui/toaster';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <CurrencyProvider>
              <QueryClientProvider client={queryClient}>
                <PaymentProvider>
                  <BrowserRouter>
                    <Routes>
                      {publicRoutes.map((route, index) => (
                        <RouteWithLayout
                          key={index}
                          path={route.path}
                          element={route.element}
                          layout={MainLayout}
                        />
                      ))}
                      {authRoutes.map((route, index) => (
                        <RouteWithLayout
                          key={index}
                          path={route.path}
                          element={route.element}
                          layout={AuthLayout}
                        />
                      ))}
                      {adminRoutes.map((route, index) => (
                        <RouteWithLayout
                          key={index}
                          path={route.path}
                          element={route.element}
                          layout={AdminLayout}
                        />
                      ))}
                    </Routes>
                    <Toaster />
                  </BrowserRouter>
                </PaymentProvider>
              </QueryClientProvider>
            </CurrencyProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
