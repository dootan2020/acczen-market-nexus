
import React, { useEffect } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from "@/components/ui/theme-provider"
import ReactQueryProvider from './ReactQueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { CartProvider } from './contexts/CartContext';
import routes from './routes';
import { checkEnvironment } from './utils/checkEnvironment';
import { ProductProvider } from "./contexts/ProductContext";
import { ProductInfoModal } from "./components/products/ProductInfoModal";

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
                      {routes.routes.map((route, index) => (
                        <Route
                          key={index}
                          path={route.path}
                          element={route.element}
                        />
                      ))}
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
