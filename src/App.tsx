
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import routes from './routes';
import './App.css';
import { ThemeProvider } from './components/ui/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './providers/CartProvider';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { ProductProvider } from './contexts/ProductContext';

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="digital-deals-hub-theme">
        <BrowserRouter>
          <AuthProvider>
            <CurrencyProvider>
              <CartProvider>
                <ProductProvider>
                  <Toaster closeButton />
                  <Routes>
                    <Route element={<Layout />}>
                      {routes.mainRoutes.map((route) => (
                        <Route key={route.path} path={route.path} element={route.element} />
                      ))}
                      {routes.dashboardRoutes.map((route) => (
                        <Route key={route.path} path={route.path} element={route.element} />
                      ))}
                    </Route>
                    {routes.adminRoutes.map((route) => (
                      <Route key={route.path} path={route.path} element={route.element} />
                    ))}
                  </Routes>
                </ProductProvider>
              </CartProvider>
            </CurrencyProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
