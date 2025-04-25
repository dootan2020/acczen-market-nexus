
import React from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { MainNav } from "@/components/main-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { UserAuth } from "@/components/auth/user-auth";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";

interface ListItemProps {
  title: string;
  href: string;
  children?: React.ReactNode;
}

function ListItem({ title, href, children }: ListItemProps) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={href}
          className={cn(
            "block select-none space-y-1.5 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            navigationMenuTriggerStyle()
          )}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-tight text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

export function Header() {
  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">AccZen</span>
          <span className="text-xl font-bold">.net</span>
        </Link>

        <div className="flex-1 flex justify-center">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/" className="text-sm font-medium px-4 py-2">
                  Home
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <ListItem href="/products" title="Email Accounts">
                      Professional email accounts from various providers
                    </ListItem>
                    <ListItem href="/products" title="Social Accounts">
                      Verified social media accounts for your business
                    </ListItem>
                    <ListItem href="/products" title="Software Keys">
                      License keys for popular software at great prices
                    </ListItem>
                    <ListItem href="/products" title="Digital Services">
                      Professional digital marketing services
                    </ListItem>
                    <ListItem href="/help" title="Browse All Products">
                      Explore our full catalog of digital products with instant delivery
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/about" className="text-sm font-medium px-4 py-2">
                  About
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/contact" className="text-sm font-medium px-4 py-2">
                  Contact
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center space-x-2">
          <Link to="/cart">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Shopping cart</span>
            </Button>
          </Link>
          <div className="hidden md:flex space-x-1">
            <Link to="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="default" size="sm" className="bg-primary">Register</Button>
            </Link>
          </div>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}

export default Header;
