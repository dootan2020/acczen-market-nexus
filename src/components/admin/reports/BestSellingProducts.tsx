
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BestSellingProductsProps {
  dateRange: DateRange | undefined;
}

interface ProductSales {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  category_name: string | null;
}

export function BestSellingProducts({ dateRange }: BestSellingProductsProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { data, isLoading } = useQuery({
    queryKey: ['best-selling-products', dateRange, page, pageSize],
    queryFn: async () => {
      // Format dates for the query
      const fromDate = dateRange?.from 
        ? new Date(dateRange.from).toISOString()
        : new Date(new Date().setDate(new Date().getDate() - 30)).toISOString();
      
      const toDate = dateRange?.to
        ? new Date(dateRange.to).toISOString()
        : new Date().toISOString();
        
      // Get order items with product info
      const { data, error, count } = await supabase
        .from('order_items')
        .select(`
          id,
          price,
          quantity,
          total,
          product:products(id, name, category_id),
          order:orders(created_at, status)
        `, { count: 'exact' })
        .gte('order.created_at', fromDate)
        .lte('order.created_at', toDate)
        .eq('order.status', 'completed');
      
      if (error) throw error;
      
      // Get categories for mapping
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name');
      
      const categoryMap = new Map();
      categories?.forEach(cat => categoryMap.set(cat.id, cat.name));
      
      // Process data to calculate sales by product
      const productSalesMap = new Map();
      
      data?.forEach(item => {
        const productId = item.product?.id;
        const productName = item.product?.name;
        const categoryId = item.product?.category_id;
        
        if (productId && productName) {
          if (!productSalesMap.has(productId)) {
            productSalesMap.set(productId, {
              id: productId,
              name: productName,
              orders: 0,
              revenue: 0,
              category_name: categoryId ? categoryMap.get(categoryId) : null
            });
          }
          
          const productStats = productSalesMap.get(productId);
          productStats.orders += item.quantity || 1;
          productStats.revenue += item.total || 0;
        }
      });
      
      // Convert to array and sort by revenue
      const productSales = Array.from(productSalesMap.values());
      const sortedSales = productSales.sort((a, b) => b.revenue - a.revenue);
      
      // Total count for pagination
      const totalCount = sortedSales.length;
      
      // Paginate results
      const paginatedResults = sortedSales.slice((page - 1) * pageSize, page * pageSize);
      
      return {
        items: paginatedResults,
        totalCount,
        pageCount: Math.ceil(totalCount / pageSize)
      };
    },
    enabled: !!dateRange?.from, // Only require from date to be present
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const totalPages = data?.pageCount || 1;
  
  // Handlers for pagination
  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  
  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value));
    setPage(1); // Reset to first page when changing page size
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Best Selling Products</CardTitle>
        <Select
          value={pageSize.toString()}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select rows" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 rows</SelectItem>
            <SelectItem value="10">10 rows</SelectItem>
            <SelectItem value="20">20 rows</SelectItem>
            <SelectItem value="50">50 rows</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <SkeletonTable rows={5} columns={4} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Units Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items && data.items.length > 0 ? (
                  data.items.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category_name || 'Uncategorized'}</TableCell>
                      <TableCell className="text-right">{product.orders}</TableCell>
                      <TableCell className="text-right">${product.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">No sales data available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      {data && data.totalCount > 0 && (
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, data.totalCount)} of {data.totalCount} items
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handlePrevPage} 
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleNextPage} 
              disabled={page >= totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

export default BestSellingProducts;
