
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SkeletonChartBar, SkeletonTable } from '@/components/ui/skeleton';

// Sample data for best selling products
const data = [
  { name: 'Gmail Account', sales: 120, revenue: 2400 },
  { name: 'Instagram Account', sales: 98, revenue: 4900 },
  { name: 'Facebook Account', sales: 86, revenue: 3800 },
  { name: 'Twitter Account', sales: 72, revenue: 2800 },
  { name: 'Windows Key', sales: 65, revenue: 3250 },
  { name: 'Office 365', sales: 55, revenue: 2750 },
];

interface BestSellingProductsProps {
  isLoading?: boolean;
}

export const BestSellingProducts: React.FC<BestSellingProductsProps> = ({ isLoading = false }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Best Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <SkeletonChartBar />
          <SkeletonTable rows={5} columns={3} />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Best Selling Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" name="Units Sold" fill="#3498DB" />
              <Bar dataKey="revenue" name="Revenue ($)" fill="#19C37D" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-3 px-4 font-medium">Product</th>
                <th className="text-right py-3 px-4 font-medium">Units Sold</th>
                <th className="text-right py-3 px-4 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.map((product, i) => (
                <tr key={i} className={i !== data.length - 1 ? "border-b" : ""}>
                  <td className="py-3 px-4">{product.name}</td>
                  <td className="text-right py-3 px-4">{product.sales}</td>
                  <td className="text-right py-3 px-4">${product.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
