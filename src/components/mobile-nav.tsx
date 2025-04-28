
import * as React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const { user, isAdmin } = useAuth()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Mở menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="px-0">
        <div className="flex flex-col space-y-3 px-6 pt-6">
          <Link 
            to="/" 
            className="flex items-center space-x-2 mb-6"
            onClick={() => setOpen(false)}
          >
            <span className="text-xl font-bold text-primary">Digital</span>
            <span className="text-xl font-bold">Deals</span>
          </Link>

          <div className="space-y-1">
            <Link 
              to="/" 
              className="block py-2 text-base font-medium transition-colors hover:text-primary"
              onClick={() => setOpen(false)}
            >
              Trang chủ
            </Link>
            
            <div className="py-2">
              <span className="text-base font-medium mb-2 block">Sản phẩm</span>
              <div className="pl-4 space-y-1">
                <Link 
                  to="/products?category=email" 
                  className="block py-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  Email Account
                </Link>
                <Link 
                  to="/products?category=social" 
                  className="block py-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  Social Account
                </Link>
                <Link 
                  to="/products?category=software" 
                  className="block py-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  Software & Key
                </Link>
                <Link 
                  to="/products" 
                  className="block py-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  Xem tất cả
                </Link>
              </div>
            </div>

            <Link 
              to="/help" 
              className="block py-2 text-base font-medium transition-colors hover:text-primary"
              onClick={() => setOpen(false)}
            >
              Hỗ trợ
            </Link>
          </div>

          <div className="h-px bg-border my-2" />
          
          {user ? (
            <>
              <Link 
                to="/deposit" 
                className="py-2 text-base font-medium text-primary transition-colors hover:opacity-80"
                onClick={() => setOpen(false)}
              >
                Nạp tiền
              </Link>
              <Link 
                to="/cart" 
                className="py-2 text-base font-medium transition-colors hover:text-primary"
                onClick={() => setOpen(false)}
              >
                Giỏ hàng
              </Link>
              <Link 
                to={isAdmin ? "/admin" : "/dashboard"} 
                className="py-2 text-base font-medium transition-colors hover:text-primary"
                onClick={() => setOpen(false)}
              >
                {isAdmin ? "Admin Panel" : "Dashboard"}
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="py-2 text-base font-medium transition-colors hover:text-primary"
                onClick={() => setOpen(false)}
              >
                Đăng nhập
              </Link>
              <Link 
                to="/register" 
                className="py-2 text-base font-medium transition-colors hover:text-primary"
                onClick={() => setOpen(false)}
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
