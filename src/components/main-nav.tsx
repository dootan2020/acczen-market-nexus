
import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const location = useLocation();
  
  // Check if the current path includes the given path
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <NavigationMenu className={cn("hidden md:flex justify-center", className)}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link 
              to="/" 
              className={cn(navigationMenuTriggerStyle(), isActive('/') ? "bg-accent/50" : "")}
            >
              Trang chủ
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger className={isActive('/products') ? "bg-accent/50" : ""}>
            Sản phẩm
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-[500px] overflow-hidden rounded-md bg-popover p-2 shadow-lg">
              <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
                <div className="bg-primary/10 p-3 rounded-md">
                  <Link 
                    to="/products?category=email" 
                    className="block select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium leading-none mb-1">Tài khoản Email</div>
                    <p className="text-xs text-muted-foreground">Tài khoản email chuyên nghiệp từ nhiều nhà cung cấp</p>
                  </Link>
                </div>
                
                <div className="bg-primary/10 p-3 rounded-md">
                  <Link 
                    to="/products?category=social" 
                    className="block select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium leading-none mb-1">Tài khoản Mạng xã hội</div>
                    <p className="text-xs text-muted-foreground">Tài khoản mạng xã hội đã xác minh cho doanh nghiệp</p>
                  </Link>
                </div>
                
                <div className="bg-primary/10 p-3 rounded-md">
                  <Link 
                    to="/products?category=software" 
                    className="block select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium leading-none mb-1">Phần mềm & Key bản quyền</div>
                    <p className="text-xs text-muted-foreground">Key bản quyền cho phần mềm phổ biến với giá tốt</p>
                  </Link>
                </div>
                
                <div className="bg-primary/10 p-3 rounded-md">
                  <Link 
                    to="/products?category=digital" 
                    className="block select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium leading-none mb-1">Dịch vụ số</div>
                    <p className="text-xs text-muted-foreground">Dịch vụ marketing số chuyên nghiệp</p>
                  </Link>
                </div>
                
                <div className="col-span-2 bg-primary/20 p-3 rounded-md">
                  <Link 
                    to="/products" 
                    className="flex items-center justify-center gap-2 select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">Xem tất cả sản phẩm</div>
                  </Link>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link 
              to="/help" 
              className={cn(navigationMenuTriggerStyle(), isActive('/help') ? "bg-accent/50" : "")}
            >
              Hỗ trợ
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link 
              to="/contact" 
              className={cn(navigationMenuTriggerStyle(), isActive('/contact') ? "bg-accent/50" : "")}
            >
              Liên hệ
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
