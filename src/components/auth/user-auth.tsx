
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function UserAuth() {
  const { user, signOut, isAdmin, balance } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Đăng xuất thành công");
      navigate("/");
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      toast.error("Lỗi khi đăng xuất", {
        description: "Vui lòng thử lại sau."
      });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Link to="/login">
          <Button variant="outline" size="sm">
            Đăng nhập
          </Button>
        </Link>
        <Link to="/register">
          <Button size="sm">Đăng ký</Button>
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <User className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="flex justify-between">
          <span>Số dư:</span>
          <span className="font-semibold text-primary">${balance?.toFixed(2) ?? "0.00"}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="w-full cursor-pointer">
            Bảng điều khiển
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/deposit" className="w-full cursor-pointer">
            Nạp tiền
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="w-full cursor-pointer">
              Quản trị viên
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="text-red-500 focus:bg-red-50 focus:text-red-500 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
