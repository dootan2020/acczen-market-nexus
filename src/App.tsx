
import React, { useEffect } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from "@/components/ui/theme-provider"
import ReactQueryProvider from './ReactQueryProvider';
import { AuthProvider } from './contexts/auth';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { CartProvider } from './contexts/CartContext';
import routes from './routes';
import { checkEnvironment } from './utils/checkEnvironment';
import { ProductProvider } from "./contexts/ProductContext";
import { ProductInfoModal } from "./components/products/ProductInfoModal";
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import AdminGuard from './components/AdminGuard';

function App() {
  useEffect(() => {
    checkEnvironment();
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <ReactQueryProvider>
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
                      
                      {/* Admin routes with AdminLayout, wrapped with AdminGuard */}
                      <Route element={<AdminGuard><AdminLayout /></AdminGuard>}>
                        {routes.adminRoutes.map((route, index) => (
                          <Route
                            key={`admin-${index}`}
                            path={route.path}
                            element={route.element}
                          />
                        ))}
                      </Route>
                    </Routes>
                  </div>
                </ProductProvider>
              </AuthProvider>
            </CartProvider>
          </CurrencyProvider>
        </ReactQueryProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
