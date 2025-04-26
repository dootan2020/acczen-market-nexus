
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CartProvider } from './providers/CartProvider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from './contexts/ThemeContext'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// Create a client
const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <ThemeProvider defaultTheme="system" storageKey="digital-deals-theme">
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);
