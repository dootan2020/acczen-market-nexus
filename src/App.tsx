
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './providers/CartProvider';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { PaymentProvider } from './contexts/PaymentContext';
import router from './routes';
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
                      <Route path="/*" element={<RouterOutlet />} />
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

// This is a temporary component to make the router work
// while we're fixing the routing structure
const RouterOutlet = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white rounded shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-primary mb-4">Digital Deals Hub</h1>
        <p className="mb-4">The application is being set up. Please check back soon.</p>
        <p className="text-sm text-muted-foreground">
          Router configuration is being updated.
        </p>
      </div>
    </div>
  );
};

export default App;
