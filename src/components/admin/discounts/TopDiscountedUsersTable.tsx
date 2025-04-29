
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { TopDiscountedUser } from '@/hooks/admin/useDiscountAnalytics';
import { Clock, MoreVertical, RefreshCw, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from 'react-router-dom';

interface TopDiscountedUsersTableProps {
  users?: TopDiscountedUser[];
  isLoading: boolean;
}

export function TopDiscountedUsersTable({ users, isLoading }: TopDiscountedUsersTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof TopDiscountedUser>('discount_percentage');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const handleSort = (column: keyof TopDiscountedUser) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };
  
  const sortedUsers = React.useMemo(() => {
    if (!users) return [];
    
    return [...users].sort((a, b) => {
      let valueA = a[sortColumn];
      let valueB = b[sortColumn];
      
      // Handle nullish values
      if (valueA === null || valueA === undefined) valueA = sortColumn === 'discount_percentage' ? 0 : '';
      if (valueB === null || valueB === undefined) valueB = sortColumn === 'discount_percentage' ? 0 : '';
      
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      // String comparison
      const strA = String(valueA).toLowerCase();
      const strB = String(valueB).toLowerCase();
      
      return sortDirection === 'asc'
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [users, sortColumn, sortDirection]);

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Permanent';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="p-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (!users || users.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="flex flex-col items-center justify-center p-4 h-[200px] text-center">
          <p className="text-muted-foreground mb-2">No users with discounts found.</p>
          <p className="text-sm text-muted-foreground">
            Apply discounts to users to see them listed here.
          </p>
        </div>
      </div>
    );
  }
  
  const sortIcon = (column: keyof TopDiscountedUser) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="rounded-md border">
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Top Discounted Users</h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('username')}
              >
                User {sortIcon('username')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('discount_percentage')}
              >
                Discount {sortIcon('discount_percentage')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('total_discount_amount')}
              >
                Total Saved {sortIcon('total_discount_amount')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('order_count')}
              >
                Orders {sortIcon('order_count')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('discount_expires_at')}
              >
                Expires {sortIcon('discount_expires_at')}
              </TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.map((user) => (
              <TableRow key={user.user_id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-1.5 rounded-full">
                      <User className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex flex-col text-sm">
                      <span className="font-medium">
                        {user.username || user.email || 'Unknown User'}
                      </span>
                      {user.email && user.username && (
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-medium bg-green-50 text-green-700 border-green-200">
                    {user.discount_percentage.toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatCurrency(user.total_discount_amount)}
                </TableCell>
                <TableCell>
                  {user.order_count || 0}
                </TableCell>
                <TableCell>
                  {user.discount_expires_at ? (
                    <div className="flex items-center text-sm">
                      <Clock className="mr-1 h-3 w-3 text-amber-500" />
                      {formatDate(user.discount_expires_at)}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Permanent</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/admin/users?user=${user.user_id}`}>
                          <User className="mr-2 h-4 w-4" />
                          View User Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/admin/users?user=${user.user_id}&action=reset-discount`}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reset Discount
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
