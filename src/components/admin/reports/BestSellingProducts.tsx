
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { type DateRange } from '@/components/ui/date-range-picker';
import { format } from 'date-fns';
import ExportButtons from './ExportButtons';
import { DataPagination } from './DataPagination';

interface Product {
  id: string;
  name: string;
  total_sold: number;
  total_amount: number;
}

interface BestSellingProductsProps {
  dateRange: DateRange;
}

const COLORS = ['#2ECC71', '#27AE60', '#3DB573', '#45C985', '#4FDA9A'];

const BestSellingProducts = ({ dateRange }: BestSellingProductsProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const fetchBestSellingProducts = async () => {
    let query = supabase
      .from('order_items')
      .select(`
        product_id,
        products:product_id(id, name),
        quantity,
        price,
        orders:order_id(created_at)
      `)
      .eq('orders.status', 'completed');
    
    if (dateRange.from) {
      query = query.gte('orders.created_at', format(dateRange.from, 'yyyy-MM-dd'));
    }
    
    if (dateRange.to) {
      query = query.lte('orders.created_at', format(dateRange.to, 'yyyy-MM-dd'));
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Process data to get product totals
    const productMap = new Map();
    
    data.forEach(item => {
      const productId = item.product_id;
      const productName = item.products?.name || 'Unknown Product';
      const quantity = item.quantity;
      const totalAmount = item.price * item.quantity;
      
      if (productMap.has(productId)) {
        const product = productMap.get(productId);
        product.total_sold += quantity;
        product.total_amount += totalAmount;
      } else {
        productMap.set(productId, {
          id: productId,
          name: productName,
          total_sold: quantity,
          total_amount: totalAmount
        });
      }
    });
    
    // Convert to array and sort by total sold
    return Array.from(productMap.values())
      .sort((a, b) => b.total_sold - a.total_sold);
  };
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['bestSellingProducts', dateRange],
    queryFn: fetchBestSellingProducts,
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
  
  // Calculate pagination
  const offset = (currentPage - 1) * pageSize;
  const paginatedProducts = products ? products.slice(offset, offset + pageSize) : [];
  const totalProducts = products?.length || 0;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Best Selling Products</CardTitle>
          <CardDescription>Products with highest sales volume</CardDescription>
        </div>
        <ExportButtons
          data={products || []}
          fileName={`best-selling-products-${format(new Date(), 'yyyy-MM-dd')}`}
          dateRange={dateRange}
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No products data available for the selected period.
          </div>
        ) : (
          <div className="space-y-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paginatedProducts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }} 
                  tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value} 
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => name === 'total_sold' ? `${value} units` : `$${Number(value).toFixed(2)}`}
                  labelFormatter={(name) => `Product: ${name}`}
                />
                <Bar dataKey="total_sold" name="Units Sold" radius={[4, 4, 0, 0]}>
                  {paginatedProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-muted-foreground">
                    <th className="h-10 px-4 text-left font-medium">Product</th>
                    <th className="h-10 px-4 text-right font-medium">Units Sold</th>
                    <th className="h-10 px-4 text-right font-medium">Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product, i) => (
                    <tr key={product.id} className="border-b">
                      <td className="p-4">{product.name}</td>
                      <td className="p-4 text-right">{product.total_sold}</td>
                      <td className="p-4 text-right">${product.total_amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <DataPagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
              totalItems={totalProducts}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BestSellingProducts;
