
import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { useCurrencyContext } from "@/contexts/CurrencyContext"
import { User, LogOut, Settings, ShoppingCart, CreditCard, Package, ShieldAlert } from "lucide-react"
import { toast } from "sonner"

export function UserMenu() {
  const { user, signOut, isAdmin, balance, userDisplayName } = useAuth()
  const { convertVNDtoUSD, formatUSD } = useCurrencyContext()
  const navigate = useNavigate()
  
  const displayBalance = React.useMemo(() => {
    if (balance === undefined) return "0.00"
    const balanceUSD = convertVNDtoUSD(balance)
    return formatUSD(balanceUSD)
  }, [balance, convertVNDtoUSD, formatUSD])
  
  const getUserInitials = () => {
    if (!user) return "G"
    
    if (userDisplayName) {
      const nameParts = userDisplayName.split(' ')
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      }
      return userDisplayName.charAt(0).toUpperCase()
    }
    
    const email = user.email || ""
    return email.charAt(0).toUpperCase()
  }
  
  const getRandomColor = () => {
    if (!user) return "bg-primary"
    
    // Generate consistent color based on user ID
    const hash = user.id.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)
    
    // Generate hue (0-360)
    const hue = Math.abs(hash % 360)
    
    return `bg-[hsl(${hue},70%,60%)]`
  }
  
  const handleLogout = async () => {
    try {
      await signOut()
      toast.success("Logged out successfully")
      navigate("/")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to log out")
    }
  }
  
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/register">Register</Link>
        </Button>
        <Button size="sm" asChild>
          <Link to="/login">Login</Link>
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full overflow-hidden">
          <Avatar className={getRandomColor()}>
            <AvatarImage src={user.user_metadata?.avatar_url || ''} />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 pt-1 pb-2">
          <p className="font-medium truncate">{userDisplayName || user.email}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        
        <div className="px-2 py-1.5 mb-2 bg-accent/50 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-sm">Balance:</span>
            <span className="font-semibold">{displayBalance}</span>
          </div>
        </div>
        
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="cursor-pointer flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/cart" className="cursor-pointer flex items-center">
            <ShoppingCart className="mr-2 h-4 w-4" />
            <span>Cart</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/deposit" className="cursor-pointer flex items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Deposit</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/dashboard/orders" className="cursor-pointer flex items-center">
            <Package className="mr-2 h-4 w-4" />
            <span>My Orders</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/dashboard/settings" className="cursor-pointer flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin" className="cursor-pointer flex items-center">
                <ShieldAlert className="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
