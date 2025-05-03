
import React, { useEffect } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from "@/components/ui/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip";
import ReactQueryProvider from './ReactQueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { CartProvider } from './contexts/CartContext';
import routes from './routes';
import { checkEnvironment } from './utils/checkEnvironment';
import { ProductProvider } from "./contexts/ProductContext";
import { ProductInfoModal } from "./components/products/ProductInfoModal";
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import { ThemeVariablesProvider } from './components/ui/css-variables';
import { Toaster } from "sonner";

// Initialize next-themes globally
if (typeof window !== 'undefined') {
  // @ts-ignore - Setting up global theme context for next-themes
  window.__NEXT_THEMES__ = window.__NEXT_THEMES__ || { theme: 'light', setTheme: (t: string) => {
    // @ts-ignore
    window.__NEXT_THEMES__.theme = t;
    document.documentElement.classList.remove('light', 'dark', 'system');
    document.documentElement.classList.add(t);
  }};
}

function App() {
  useEffect(() => {
    checkEnvironment();
  }, []);

  return (
    <BrowserRouter>
      <ReactQueryProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <ThemeVariablesProvider>
            <TooltipProvider>
              <CurrencyProvider>
                <CartProvider>
                  <AuthProvider>
                    <ProductProvider>
                      <div className="min-h-screen flex flex-col">
                        <ProductInfoModal />
                        <Routes>
                          {/* Main routes with standard layout */}
                          <Route element={<Layout />}>
                            {routes.mainRoutes.map((route, index) => (
                              <Route
                                key={index}
                                path={route.path}
                                element={route.element}
                              />
                            ))}
                          </Route>
                          
                          {/* Dashboard routes */}
                          {routes.dashboardRoutes.map((route, index) => (
                            <Route
                              key={`dashboard-${index}`}
                              path={route.path}
                              element={route.element}
                            />
                          ))}
                          
                          {/* Admin routes with AdminLayout */}
                          <Route element={<AdminLayout />}>
                            {routes.adminRoutes.map((route, index) => (
                              <Route
                                key={`admin-${index}`}
                                path={route.path}
                                element={route.element}
                              />
                            ))}
                          </Route>
                        </Routes>
                        <Toaster />
                      </div>
                    </ProductProvider>
                  </AuthProvider>
                </CartProvider>
              </CurrencyProvider>
            </TooltipProvider>
          </ThemeVariablesProvider>
        </ThemeProvider>
      </ReactQueryProvider>
    </BrowserRouter>
  );
}

export default App;
