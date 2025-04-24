
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const CartDropdown = () => {
  const [open, setOpen] = useState(false);
  const { cart, removeItem, updateQuantity } = useCart();
  const { items, totalPrice, totalItems } = cart;

  const handleRemove = (id: string) => {
    removeItem(id);
  };

  const handleQuantityChange = (id: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
              {totalItems}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Your Cart</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length > 0 ? (
          <>
            <ScrollArea className="h-[300px]">
              <DropdownMenuGroup>
                {items.map((item) => (
                  <DropdownMenuItem key={item.id} className="flex flex-col items-start p-0" onSelect={(e) => e.preventDefault()}>
                    <div className="flex w-full p-2 gap-2">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="h-16 w-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-1">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${item.price.toFixed(2)} x {item.quantity}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 ml-auto text-destructive" 
                            onClick={() => handleRemove(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </ScrollArea>
            <div className="p-4 space-y-4">
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  asChild
                  onClick={() => setOpen(false)}
                >
                  <Link to="/cart">View Cart</Link>
                </Button>
                <Button 
                  className="w-full"
                  asChild
                  onClick={() => setOpen(false)}
                >
                  <Link to="/checkout">Checkout</Link>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-4 text-center">
            <div className="flex justify-center mb-4">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="mb-4">Your cart is empty</p>
            <Button asChild className="w-full" onClick={() => setOpen(false)}>
              <Link to="/products">Browse Products</Link>
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CartDropdown;
