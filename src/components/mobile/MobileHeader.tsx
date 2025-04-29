
import React from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  title?: string;
  showSearch?: boolean;
  showCart?: boolean;
  className?: string;
  onSearchClick?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title = "Digital Deals",
  showSearch = true,
  showCart = true,
  className,
  onSearchClick,
}) => {
  const { cartItems } = useCart();

  return (
    <header className={cn("sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur", className)}>
      <div className="container flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center">
          <span className="text-lg font-bold text-primary">Digital</span>
          <span className="text-lg font-bold">Deals</span>
        </Link>
        
        <div className="flex items-center space-x-3">
          {showSearch && (
            <button 
              onClick={onSearchClick}
              className="h-9 w-9 rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          )}
          
          {showCart && (
            <Link to="/cart" className="relative h-9 w-9 rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              <ShoppingCart size={20} />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>
          )}
          
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
