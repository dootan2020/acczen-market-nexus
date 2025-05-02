
import React from 'react';
import { Outlet } from 'react-router-dom'; 
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { ReactQueryProvider } from './contexts/ReactQueryContext';
import { Toaster } from 'sonner';
import { CartProvider } from './providers/CartProvider';

function App() {
  // Fix: Ensure each provider wraps its children properly
  return (
    <ReactQueryProvider>
      <ThemeProvider defaultTheme="light" storageKey="digital-deals-theme">
        <AuthProvider>
          <CurrencyProvider>
            <PaymentProvider>
              <CartProvider>
                <Outlet />
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
