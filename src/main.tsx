
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ReactQueryProvider } from '@/contexts/ReactQueryContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/providers/CartProvider';
import App from './App';
import './index.css';

// Make sure the root element exists
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// Create the React root and render the app with all required providers
// Order matters: ReactQueryProvider (outermost) -> AuthProvider -> CartProvider -> App
createRoot(rootElement).render(
  <React.StrictMode>
    <ReactQueryProvider>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </ReactQueryProvider>
  </React.StrictMode>
);
