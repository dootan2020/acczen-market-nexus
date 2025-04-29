
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { OrdersTable } from '@/components/admin/orders/OrdersTableEnhanced';
import { OrderFiltersEnhanced } from '@/components/admin/orders/OrderFiltersEnhanced';
import { OrderStatusDialog } from '@/components/admin/orders/OrderActions';
import { OrderDetailsDialog } from '@/components/admin/orders/OrderDetailsDialogEnhanced';
import { OrdersPagination } from '@/components/admin/orders/OrdersPagination';
import { useOrderManagementEnhanced } from '@/hooks/admin/useOrderManagementEnhanced';
import { OrderWithProfile } from '@/types/orders';
import { exportToCsv } from '@/utils/exportUtils';

const AdminOrdersEnhanced = () => {
  const {
    orders,
    filteredOrders,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateRange,
    setDateRange,
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
  } = useOrderManagementEnhanced();
  
  const handleExportCsv = () => {
    if (!filteredOrders?.length) return;
    
    // Prepare data for CSV export
    const csvData = filteredOrders.map(order => ({
      Order_ID: order.id,
      Customer: order.profiles?.email || 'Unknown',
      Status: order.status,
      Date: new Date(order.created_at).toLocaleString(),
      Total: `$${Number(order.total_amount).toFixed(2)}`
    }));
    
    exportToCsv(csvData, `orders_export_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="container px-4 sm:px-6 w-full max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Orders</h1>
        <Button 
          onClick={handleExportCsv} 
          disabled={!filteredOrders?.length || isLoading}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export to CSV
        </Button>
      </div>
      
      <OrderFiltersEnhanced
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      
      <Card className="overflow-hidden">
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
      
      <div className="mt-4">
        <OrdersPagination
          currentPage={currentPage}
          totalPages={totalPages}
          prevPage={prevPage}
          nextPage={nextPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
        />
      </div>
      
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

export default AdminOrdersEnhanced;
