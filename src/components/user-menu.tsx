
import * as React from "react"
import { Link } from "react-router-dom"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User, Settings, ShoppingBag, Shield } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useCurrencyContext } from "@/contexts/CurrencyContext"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function UserMenu() {
  const { user, signOut, isAdmin, balance, userDisplayName } = useAuth()
  const { convertVNDtoUSD, formatUSD, formatVND } = useCurrencyContext()
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false)
  const [showVndBalance, setShowVndBalance] = React.useState(false)

  // Get user's initials for avatar
  const getUserInitials = () => {
    if (!user) return "?"
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

  // Get avatar color based on user ID for consistent color
  const getAvatarColor = () => {
    if (!user) return "bg-gray-400"
    
    // Simple hash function to generate consistent color from user ID
    const hash = user.id.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)
    
    // Generate hue (0-360) from hash, with fixed saturation and lightness
    const hue = Math.abs(hash % 360)
    return `bg-[hsl(${hue},70%,60%)]`
  }

  const handleLogoutConfirm = async () => {
    try {
      await signOut(true)
      setShowLogoutConfirm(false)
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  // Convert balance from VND to USD for display with memoization
  const displayBalance = React.useMemo(() => {
    if (balance === undefined) return "₫0";
    
    if (showVndBalance) {
      return formatVND(balance);
    } else {
      const usdBalance = convertVNDtoUSD(balance);
      return formatUSD(usdBalance);
    }
  }, [balance, convertVNDtoUSD, formatUSD, formatVND, showVndBalance]);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link to="/register">
          <Button variant="outline" size="sm" className="hidden md:inline-flex">
            Register
          </Button>
        </Link>
        <Link to="/login">
          <Button size="sm">Login</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full overflow-hidden">
            <Avatar className={`h-8 w-8 ${getAvatarColor()}`}>
              <AvatarImage src={user.user_metadata?.avatar_url || ''} alt={userDisplayName} />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
            <span className="sr-only">My Account</span>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56 p-2">
          <div className="flex flex-col px-2 pt-1 pb-2">
            <span className="font-medium text-base">{userDisplayName}</span>
            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
          </div>
          
          <DropdownMenuSeparator className="my-1" />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="px-2 py-1.5 bg-primary/10 rounded-md mb-2 cursor-pointer"
                  onClick={() => setShowVndBalance(!showVndBalance)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Balance:</span>
                    <span className="font-semibold text-primary">{displayBalance}</span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to switch currency units</p>
                <p>VND: {formatVND(balance || 0)}</p>
                <p>USD: {formatUSD(convertVNDtoUSD(balance || 0))}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenuItem asChild className="cursor-pointer flex items-center gap-2">
            <Link to={isAdmin ? "/admin" : "/dashboard"}>
              {isAdmin ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
              <span>{isAdmin ? "Admin Panel" : "Dashboard"}</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild className="cursor-pointer flex items-center gap-2">
            <Link to="/dashboard/purchases">
              <ShoppingBag className="h-4 w-4" />
              <span>My Orders</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild className="cursor-pointer flex items-center gap-2">
            <Link to="/dashboard/settings">
              <Settings className="h-4 w-4" />
              <span>Account Settings</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="my-1" />
          
          <DropdownMenuItem 
            onClick={() => setShowLogoutConfirm(true)}
            className="text-red-500 hover:bg-red-50 hover:text-red-500 cursor-pointer flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Logout confirmation dialog */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout from the system?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutConfirm}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
