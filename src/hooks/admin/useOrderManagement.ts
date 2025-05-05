
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OrderWithProfile, OrderStatus } from '@/types/orders';
import { useAdminPagination } from '@/hooks/useAdminPagination';

export const useOrderManagement = () => {
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
      toast.success('Order status updated successfully');
      setIsUpdateStatusDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to update order status', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
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

  return {
    orders,
    filteredOrders,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    currentOrder,
    setCurrentOrder,
    isViewDialogOpen,
    setIsViewDialogOpen,
    isUpdateStatusDialogOpen,
    setIsUpdateStatusDialogOpen,
    selectedStatus,
    setSelectedStatus,
    orderItems,
    orderItemsLoading,
    isLoading,
    currentPage,
    totalPages,
    goToPage,
    prevPage,
    nextPage,
    hasNextPage,
    hasPrevPage,
    handleViewOrder,
    handleUpdateStatusDialog,
    handleUpdateStatus,
    updateStatusMutation
  };
};
