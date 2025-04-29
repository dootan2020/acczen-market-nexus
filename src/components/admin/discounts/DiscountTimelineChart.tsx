
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface DiscountTimelineChartProps {
  data: Array<{
    date: string;
    total_discount: number;
  }>;
  isLoading: boolean;
}

export function DiscountTimelineChart({ data, isLoading }: DiscountTimelineChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Discount Timeline</CardTitle>
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
        <CardTitle>Discount Timeline</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        {!hasData ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No timeline data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tickFormatter={(date) => format(parseISO(date), 'MMM dd')}
              />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total Discount']}
                labelFormatter={(date) => format(parseISO(date), 'MMMM d, yyyy')}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total_discount" 
                stroke="#2ECC71" 
                name="Total Discount" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
