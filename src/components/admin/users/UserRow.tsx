
import { useMemo } from "react";
import { format } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Shield, Wallet } from "lucide-react";
import { UserProfile } from "@/hooks/admin/types/userManagement.types";

interface UserRowProps {
  user: UserProfile;
  onEditRole: (user: UserProfile) => void;
  onAdjustBalance: (user: UserProfile) => void;
}

export function UserRow({ user, onEditRole, onAdjustBalance }: UserRowProps) {
  const getUserInitials = (user: UserProfile) => {
    if (user.full_name) {
      return user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
    }
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return user.email ? user.email.substring(0, 2).toUpperCase() : 'U';
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.username || 'No username'}</div>
            <div className="text-xs text-muted-foreground">{user.full_name || ''}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
          {user.role}
        </Badge>
      </TableCell>
      <TableCell className="text-right">${user.balance.toFixed(2)}</TableCell>
      <TableCell>{formatDate(user.created_at)}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditRole(user)}>
              <Shield className="h-4 w-4 mr-2" />
              Change Role
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAdjustBalance(user)}>
              <Wallet className="h-4 w-4 mr-2" />
              Adjust Balance
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
