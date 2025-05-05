
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Shield, 
  DollarSign, 
  Percent, 
  Eye
} from 'lucide-react';
import { UserProfile } from '@/hooks/admin/types/userManagement.types';

interface UserRowProps {
  user: UserProfile;
  onEditRole: (user: UserProfile) => void;
  onAdjustBalance: (user: UserProfile) => void;
  onSetDiscount: (user: UserProfile) => void;
  onViewDetails?: (user: UserProfile) => void;
}

export const UserRow: React.FC<UserRowProps> = ({
  user,
  onEditRole,
  onAdjustBalance,
  onSetDiscount,
  onViewDetails
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="py-3 px-4 max-w-[200px] truncate">{user.email}</td>
      <td className="py-3 px-4">{user.username || "-"}</td>
      <td className="py-3 px-4">{user.full_name || "-"}</td>
      <td className="py-3 px-4">
        <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
          {user.role}
        </Badge>
      </td>
      <td className="py-3 px-4">${user.balance.toFixed(2)}</td>
      <td className="py-3 px-4">
        {user.discount_percentage > 0 ? (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            {user.discount_percentage}%
          </Badge>
        ) : "-"}
      </td>
      <td className="py-3 px-4">{formatDate(user.created_at)}</td>
      <td className="py-3 px-4 text-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onViewDetails && (
              <DropdownMenuItem onClick={() => onViewDetails(user)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEditRole(user)}>
              <Shield className="mr-2 h-4 w-4" />
              Change Role
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAdjustBalance(user)}>
              <DollarSign className="mr-2 h-4 w-4" />
              Adjust Balance
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSetDiscount(user)}>
              <Percent className="mr-2 h-4 w-4" />
              Set Discount
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
};
