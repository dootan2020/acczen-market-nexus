
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from './contexts/ThemeContext';
import { UIProvider } from './contexts/UIContext';
import App from './App.tsx';
import './index.css';

// Make sure the root element exists
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// Create the React root and render the app
createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="digital-deals-theme">
        <UIProvider>
          <TooltipProvider>
            <App />
          </TooltipProvider>
        </UIProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
