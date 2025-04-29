
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { ReactQueryProvider } from './contexts/ReactQueryContext';
import { CartProvider } from './providers/CartProvider';
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

// Register service worker for PWA support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('ServiceWorker registration failed:', error);
      });
  });
}

// Performance monitoring for Core Web Vitals
if (import.meta.env.PROD) {
  // Report FID and LCP
  const reportLCP = () => {
    const perfEntries = performance.getEntriesByType('navigation');
    if (perfEntries && perfEntries.length > 0) {
      const navEntry = perfEntries[0];
      const loadEventTime = navEntry.loadEventStart - navEntry.startTime;
      console.info(`Largest Contentful Paint: ${loadEventTime}ms`);
    }
  };

  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      console.info(`FID: ${entry.processingStart - entry.startTime}ms`);
    }
  }).observe({ type: 'first-input', buffered: true });
  
  window.addEventListener('load', reportLCP);
}

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
                <CartProvider>
                  <TooltipProvider>
                    <App />
                  </TooltipProvider>
                </CartProvider>
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
