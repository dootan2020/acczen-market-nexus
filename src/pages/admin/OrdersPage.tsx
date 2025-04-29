
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { Download } from 'lucide-react';
import AdminOrdersEnhanced from '@/components/admin/orders/AdminOrdersEnhanced';
import { exportOrdersToCsv } from '@/utils/exportUtils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const OrdersPage: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportOrders = async () => {
    setIsExporting(true);
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          user:profiles(username, email),
          items:order_items(name, quantity, price)
        `)
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

      if (searchQuery) {
        // Search is more complex and would require a more sophisticated approach
        // For now, we'll just get all orders and filter client-side
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Filter by search query if needed (client-side)
      let filteredData = data;
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filteredData = data.filter(order => 
          order.id.toLowerCase().includes(lowerQuery) ||
          order.user?.email?.toLowerCase().includes(lowerQuery) ||
          order.user?.username?.toLowerCase().includes(lowerQuery)
        );
      }

      // Export to CSV
      exportOrdersToCsv(filteredData, `orders-export-${new Date().toISOString().split('T')[0]}`);
      
      toast({
        title: "Export Successful",
        description: `${filteredData.length} orders exported to CSV`,
      });
    } catch (err) {
      console.error('Error exporting orders:', err);
      toast({
        title: "Export Failed",
        description: "There was an error exporting orders",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
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
      
      <AdminOrdersEnhanced
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
    </div>
  );
};

export default OrdersPage;
