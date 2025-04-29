import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUI } from "@/contexts/UIContext";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/ModeToggle";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuLink, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Coins, Menu, ShoppingBag, User, Award } from "lucide-react";

// Menu items for navigation
const menuItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Sản phẩm", href: "/products" },
  { label: "Thành viên", href: "/loyalty-program" }
];

// User account actions
const userActions = (user) => [
  { label: "Tài khoản", href: "/dashboard" },
  { label: "Mua hàng", href: "/dashboard/purchases" },
  { label: "Thành viên", href: "/dashboard/loyalty", icon: <Award className="mr-2 h-[1.2rem] w-[1.2rem] text-amber-500" /> },
  { label: "Nạp tiền", href: "/deposit", icon: <Coins className="mr-2 h-[1.2rem] w-[1.2rem] text-green-500" /> },
  { label: "Đăng xuất", action: "logout" },
];

const Header = () => {
  const { user, logout } = useAuth();
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useUI();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="bg-background sticky top-0 z-50 border-b">
      <div className="container flex h-16 items-center justify-between py-4">
        <Link to="/" className="font-bold text-2xl">
          AccZen.net
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <NavigationMenu>
            <NavigationMenuList>
              {menuItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <Link to={item.href} className={cn(navigationMenuTriggerStyle(), "data-[active]:text-foreground")}>
                    {item.label}
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {user ? (
            <div className="flex items-center space-x-4">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar_url} alt={user.username} />
                        <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              <Button variant="outline" size="sm" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Đăng ký</Button>
              </Link>
            </div>
          )}
          <ModeToggle />
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="sm">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:w-1/2 md:hidden">
            <SheetHeader className="text-left">
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Khám phá AccZen.net và các dịch vụ của chúng tôi.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              {menuItems.map((item) => (
                <Link key={item.href} to={item.href} className="block py-2 px-4 rounded-md hover:bg-secondary">
                  {item.label}
                </Link>
              ))}

              {user ? (
                <>
                  {userActions(user).map((action, index) => (
                    action.action === "logout" ? (
                      <Button key={index} variant="destructive" size="sm" onClick={handleLogout} className="w-full justify-start">
                        Đăng xuất
                      </Button>
                    ) : (
                      <Link key={index} to={action.href} className="block py-2 px-4 rounded-md hover:bg-secondary flex items-center">
                        {action.icon}
                        {action.label}
                      </Link>
                    )
                  ))}
                </>
              ) : (
                <>
                  <Link to="/login" className="block py-2 px-4 rounded-md hover:bg-secondary">
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="block py-2 px-4 rounded-md hover:bg-secondary">
                    Đăng ký
                  </Link>
                </>
              )}
              <ModeToggle />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
