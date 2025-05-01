
import * as React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Search } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { DepositButton } from "@/components/deposit-button"
import { Badge } from "@/components/ui/badge"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const { user, isAdmin } = useAuth()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col w-full max-w-full sm:max-w-sm p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center space-x-1"
              onClick={() => setOpen(false)}
            >
              <span className="text-xl font-bold text-primary font-poppins">AccZen</span>
              <span className="text-xl font-bold font-poppins">.net</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        
        <div className="relative p-4 border-b">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search products..."
            className="pl-9 bg-background"
          />
        </div>

        <div className="flex-1 overflow-auto">
          <div className="flex flex-col space-y-1 p-4">
            <div className="grid gap-2">
              <Link
                to="/"
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-base hover:bg-accent hover:text-accent-foreground",
                  location.pathname === "/" && "bg-accent text-accent-foreground"
                )}
                onClick={() => setOpen(false)}
              >
                Home
              </Link>
              
              <div className="px-3 py-2">
                <span className="text-base font-medium mb-2 block">Products</span>
                <div className="grid gap-1 pl-1">
                  <Link
                    to="/products?category=email"
                    className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setOpen(false)}
                  >
                    <span>Email Account</span>
                    <Badge variant="outline" className="ml-auto text-xs font-normal">New</Badge>
                  </Link>
                  <Link
                    to="/products?category=social"
                    className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setOpen(false)}
                  >
                    Social Account
                  </Link>
                  <Link
                    to="/products?category=software"
                    className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setOpen(false)}
                  >
                    Software & Key
                  </Link>
                  <Link
                    to="/products"
                    className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setOpen(false)}
                  >
                    View All
                  </Link>
                </div>
              </div>

              <Link
                to="/help"
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-base hover:bg-accent hover:text-accent-foreground",
                  location.pathname === "/help" && "bg-accent text-accent-foreground"
                )}
                onClick={() => setOpen(false)}
              >
                Support
              </Link>

              <Link
                to="/contact"
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-base hover:bg-accent hover:text-accent-foreground",
                  location.pathname === "/contact" && "bg-accent text-accent-foreground"
                )}
                onClick={() => setOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t p-4 space-y-2">
          {user ? (
            <>
              <div className="w-full">
                <DepositButton className="w-full" />
              </div>
              <div className="grid gap-1">
                <Link 
                  to="/dashboard" 
                  className="flex items-center justify-between rounded-md px-3 py-2 text-base hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setOpen(false)}
                >
                  <span>My Account</span>
                </Link>
                <Link 
                  to="/dashboard/purchases" 
                  className="flex items-center justify-between rounded-md px-3 py-2 text-base hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setOpen(false)}
                >
                  <span>Orders</span>
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="flex items-center justify-between rounded-md px-3 py-2 text-base hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setOpen(false)}
                  >
                    <span>Admin Panel</span>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  className="justify-start rounded-md px-3 py-2 text-base w-full font-normal"
                  onClick={() => {
                    setOpen(false);
                    // Handle logout
                  }}
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                asChild
                className="w-full"
              >
                <Link 
                  to="/login"
                  onClick={() => setOpen(false)}
                >
                  Login
                </Link>
              </Button>
              <Button 
                size="sm"
                asChild
                className="w-full"
              >
                <Link 
                  to="/register" 
                  onClick={() => setOpen(false)}
                >
                  Register
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
