
import { OrderWithProfile } from '@/types/orders';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Database } from '@/integrations/supabase/types';

// Define order status type based on the database enum
type OrderStatus = Database['public']['Enums']['order_status'];

interface OrderStatusDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOrder: OrderWithProfile | null;
  selectedStatus: OrderStatus;
  onStatusChange: (status: OrderStatus) => void;
  onUpdateStatus: () => void;
  isPending: boolean;
}

export const OrderStatusDialog = ({
  isOpen,
  onOpenChange,
  selectedOrder,
  selectedStatus,
  onStatusChange,
  onUpdateStatus,
  isPending
}: OrderStatusDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Select the new status for order #{selectedOrder?.id.slice(0, 8)}...
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select
            value={selectedStatus}
            onValueChange={(value) => onStatusChange(value as OrderStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={onUpdateStatus}
            disabled={isPending || selectedStatus === selectedOrder?.status}
          >
            {isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2"></div>
                Updating...
              </>
            ) : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
