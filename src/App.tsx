
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import AppRoutes from './routes';
import { Toaster } from 'sonner';
import { CartProvider } from './providers/CartProvider';
import ErrorBoundary from './components/error/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <CartProvider>
          <AppRoutes />
          <Toaster />
        </CartProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
