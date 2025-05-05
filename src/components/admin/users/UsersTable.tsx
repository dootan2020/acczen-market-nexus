
import React, { ReactNode } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, CircleDollarSign, UserCog, Percent } from 'lucide-react';
import { UserProfile } from '@/hooks/admin/types/userManagement.types';
import { DiscountBadge } from './DiscountBadge';
import { formatDistanceToNow } from 'date-fns';

interface UsersTableProps {
  users: UserProfile[];
  onEditRole: (user: UserProfile) => void;
  onAdjustBalance: (user: UserProfile) => void;
  onSetDiscount: (user: UserProfile) => void;
  onViewUser: (user: UserProfile) => void;
  children?: ReactNode;
}

export function UsersTable({ 
  users, 
  onEditRole, 
  onAdjustBalance,
  onSetDiscount,
  onViewUser,
  children
}: UsersTableProps) {
  const getInitials = (name: string | null = '', email: string | null = '') => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return email ? email[0].toUpperCase() : 'U';
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {children || (
          users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || undefined} alt={user.username || ''} />
                      <AvatarFallback>{getInitials(user.full_name, user.email)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.username || user.email}</div>
                      {user.email && user.username && (
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>${user.balance.toFixed(2)}</TableCell>
                <TableCell>
                  {user.discount_percentage > 0 ? (
                    <DiscountBadge 
                      percentage={user.discount_percentage}
                      tooltipContent={
                        user.discount_note 
                          ? `${user.discount_percentage}% discount: ${user.discount_note}` 
                          : `${user.discount_percentage}% discount`
                      }
                    />
                  ) : (
                    <span className="text-muted-foreground text-sm">None</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(user.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onViewUser(user)}>
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEditRole(user)}>
                        <UserCog className="mr-2 h-4 w-4" />
                        Change role
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAdjustBalance(user)}>
                        <CircleDollarSign className="mr-2 h-4 w-4" />
                        Adjust balance
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSetDiscount(user)}>
                        <Percent className="mr-2 h-4 w-4" />
                        Set discount
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )
        )}
      </TableBody>
    </Table>
  );
}
