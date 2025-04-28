
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { OrdersTable } from '@/components/admin/orders/OrdersTable';
import { OrderFilters } from '@/components/admin/orders/OrderFilters';
import { OrderStatusDialog } from '@/components/admin/orders/OrderActions';
import { OrderDetailsDialog } from '@/components/admin/orders/OrderDetailsDialog';
import { OrdersPagination } from '@/components/admin/orders/OrdersPagination';
import { useOrderManagement } from '@/hooks/admin/useOrderManagement';
import { OrderWithProfile } from '@/types/orders';

const AdminOrders = () => {
  const {
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
    prevPage,
    nextPage,
    hasNextPage,
    hasPrevPage,
    handleViewOrder,
    handleUpdateStatusDialog,
    handleUpdateStatus
  } = useOrderManagement();

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
      
      <OrdersPagination
        currentPage={currentPage}
        totalPages={totalPages}
        prevPage={prevPage}
        nextPage={nextPage}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
      />
      
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
        isPending={false} // Handled by the mutation in the hook
      />
    </div>
  );
};

export default AdminOrders;
