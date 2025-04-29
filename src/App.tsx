
import React from 'react';
import { RouterProvider } from 'react-router-dom'; 
import router from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { ReactQueryProvider } from './contexts/ReactQueryContext';
import { Toaster } from 'sonner';
import { CartProvider } from './providers/CartProvider';

function App() {
  return (
    <ReactQueryProvider>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <CurrencyProvider>
            <PaymentProvider>
              <CartProvider>
                <RouterProvider router={router} />
                <Toaster />
              </CartProvider>
            </PaymentProvider>
          </CurrencyProvider>
        </AuthProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  );
}

export default App;
