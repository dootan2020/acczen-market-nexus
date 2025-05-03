
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add error handling for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Add CORS error handling
const originalFetch = window.fetch;
window.fetch = async function(input, init) {
  try {
    return await originalFetch(input, init);
  } catch (error) {
    if (error.message && error.message.includes('CORS')) {
      console.warn('CORS error detected:', error);
      // Fall back to using the custom CORS proxy utility if needed
      // This is just a placeholder - the actual implementation would use the corsProxy utility
    }
    throw error;
  }
};

// Make sure the root element exists
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// Create the React root and render the app
createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
