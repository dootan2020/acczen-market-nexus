
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

interface OrdersTableProps {
  orders: OrderWithProfile[];
  onViewOrder: (order: OrderWithProfile) => void;
  onUpdateStatusDialog: (order: OrderWithProfile) => void;
  isLoading: boolean;
}

export const OrdersTable = ({ orders, onViewOrder, onUpdateStatusDialog, isLoading }: OrdersTableProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="text-center py-6">
          No orders found
        </TableCell>
      </TableRow>
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
          <TableRow key={order.id}>
            <TableCell className="font-medium">
              {order.id.slice(0, 8)}...
            </TableCell>
            <TableCell>{order.profiles?.email || 'Unknown User'}</TableCell>
            <TableCell>{format(new Date(order.created_at), 'MMM dd, yyyy')}</TableCell>
            <TableCell>
              <Badge variant={
                order.status === 'completed' ? 'default' :
                order.status === 'cancelled' ? 'destructive' :
                order.status === 'refunded' ? 'secondary' : 'outline'
              }>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              ${Number(order.total_amount).toFixed(2)}
            </TableCell>
            <TableCell className="text-right">
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
