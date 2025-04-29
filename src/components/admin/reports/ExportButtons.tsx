
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { 
  exportToCsv, 
  formatDepositsForExport,
  formatOrdersForExport,
  formatProductsForExport
} from "@/utils/export/csvExport";
import { toast } from "sonner";

interface ExportButtonsProps {
  activeTab: string;
  depositsData?: any[];
  ordersData?: any[];
  productsData?: any[];
  isLoading: boolean;
  dateRange?: { from: Date; to: Date } | undefined;
}

export function ExportButtons({
  activeTab,
  depositsData = [],
  ordersData = [],
  productsData = [],
  isLoading,
  dateRange
}: ExportButtonsProps) {
  // Get date range string for file naming
  const getDateRangeString = () => {
    if (!dateRange?.from) return 'all';
    
    const fromDate = dateRange.from.toISOString().split('T')[0];
    const toDate = dateRange.to ? dateRange.to.toISOString().split('T')[0] : 'now';
    
    return `${fromDate}_to_${toDate}`;
  };
  
  const handleExport = () => {
    try {
      // Get the appropriate data based on active tab
      let exportData;
      let fileName;

      switch(activeTab) {
        case 'deposits':
          if (!depositsData?.length) {
            toast.error("No deposit data to export");
            return;
          }
          exportData = formatDepositsForExport(depositsData);
          fileName = `deposits_${getDateRangeString()}`;
          break;
          
        case 'orders':
          if (!ordersData?.length) {
            toast.error("No order data to export");
            return;
          }
          exportData = formatOrdersForExport(ordersData);
          fileName = `orders_${getDateRangeString()}`;
          break;
          
        case 'products':
          if (!productsData?.length) {
            toast.error("No product data to export");
            return;
          }
          exportData = formatProductsForExport(productsData);
          fileName = `products_${getDateRangeString()}`;
          break;
          
        default:
          // For overview, export all data
          if (!depositsData?.length && !ordersData?.length) {
            toast.error("No data to export");
            return;
          }
          
          const combinedData = {
            deposits: formatDepositsForExport(depositsData || []),
            orders: formatOrdersForExport(ordersData || []),
            products: formatProductsForExport(productsData || [])
          };
          
          // Export each as separate files
          if (depositsData?.length) {
            exportToCsv(combinedData.deposits, { fileName: `deposits_${getDateRangeString()}` });
          }
          
          if (ordersData?.length) {
            exportToCsv(combinedData.orders, { fileName: `orders_${getDateRangeString()}` });
          }
          
          if (productsData?.length) {
            exportToCsv(combinedData.products, { fileName: `products_${getDateRangeString()}` });
          }
          
          toast.success("Reports exported successfully");
          return;
      }
      
      exportToCsv(exportData, { fileName });
      toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} data exported successfully`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data. Please try again.");
    }
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1"
      onClick={handleExport}
      disabled={isLoading}
    >
      <Download className="h-4 w-4 mr-1" />
      Export CSV
    </Button>
  );
}
