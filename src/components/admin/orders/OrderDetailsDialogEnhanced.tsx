
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
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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
  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: 'default', label: 'Completed' },
      pending: { variant: 'secondary', label: 'Pending' },
      processing: { variant: 'secondary', label: 'Processing' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
      refunded: { variant: 'outline', label: 'Refunded' },
      failed: { variant: 'destructive', label: 'Failed' }
    } as const;
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { variant: 'outline', label: status.charAt(0).toUpperCase() + status.slice(1) };
    
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Order Details 
            {selectedOrder && renderStatusBadge(selectedOrder.status)}
          </DialogTitle>
          {selectedOrder && (
            <DialogDescription className="font-mono">
              ID: {selectedOrder.id}
            </DialogDescription>
          )}
        </DialogHeader>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[100px] w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Order summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium mb-2">Order Information</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Created</dt>
                      <dd>{selectedOrder ? format(new Date(selectedOrder.created_at), 'MMM dd, yyyy HH:mm') : ''}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Status</dt>
                      <dd>
                        {selectedOrder?.status.charAt(0).toUpperCase() + selectedOrder?.status.slice(1)}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium mb-2">Customer Information</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Email</dt>
                      <dd>{selectedOrder?.profiles?.email || 'Unknown'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Username</dt>
                      <dd>{selectedOrder?.profiles?.username || 'N/A'}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
            
            {/* Order items */}
            <div>
              <h3 className="text-sm font-medium mb-3">Order Items</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">Product</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {item.product?.image_url ? (
                              <img 
                                src={item.product.image_url} 
                                alt={item.product.name} 
                                className="h-10 w-10 rounded object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded bg-muted"></div>
                            )}
                            <div>
                              <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                              {item.product?.slug && (
                                <p className="text-xs text-muted-foreground">{item.product.slug}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">${Number(item.price).toFixed(2)}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right font-medium">${Number(item.total).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    
                    {(!orderItems || orderItems.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          No order items found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            {/* Order summary */}
            <div className="flex justify-end">
              <div className="w-64 space-y-4">
                <Separator />
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${Number(selectedOrder?.total_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between text-lg font-medium">
                    <span>Total</span>
                    <span>${Number(selectedOrder?.total_amount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Digital product keys if available */}
            {orderItems?.some(item => item.data?.product_keys) && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Digital Product Keys</h3>
                <Card>
                  <CardContent className="pt-6">
                    {orderItems.filter(item => item.data?.product_keys).map((item, idx) => (
                      <div key={idx} className="mb-3">
                        <h4 className="text-sm font-medium">{item.product?.name || 'Product'}</h4>
                        <div className="mt-1 space-y-1">
                          {item.data.product_keys.map((key: string, keyIdx: number) => (
                            <code key={keyIdx} className="block p-2 bg-muted rounded text-xs font-mono">
                              {key}
                            </code>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter className="gap-2 sm:gap-0">
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

// Also export this as OrderDetailsDialogEnhanced to match the import
export const OrderDetailsDialogEnhanced = OrderDetailsDialog;
