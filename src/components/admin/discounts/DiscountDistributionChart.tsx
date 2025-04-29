
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DiscountDistributionChartProps {
  data: Array<{
    discount_range: string;
    user_count: number;
  }>;
  isLoading: boolean;
}

export function DiscountDistributionChart({ data, isLoading }: DiscountDistributionChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Discount Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const hasData = data && data.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discount Distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        {!hasData ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No discount data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="discount_range" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [value, 'Users']}
                labelFormatter={(label) => `Discount: ${label}`}
              />
              <Bar dataKey="user_count" fill="#2ECC71" name="Users" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
