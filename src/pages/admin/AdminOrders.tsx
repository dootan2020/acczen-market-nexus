
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { OrdersTable } from '@/components/admin/orders/OrdersTable';
import { OrderFilters } from '@/components/admin/orders/OrderFilters';
import { OrderStatusDialog } from '@/components/admin/orders/OrderActions';
import { OrderDetailsDialog } from '@/components/admin/orders/OrderDetailsDialog';
import { useAdminPagination } from '@/hooks/useAdminPagination';
import { OrderWithProfile, OrderStatus } from '@/types/orders';

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<OrderWithProfile | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('pending');

  // Use the pagination hook for orders
  const { 
    data: orders,
    isLoading,
    currentPage,
    totalPages,
    goToPage,
    prevPage,
    nextPage,
    hasNextPage,
    hasPrevPage
  } = useAdminPagination<OrderWithProfile>(
    'orders',
    ['admin-orders'],
    { pageSize: 10 },
    {},
    `*, profiles:user_id(id, email, username)`
  );

  // Fetch order details (items) when viewing a specific order
  const { data: orderItems, isLoading: orderItemsLoading } = useQuery({
    queryKey: ['admin-order-items', currentOrder?.id],
    queryFn: async () => {
      if (!currentOrder) return null;
      
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          product:product_id(id, name, slug, image_url)
        `)
        .eq('order_id', currentOrder.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrder && isViewDialogOpen
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: OrderStatus }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({
        title: 'Order status updated',
        description: 'The order status has been updated successfully.',
      });
      setIsUpdateStatusDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update order status',
      });
    },
  });

  // Handler functions
  const handleViewOrder = (order: OrderWithProfile) => {
    setCurrentOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleUpdateStatusDialog = (order: OrderWithProfile) => {
    setCurrentOrder(order);
    setSelectedStatus(order.status);
    setIsUpdateStatusDialogOpen(true);
  };

  const handleUpdateStatus = () => {
    if (currentOrder && selectedStatus) {
      updateStatusMutation.mutate({ id: currentOrder.id, status: selectedStatus });
    }
  };

  // Filter orders by search query and status
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.profiles?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
      </div>
      
      <OrderFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <OrdersTable 
              orders={filteredOrders || []}
              onViewOrder={handleViewOrder}
              onUpdateStatusDialog={handleUpdateStatusDialog}
              isLoading={isLoading}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Add pagination controls if needed */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={prevPage}
              disabled={!hasPrevPage}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={nextPage}
              disabled={!hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      
      {/* Dialogs */}
      <OrderDetailsDialog 
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        selectedOrder={currentOrder}
        orderItems={orderItems}
        isLoading={orderItemsLoading}
        onUpdateStatusClick={() => {
          setIsViewDialogOpen(false);
          handleUpdateStatusDialog(currentOrder as OrderWithProfile);
        }}
      />
      
      <OrderStatusDialog 
        isOpen={isUpdateStatusDialogOpen}
        onOpenChange={setIsUpdateStatusDialogOpen}
        selectedOrder={currentOrder}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onUpdateStatus={handleUpdateStatus}
        isPending={updateStatusMutation.isPending}
      />
    </div>
  );
};

export default AdminOrders;
