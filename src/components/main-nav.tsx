
import * as React from "react"
import { Link } from "react-router-dom"

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
  return (
    <NavigationMenu className={cn("flex-1", className)} {...props}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link to="/" className={navigationMenuTriggerStyle()}>
              Home
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-[500px] overflow-hidden rounded-md bg-popover p-2 shadow-lg">
              <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
                <div className="bg-primary/10 p-3 rounded-md">
                  <Link 
                    to="/products" 
                    className="block select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium leading-none mb-1">Email Accounts</div>
                    <p className="text-xs text-muted-foreground">Professional email accounts from various providers</p>
                  </Link>
                </div>
                
                <div className="bg-primary/10 p-3 rounded-md">
                  <Link 
                    to="/products" 
                    className="block select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium leading-none mb-1">Social Accounts</div>
                    <p className="text-xs text-muted-foreground">Verified social media accounts for your business</p>
                  </Link>
                </div>
                
                <div className="bg-primary/10 p-3 rounded-md">
                  <Link 
                    to="/products" 
                    className="block select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium leading-none mb-1">Software Keys</div>
                    <p className="text-xs text-muted-foreground">License keys for popular software at great prices</p>
                  </Link>
                </div>
                
                <div className="bg-primary/10 p-3 rounded-md">
                  <Link 
                    to="/products" 
                    className="block select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium leading-none mb-1">Digital Services</div>
                    <p className="text-xs text-muted-foreground">Professional digital marketing services</p>
                  </Link>
                </div>
                
                <div className="col-span-2 bg-primary/20 p-3 rounded-md">
                  <Link 
                    to="/products" 
                    className="flex items-center justify-center gap-2 select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium leading-none">Browse All Products</div>
                    <p className="text-xs text-muted-foreground">Explore our full catalog of digital products with instant delivery</p>
                  </Link>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link to="/about" className={navigationMenuTriggerStyle()}>
              About
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link to="/contact" className={navigationMenuTriggerStyle()}>
              Contact
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
