
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { ReactQueryProvider } from './contexts/ReactQueryContext';
import { Toaster } from 'sonner';
import { CartProvider } from './providers/CartProvider';
import ErrorBoundary from './components/error/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ReactQueryProvider>
          <ThemeProvider defaultTheme="light">
            <AuthProvider>
              <CurrencyProvider>
                <PaymentProvider>
                  <CartProvider>
                    <AppRoutes />
                    <Toaster />
                  </CartProvider>
                </PaymentProvider>
              </CurrencyProvider>
            </AuthProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
