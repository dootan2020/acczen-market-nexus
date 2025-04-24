
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, LogIn, Menu, X } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Package className="h-6 w-6 text-primary" />
            <span>AccZen<span className="text-secondary">.net</span></span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/products" className="text-sm font-medium hover:text-primary transition-colors">
            Products
          </Link>
          <Link to="/categories" className="text-sm font-medium hover:text-primary transition-colors">
            Categories
          </Link>
          <Link to="/how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
            How It Works
          </Link>
          <Link to="/support" className="text-sm font-medium hover:text-primary transition-colors">
            Support
          </Link>
        </nav>

        {/* Auth & Cart Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/auth/login">
            <Button variant="outline" size="sm" className="gap-2">
              <LogIn className="h-4 w-4" />
              Login
            </Button>
          </Link>
          <Link to="/auth/register">
            <Button size="sm" className="gap-2">
              Sign Up
            </Button>
          </Link>
          <Link to="/cart" className="relative ml-2">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                0
              </span>
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/40">
          <div className="container py-4 flex flex-col gap-4 animate-fade-in">
            <Link 
              to="/products" 
              className="px-2 py-2 text-sm font-medium hover:bg-muted rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link 
              to="/categories" 
              className="px-2 py-2 text-sm font-medium hover:bg-muted rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Categories
            </Link>
            <Link 
              to="/how-it-works" 
              className="px-2 py-2 text-sm font-medium hover:bg-muted rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link 
              to="/support" 
              className="px-2 py-2 text-sm font-medium hover:bg-muted rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Support
            </Link>
            <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
              <Link to="/auth/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link to="/auth/register" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full justify-start">
                  Sign Up
                </Button>
              </Link>
              <Link to="/cart" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Cart
                  <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                    0
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
