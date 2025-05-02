
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ReactQueryProvider } from '@/contexts/ReactQueryContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/providers/CartProvider';
import { CurrencyContextProvider } from '@/contexts/CurrencyContextProvider';
import App from './App';
import './index.css';

// Make sure the root element exists
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// Create the React root and render the app with all required providers
createRoot(rootElement).render(
  <ReactQueryProvider>
    <AuthProvider>
      <CartProvider>
        <CurrencyContextProvider>
          <App />
        </CurrencyContextProvider>
      </CartProvider>
    </AuthProvider>
  </ReactQueryProvider>
);
