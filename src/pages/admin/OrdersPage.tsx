
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { Download } from 'lucide-react';
import AdminOrdersEnhanced from '@/components/admin/orders/AdminOrdersEnhanced';
import { exportOrdersToCsv } from '@/utils/exportUtils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OrderStatus } from '@/types/orders';

const OrdersPage: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);

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
          const emailMatch = order.profiles?.email 
            ? order.profiles.email.toLowerCase().includes(lowerQuery)
            : false;
          const usernameMatch = order.profiles?.username 
            ? order.profiles.username.toLowerCase().includes(lowerQuery)
            : false;
          
          return orderIdMatch || emailMatch || usernameMatch;
        });
      }

      // Export to CSV
      if (filteredData && filteredData.length > 0) {
        // Transform data for CSV export - map profiles to user field for compatibility
        const exportData = filteredData.map(order => ({
          ...order,
          user: order.profiles // Map profiles to user field for compatibility with exportOrdersToCsv
        }));
        
        exportOrdersToCsv(exportData, `orders-export-${new Date().toISOString().split('T')[0]}`);
        
        toast({
          title: "Export Successful",
          description: `${filteredData.length} orders exported to CSV`,
        });
      } else {
        toast({
          title: "No Data to Export",
          description: "No orders match your filter criteria",
          variant: "destructive"
        });
      }
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
      
      <AdminOrdersEnhanced />
    </div>
  );
};

export default OrdersPage;
