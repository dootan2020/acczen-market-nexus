
import React, { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { ModeToggle } from "@/components/mode-toggle"
import { MainNav } from "@/components/main-nav"
import { CartButton } from "@/components/cart-button"
import { UserMenu } from "@/components/user-menu"
import { MobileNav } from "@/components/mobile-nav"
import { DepositButton } from "@/components/deposit-button"
import { Search, Menu, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  return (
    <header className="supports-backdrop-blur:bg-background/80 sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur transition-all">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2 mr-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary font-poppins">AccZen</span>
            <span className="text-xl font-bold font-poppins">.net</span>
          </Link>
        </div>
        
        <MainNav className="mx-6 hidden md:flex" />
        
        {/* Desktop Search */}
        <div className={cn(
          "hidden md:flex relative mx-4 flex-1 max-w-md transition-all duration-300",
          searchOpen ? "max-w-xl" : "max-w-md"
        )}>
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" 
          />
          <Input 
            placeholder="Search products..." 
            className="pl-10 bg-background border-input focus-visible:ring-1 transition-all"
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
          />
        </div>
        
        <div className="flex flex-1 md:flex-none items-center justify-end gap-2">
          {/* Mobile Search Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(prev => !prev)}
          >
            {mobileMenuOpen ? <X /> : <Search />}
          </Button>
          
          <div className="hidden md:block">
            <DepositButton />
          </div>
          
          <CartButton />
          <UserMenu />
          <ModeToggle />
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(prev => !prev)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Search Bar - Only shows when mobile menu is open */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-3 border-t border-border/40 animate-in slide-in-from-top">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              className="pl-10 bg-background border-input focus-visible:ring-1"
            />
          </div>
          <nav className="mt-4 space-y-2">
            <Link 
              to="/" 
              className={cn(
                "flex w-full items-center px-3 py-2 text-sm font-medium rounded-md",
                location.pathname === "/" ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/50"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className={cn(
                "flex w-full items-center px-3 py-2 text-sm font-medium rounded-md",
                location.pathname.startsWith("/products") ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/50"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link 
              to="/help" 
              className={cn(
                "flex w-full items-center px-3 py-2 text-sm font-medium rounded-md",
                location.pathname === "/help" ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/50"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Support
            </Link>
            <Link 
              to="/contact" 
              className={cn(
                "flex w-full items-center px-3 py-2 text-sm font-medium rounded-md",
                location.pathname === "/contact" ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/50"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="pt-2">
              <DepositButton className="w-full justify-center" />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
