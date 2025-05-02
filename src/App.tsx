
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './providers/CartProvider';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { PaymentProvider } from './contexts/PaymentContext';
import router from './routes';
import Layout from './components/Layout';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { Toaster } from './components/ui/toaster';

// Create a QueryClient for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <CartProvider>
                <CurrencyProvider>
                  <PaymentProvider>
                    <Routes>
                      {router.routes.map((route) => (
                        <Route 
                          key={route.path}
                          path={route.path} 
                          element={
                            <Layout>
                              {route.element}
                            </Layout>
                          } 
                        />
                      ))}
                    </Routes>
                    <Toaster />
                  </PaymentProvider>
                </CurrencyProvider>
              </CartProvider>
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
