
import React from "react"
import { Link } from "react-router-dom"
import { ModeToggle } from "@/components/mode-toggle"
import { MainNav } from "@/components/main-nav"
import { CartButton } from "@/components/cart-button"
import { UserMenu } from "@/components/user-menu"
import { MobileNav } from "@/components/mobile-nav"
import { DepositButton } from "@/components/deposit-button"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function Header() {
  return (
    <header className="supports-backdrop-blur:bg-background/60 sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2 mr-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">Digital</span>
            <span className="text-xl font-bold">Deals</span>
          </Link>
        </div>
        
        <MainNav className="mx-6 hidden md:flex" />
        
        <div className="hidden md:flex relative mx-4 flex-1 max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm kiếm sản phẩm..." 
            className="pl-8 bg-background border-input focus-visible:ring-1"
          />
        </div>
        
        <div className="flex flex-1 md:flex-none items-center justify-end gap-2">
          <div className="hidden md:block">
            <DepositButton />
          </div>
          
          <CartButton />
          <UserMenu />
          <ModeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

export default Header
