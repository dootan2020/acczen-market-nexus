
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { OrderWithProfile } from '@/types/orders';

interface OrderDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOrder: OrderWithProfile | null;
  orderItems: any[] | null;
  isLoading: boolean;
  onUpdateStatusClick: () => void;
}

export const OrderDetailsDialog = ({
  isOpen,
  onOpenChange,
  selectedOrder,
  orderItems,
  isLoading,
  onUpdateStatusClick
}: OrderDetailsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Order ID: {selectedOrder?.id}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="py-4">
            <div className="flex justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Customer</p>
                <p>{selectedOrder?.profiles?.email || 'Unknown User'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date</p>
                <p>{selectedOrder ? format(new Date(selectedOrder.created_at), 'MMM dd, yyyy HH:mm') : ''}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge variant={
                  selectedOrder?.status === 'completed' ? 'default' :
                  selectedOrder?.status === 'cancelled' ? 'destructive' :
                  selectedOrder?.status === 'refunded' ? 'secondary' : 'outline'
                }>
                  {selectedOrder?.status.charAt(0).toUpperCase() + selectedOrder?.status.slice(1)}
                </Badge>
              </div>
            </div>
            
            <div className="rounded-md border mb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {item.product?.image_url ? (
                            <img 
                              src={item.product.image_url} 
                              alt={item.product.name} 
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted"></div>
                          )}
                          <div>{item.product?.name || 'Unknown Product'}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">${Number(item.price).toFixed(2)}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">${Number(item.total).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${Number(selectedOrder?.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between py-2 font-medium">
                  <span>Total</span>
                  <span>${Number(selectedOrder?.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button onClick={onUpdateStatusClick}>
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
