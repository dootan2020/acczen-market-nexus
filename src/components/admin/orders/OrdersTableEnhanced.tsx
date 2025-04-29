
import { format } from 'date-fns';
import { Eye, MoreVertical, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { OrderWithProfile } from '@/types/orders';
import { Skeleton } from '@/components/ui/skeleton';

interface OrdersTableProps {
  orders: OrderWithProfile[];
  onViewOrder: (order: OrderWithProfile) => void;
  onUpdateStatusDialog: (order: OrderWithProfile) => void;
  isLoading: boolean;
}

export const OrdersTable = ({ orders, onViewOrder, onUpdateStatusDialog, isLoading }: OrdersTableProps) => {
  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: 'default', label: 'Completed' },
      pending: { variant: 'secondary', label: 'Pending' },
      processing: { variant: 'secondary', label: 'Processing' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
      refunded: { variant: 'outline', label: 'Refunded' }
    } as const;
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { variant: 'outline', label: status.charAt(0).toUpperCase() + status.slice(1) };
    
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    );
  };
  
  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(5).fill(0).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (!orders?.length) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
              No orders found matching your criteria
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onViewOrder(order)}>
            <TableCell className="font-medium">
              {order.id.slice(0, 8)}...
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span>{order.profiles?.email || 'Unknown User'}</span>
                {order.profiles?.username && (
                  <span className="text-xs text-muted-foreground">{order.profiles.username}</span>
                )}
              </div>
            </TableCell>
            <TableCell>{format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
            <TableCell>
              {renderStatusBadge(order.status)}
            </TableCell>
            <TableCell className="text-right font-medium">
              ${Number(order.total_amount).toFixed(2)}
            </TableCell>
            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewOrder(order)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateStatusDialog(order)}>
                    <Check className="h-4 w-4 mr-2" />
                    Update Status
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
