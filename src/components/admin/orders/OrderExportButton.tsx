
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { OrderStatus } from '@/types/orders';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { exportOrdersToCsv } from '@/utils/exportUtils';

interface OrderExportButtonProps {
  searchQuery: string;
  statusFilter: string | null;
  dateRange: DateRange | undefined;
}

export const OrderExportButton: React.FC<OrderExportButtonProps> = ({
  searchQuery,
  statusFilter,
  dateRange
}) => {
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
        // Cast statusFilter to the valid OrderStatus type
        const validStatus = statusFilter as OrderStatus;
        query = query.eq('status', validStatus);
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
    <Button 
      onClick={handleExportOrders} 
      disabled={isExporting}
      variant="outline"
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      {isExporting ? "Exporting..." : "Export CSV"}
    </Button>
  );
};
