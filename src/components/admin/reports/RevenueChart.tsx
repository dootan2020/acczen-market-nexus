
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { DepositsChartData } from '@/types/reports';
import { formatCurrency } from '@/utils/formatters';

interface RevenueChartProps {
  data: DepositsChartData[];
  height?: number;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, height = 300 }) => {
  // Format data for display
  const chartData = data.map(item => ({
    name: item.date.slice(5), // Just show MM-DD
    value: item.amount,
    count: item.count
  }));

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#2ECC71" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="name" />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value)} 
          />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip 
            formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="value" 
            name="Revenue" 
            stroke="#2ECC71" 
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
