
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';

export const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { cartItems } = useCart();
  
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleMenuClick = () => {
    // Use querySelector to find the mobile menu button and simulate a click
    const mobileMenuButton = document.querySelector('[data-dropdown-toggle="mobileMenu"]');
    if (mobileMenuButton && mobileMenuButton instanceof HTMLElement) {
      mobileMenuButton.click();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 z-40 w-full md:hidden">
      <div className="flex h-16 items-center justify-around bg-background border-t shadow-lg">
        <Link 
          to="/" 
          className={cn(
            "flex flex-col items-center justify-center w-1/5 h-full pt-1 pb-1",
            isActive('/') ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Home size={20} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link 
          to="/products"
          className={cn(
            "flex flex-col items-center justify-center w-1/5 h-full pt-1 pb-1",
            isActive('/products') ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Search size={20} />
          <span className="text-xs mt-1">Products</span>
        </Link>
        
        <Link 
          to="/cart"
          className={cn(
            "flex flex-col items-center justify-center w-1/5 h-full pt-1 pb-1 relative",
            isActive('/cart') ? "text-primary" : "text-muted-foreground"
          )}
        >
          <ShoppingCart size={20} />
          {cartItems.length > 0 && (
            <span className="absolute top-1 right-[22%] bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
          <span className="text-xs mt-1">Cart</span>
        </Link>
        
        <Link 
          to={user ? "/dashboard" : "/login"} 
          className={cn(
            "flex flex-col items-center justify-center w-1/5 h-full pt-1 pb-1",
            (isActive('/dashboard') || isActive('/login')) ? "text-primary" : "text-muted-foreground"
          )}
        >
          <User size={20} />
          <span className="text-xs mt-1">{user ? "Account" : "Login"}</span>
        </Link>
        
        <button
          className="flex flex-col items-center justify-center w-1/5 h-full pt-1 pb-1 text-muted-foreground focus:outline-none"
          onClick={handleMenuClick}
        >
          <Menu size={20} />
          <span className="text-xs mt-1">More</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;
