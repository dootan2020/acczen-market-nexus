
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut, Settings, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserAuth() {
  const { user, signOut, isAdmin, balance, userDisplayName } = useAuth();
  const { convertVNDtoUSD, formatUSD } = useCurrencyContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Convert balance from VND to USD for display
  const displayBalance = React.useMemo(() => {
    if (balance === undefined) return "0.00";
    const usdBalance = convertVNDtoUSD(balance);
    console.log("UserAuth - Balance conversion:", { originalVND: balance, convertedUSD: usdBalance });
    return formatUSD(usdBalance);
  }, [balance, convertVNDtoUSD, formatUSD]);
  
  // Save current path when navigating to login
  const handleLoginClick = () => {
    if (location.pathname !== '/login') {
      localStorage.setItem('previousPath', location.pathname);
    }
    navigate('/login');
  };

  const handleLogoutConfirm = async () => {
    try {
      await signOut(true);
      setShowLogoutConfirm(false);
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      toast.error("Lỗi khi đăng xuất", {
        description: "Vui lòng thử lại sau."
      });
    }
  };

  // Get user's initials for avatar
  const getUserInitials = () => {
    if (!user) return "?";
    if (userDisplayName) {
      const nameParts = userDisplayName.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
      }
      return userDisplayName.charAt(0).toUpperCase();
    }
    const email = user.email || "";
    return email.charAt(0).toUpperCase();
  };

  // Get avatar color based on user ID for consistent color
  const getAvatarColor = () => {
    if (!user) return "bg-gray-400";
    
    // Simple hash function to generate consistent color from user ID
    const hash = user.id.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // Generate hue (0-360) from hash, with fixed saturation and lightness
    const hue = Math.abs(hash % 360);
    return `bg-[hsl(${hue},70%,60%)]`;
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Link to="/register">
          <Button variant="outline" size="sm">
            Đăng ký
          </Button>
        </Link>
        <Button onClick={handleLoginClick} size="sm">
          Đăng nhập
        </Button>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative rounded-full overflow-hidden">
            <Avatar className={`h-8 w-8 ${getAvatarColor()}`}>
              <AvatarImage src={user.user_metadata?.avatar_url || ''} alt={userDisplayName} />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
            <span className="sr-only">Tài khoản của tôi</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-2">
          <div className="flex flex-col px-2 pt-1 pb-2">
            <span className="font-medium text-base">{userDisplayName}</span>
            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
          </div>
          <DropdownMenuSeparator className="my-1" />
          
          <div className="px-2 py-1.5 bg-primary/10 rounded-md mb-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Số dư:</span>
              <span className="font-semibold text-primary">{displayBalance}</span>
            </div>
          </div>
          
          <DropdownMenuItem asChild className="cursor-pointer flex items-center gap-2">
            <Link to="/dashboard">
              <User className="h-4 w-4" />
              <span>Bảng điều khiển</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild className="cursor-pointer flex items-center gap-2">
            <Link to="/deposit">
              <ShoppingCart className="h-4 w-4" />
              <span>Nạp tiền</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild className="cursor-pointer flex items-center gap-2">
            <Link to="/dashboard/settings">
              <Settings className="h-4 w-4" />
              <span>Cài đặt tài khoản</span>
            </Link>
          </DropdownMenuItem>
          
          {isAdmin && (
            <>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem asChild className="cursor-pointer bg-secondary/20 flex items-center gap-2">
                <Link to="/admin">
                  <Shield className="h-4 w-4" />
                  <span>Quản trị hệ thống</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem 
            onClick={() => setShowLogoutConfirm(true)}
            className="text-red-500 hover:bg-red-50 hover:text-red-500 cursor-pointer flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Đăng xuất</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Logout confirmation dialog */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutConfirm}>Đăng xuất</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
