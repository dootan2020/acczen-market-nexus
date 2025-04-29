
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TopDiscountedUser } from '@/hooks/admin/useDiscountAnalytics';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface TopDiscountedUsersTableProps {
  users: TopDiscountedUser[] | undefined;
  isLoading: boolean;
}

export function TopDiscountedUsersTable({ users, isLoading }: TopDiscountedUsersTableProps) {
  const getUserInitials = (user: TopDiscountedUser) => {
    if (user.full_name) {
      return user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
    }
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return user.email?.substring(0, 2).toUpperCase() ?? 'N/A';
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Discounted Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Discounted Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            No users with discounts found.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Discounted Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Total Saved</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Expires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.username || 'No username'}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge>{user.discount_percentage}%</Badge>
                  </TableCell>
                  <TableCell>${user.total_discount_amount?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>{user.order_count}</TableCell>
                  <TableCell>
                    {user.discount_expires_at ? (
                      <span className="text-sm">{format(new Date(user.discount_expires_at), 'MMM dd, yyyy')}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">No expiry</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
