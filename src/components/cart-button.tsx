
import * as React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/hooks/useCart"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export function CartButton() {
  const { totalItems } = useCart()
  const itemCount = totalItems

  return (
    <Link to="/cart">
      <Button variant="ghost" size="icon" className="relative">
        <ShoppingCart className="h-5 w-5" />
        
        {itemCount > 0 && (
          <Badge 
            variant="destructive" 
            className={cn(
              "absolute -top-1 -right-1 h-4 min-w-4 p-0 flex items-center justify-center text-[10px]",
              itemCount > 99 ? "w-5" : "aspect-square"
            )}
          >
            {itemCount > 99 ? "99+" : itemCount}
          </Badge>
        )}
        
        <span className="sr-only">Cart</span>
      </Button>
    </Link>
  )
}
