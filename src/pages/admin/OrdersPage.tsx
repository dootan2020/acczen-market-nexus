
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { 
  BarChart3, 
  Download,
  Calendar, 
  Search, 
  Filter, 
  RefreshCw,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useOrderManagementEnhanced } from '@/hooks/admin/useOrderManagementEnhanced';
import { OrdersTableEnhanced } from '@/components/admin/orders/OrdersTableEnhanced';
import { OrderFiltersEnhanced } from '@/components/admin/orders/OrderFiltersEnhanced';
import { OrderDetailsDialogEnhanced } from '@/components/admin/orders/OrderDetailsDialogEnhanced';
import { OrderStatusDialog } from '@/components/admin/orders/OrderActions';
import { exportOrdersToCsv } from '@/utils/exportUtils';
import { OrderStatus } from '@/types/orders';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';

const OrdersPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);
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

  const handleExportOrders = async () => {
    setIsExporting(true);
    try {
      let query = supabase
        .from('orders')
        .select('*, profiles!orders_user_id_fkey(id, username, email)')
        .order('created_at', { ascending: false });

      // Apply filters
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      if (dateRange?.from) {
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        query = query.gte('created_at', fromDate.toISOString());
      }

      if (dateRange?.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', toDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Filter by search query if needed (client-side)
      let filteredData = data;
      if (searchQuery && filteredData) {
        const lowerQuery = searchQuery.toLowerCase();
        filteredData = data.filter(order => {
          const orderIdMatch = order.id.toLowerCase().includes(lowerQuery);
          // Use type assertion here to help TypeScript understand the structure
          const profiles = order.profiles as { email?: string; username?: string } | null;
          
          const emailMatch = profiles?.email 
            ? profiles.email.toLowerCase().includes(lowerQuery)
            : false;
            
          const usernameMatch = profiles?.username 
            ? profiles.username.toLowerCase().includes(lowerQuery)
            : false;
          
          return orderIdMatch || emailMatch || usernameMatch;
        });
      }

      // Export to CSV
      if (filteredData && filteredData.length > 0) {
        // Transform data for CSV export
        const exportData = filteredData.map(order => {
          // Use type assertion here as well
          const profiles = order.profiles as { email?: string; username?: string } | null;
          
          return {
            ...order,
            // Map profiles to user field for compatibility with exportOrdersToCsv
            user: profiles ? { 
              email: profiles.email,
              username: profiles.username
            } : undefined
          };
        });
        
        exportOrdersToCsv(exportData, `orders-export-${new Date().toISOString().split('T')[0]}`);
        
        toast.success(`${filteredData.length} orders exported to CSV`);
      } else {
        toast.error("No orders match your filter criteria");
      }
    } catch (err) {
      console.error('Error exporting orders:', err);
      toast.error("Failed to export orders");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <Button 
          onClick={handleExportOrders} 
          disabled={isExporting}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <Calendar className="h-3 w-3 mr-1" /> All time
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <Clock className="h-3 w-3 mr-1" /> Awaiting processing
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{completedOrders}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <RefreshCw className="h-3 w-3 mr-1" /> Successfully delivered
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{failedOrders}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <BarChart3 className="h-3 w-3 mr-1" /> Require attention
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Search & Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by Order ID or Email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            
            <DateRangePicker 
              date={dateRange}
              onDateChange={setDateRange}
              align="start"
              className="w-full"
            />
            
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setStatusFilter(null);
              setDateRange(undefined);
            }} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        </div>
        
        <div className="rounded-md border">
          <OrdersTableEnhanced 
            orders={filteredOrders || []}
            onViewOrder={handleViewOrder}
            onUpdateStatusDialog={handleUpdateStatusDialog}
            isLoading={isLoading}
          />
        </div>
        
        <div className="mt-4 flex justify-center">
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
