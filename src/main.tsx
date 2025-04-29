
import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from './contexts/ThemeContext';
import App from './App.tsx';
import router from './routes';
import './index.css';

// Make sure the root element exists
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// Create the React root and render the app
createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="digital-deals-theme">
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </ThemeProvider>
  </React.StrictMode>
);
