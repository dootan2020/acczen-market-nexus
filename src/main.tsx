
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { ReactQueryProvider } from './contexts/ReactQueryContext';
import App from './App.tsx';
import './index.css';

// Measure the initial load performance
const reportWebVitals = () => {
  if (window.performance) {
    const metrics = window.performance.getEntriesByType('navigation');
    if (metrics && metrics.length > 0) {
      console.info('Page load performance:', metrics[0]);
    }
  }
};

// Make sure the root element exists
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// Create the React root and render the app
createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="digital-deals-theme">
        <ReactQueryProvider>
          <AuthProvider>
            <CurrencyProvider>
              <PaymentProvider>
                <TooltipProvider>
                  <App />
                </TooltipProvider>
              </PaymentProvider>
            </CurrencyProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to measure performance
reportWebVitals();
