
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DateRange } from 'react-day-picker';
import { useOrderManagementEnhanced } from '@/hooks/admin/useOrderManagementEnhanced';
import { OrdersTableEnhanced } from '@/components/admin/orders/OrdersTableEnhanced';
import { OrderDetailsDialogEnhanced } from '@/components/admin/orders/OrderDetailsDialogEnhanced';
import { OrderStatusDialog } from '@/components/admin/orders/OrderActions';
import { OrderStatCards } from '@/components/admin/orders/OrderStatCards';
import { OrderSearchFilters } from '@/components/admin/orders/OrderSearchFilters';
import { OrderPagination } from '@/components/admin/orders/OrderPagination';
import { OrderExportButton } from '@/components/admin/orders/OrderExportButton';

const OrdersPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
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
    handleUpdateStatus,
    updateStatusMutation
  } = useOrderManagementEnhanced();

  // Calculate order statistics
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;
  const completedOrders = orders?.filter(order => order.status === 'completed').length || 0;
  const failedOrders = orders?.filter(order => order.status === 'failed').length || 0;

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter(null);
    setDateRange(undefined);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <OrderExportButton 
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          dateRange={dateRange}
        />
      </div>
      
      {/* Summary Cards */}
      <OrderStatCards
        totalOrders={totalOrders}
        pendingOrders={pendingOrders}
        completedOrders={completedOrders}
        failedOrders={failedOrders}
      />
      
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
        <OrderSearchFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          resetFilters={resetFilters}
        />
        
        <div className="rounded-md border">
          <OrdersTableEnhanced 
            orders={filteredOrders || []}
            onViewOrder={handleViewOrder}
            onUpdateStatusDialog={handleUpdateStatusDialog}
            isLoading={isLoading}
          />
        </div>
        
        <OrderPagination
          currentPage={currentPage}
          totalPages={totalPages}
          prevPage={prevPage}
          nextPage={nextPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
        />
      </div>
      
      <OrderDetailsDialogEnhanced 
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        selectedOrder={currentOrder}
        orderItems={orderItems}
        isLoading={orderItemsLoading}
        onUpdateStatusClick={() => {
          if (currentOrder) {
            setIsViewDialogOpen(false);
            handleUpdateStatusDialog(currentOrder);
          }
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

export default OrdersPage;
