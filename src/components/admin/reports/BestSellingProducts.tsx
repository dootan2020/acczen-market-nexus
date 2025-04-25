
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BestSellingProductsProps {
  dateRange: {
    from: Date;
    to: Date;
  } | undefined;
}

interface ProductSales {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  category_name: string | null;
}

export function BestSellingProducts({ dateRange }: BestSellingProductsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['best-selling-products', dateRange],
    queryFn: async () => {
      // Format dates for the query
      const fromDate = dateRange?.from 
        ? new Date(dateRange.from).toISOString()
        : new Date(new Date().setDate(new Date().getDate() - 30)).toISOString();
      
      const toDate = dateRange?.to
        ? new Date(dateRange.to).toISOString()
        : new Date().toISOString();
        
      // Get order items with product info
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          price,
          quantity,
          total,
          product:products(id, name, category_id),
          order:orders(created_at, status)
        `)
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
      return productSales.sort((a, b) => b.revenue - a.revenue);
    },
    enabled: !!dateRange?.from && !!dateRange?.to
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Best Selling Products</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
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
                {data && data.length > 0 ? (
                  data.slice(0, 10).map((product) => (
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
    </Card>
  );
}
