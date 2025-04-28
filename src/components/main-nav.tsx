
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

export function MainNav({ className }: { className?: string }) {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <NavigationMenu className={cn(className)}>
      <NavigationMenuList className="space-x-1">
        <NavigationMenuItem>
          <Link to="/">
            <NavigationMenuLink 
              className={cn(
                "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                isActive('/') && "bg-accent/50"
              )}
            >
              Trang chủ
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className={isActive('/products') ? "bg-accent/50" : ""}>
            Sản phẩm
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:grid-cols-2">
              <li className="row-span-3">
                <Link
                  to="/products?category=email"
                  className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/50 to-primary p-5 no-underline outline-none focus:shadow-md"
                >
                  <div className="mt-4 mb-2 text-lg font-medium text-primary-foreground">
                    Email Account
                  </div>
                  <p className="text-sm leading-tight text-primary-foreground/90">
                    Tài khoản email chuyên nghiệp từ nhiều nhà cung cấp
                  </p>
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=social"
                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  <div className="text-sm font-medium leading-none">Social Account</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Tài khoản mạng xã hội đã xác minh cho doanh nghiệp
                  </p>
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=software"
                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  <div className="text-sm font-medium leading-none">Software & Key</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Key bản quyền cho phần mềm phổ biến với giá tốt
                  </p>
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  <div className="text-sm font-medium leading-none">Xem tất cả</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Khám phá toàn bộ sản phẩm của chúng tôi
                  </p>
                </Link>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link to="/help">
            <NavigationMenuLink 
              className={cn(
                "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                isActive('/help') && "bg-accent/50"
              )}
            >
              Hỗ trợ
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <Link to="/contact">
            <NavigationMenuLink 
              className={cn(
                "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                isActive('/contact') && "bg-accent/50"
              )}
            >
              Liên hệ
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
