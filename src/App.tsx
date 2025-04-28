
import React from 'react';
import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { ReactQueryProvider } from './contexts/ReactQueryContext';
import { Toaster } from 'sonner';

function App() {
  return (
    <ReactQueryProvider>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <CurrencyProvider>
            <PaymentProvider>
              <AppRoutes />
              <Toaster />
            </PaymentProvider>
          </CurrencyProvider>
        </AuthProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  );
}

export default App;
