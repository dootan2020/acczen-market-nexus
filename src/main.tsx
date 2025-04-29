
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

// Đo lường hiệu suất tải trang ban đầu
const reportWebVitals = () => {
  if (window.performance) {
    const metrics = window.performance.getEntriesByType('navigation');
    if (metrics && metrics.length > 0) {
      console.info('Page load performance:', metrics[0]);
    }
  }
};

// Đăng ký service worker cho hỗ trợ PWA - chỉ trong môi trường production
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

// Đo lường Core Web Vitals - chỉ trong môi trường production
if (import.meta.env.PROD) {
  // Báo cáo FID và LCP
  const reportLCP = () => {
    const perfEntries = performance.getEntriesByType('navigation');
    if (perfEntries && perfEntries.length > 0) {
      const navEntry = perfEntries[0] as PerformanceNavigationTiming;
      const loadEventTime = navEntry.loadEventStart - navEntry.startTime;
      console.info(`Largest Contentful Paint: ${loadEventTime}ms`);
    }
  };

  // Sử dụng PerformanceObserver để theo dõi FID
  if ('PerformanceObserver' in window) {
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const fidEntry = entry as PerformanceEventTiming;
        console.info(`FID: ${fidEntry.processingStart - fidEntry.startTime}ms`);
      }
    }).observe({ type: 'first-input', buffered: true });
  }
  
  window.addEventListener('load', reportLCP);
}

// Đảm bảo phần tử root tồn tại
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// Tạo root React và render ứng dụng
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

// Nếu muốn đo lường hiệu suất
reportWebVitals();
