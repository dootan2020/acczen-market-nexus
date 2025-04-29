
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './providers/CartProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from './contexts/ThemeContext';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="digital-deals-theme">
        <CartProvider>
          <TooltipProvider>
            <App />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
