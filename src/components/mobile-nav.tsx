
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
            className="py-2 text-lg font-semibold transition-colors hover:text-primary"
            onClick={() => setOpen(false)}
          >
            Trang chủ
          </Link>
          <Link 
            to="/products" 
            className="py-2 text-lg font-semibold transition-colors hover:text-primary"
            onClick={() => setOpen(false)}
          >
            Sản phẩm
          </Link>
          <Link 
            to="/help" 
            className="py-2 text-lg font-semibold transition-colors hover:text-primary"
            onClick={() => setOpen(false)}
          >
            Hỗ trợ
          </Link>
          <Link 
            to="/contact" 
            className="py-2 text-lg font-semibold transition-colors hover:text-primary"
            onClick={() => setOpen(false)}
          >
            Liên hệ
          </Link>
          
          <div className="h-px bg-border my-2" />
          
          {user ? (
            <>
              <Link 
                to="/deposit" 
                className="py-2 text-lg font-semibold text-primary transition-colors hover:opacity-80"
                onClick={() => setOpen(false)}
              >
                Nạp tiền
              </Link>
              <Link 
                to="/cart" 
                className="py-2 text-lg font-semibold transition-colors hover:text-primary"
                onClick={() => setOpen(false)}
              >
                Giỏ hàng
              </Link>
              <Link 
                to={isAdmin ? "/admin" : "/dashboard"} 
                className="py-2 text-lg font-semibold transition-colors hover:text-primary"
                onClick={() => setOpen(false)}
              >
                {isAdmin ? "Admin Panel" : "Dashboard"}
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="py-2 text-lg font-semibold transition-colors hover:text-primary"
                onClick={() => setOpen(false)}
              >
                Đăng nhập
              </Link>
              <Link 
                to="/register" 
                className="py-2 text-lg font-semibold transition-colors hover:text-primary"
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
