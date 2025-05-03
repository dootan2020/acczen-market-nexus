
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import routes from './routes';
import './App.css';
import { ThemeProvider } from './components/ui/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';

// Remove the duplicate ReactQueryProvider import and use the one from tanstack directly

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="digital-deals-hub-theme">
        <BrowserRouter>
          <Toaster closeButton />
          <Routes>
            <Route element={<Layout />}>
              {routes.mainRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
              {routes.dashboardRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
            </Route>
            {routes.adminRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
