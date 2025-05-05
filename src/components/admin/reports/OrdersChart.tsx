
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { OrdersChartData } from '@/types/reports';
import { formatCurrency } from '@/utils/formatters';

interface OrdersChartProps {
  data: OrdersChartData[];
  height?: number;
}

export const OrdersChart: React.FC<OrdersChartProps> = ({ data, height = 300 }) => {
  // Format data for display
  const chartData = data.map(item => ({
    name: item.date.slice(5), // Just show MM-DD
    count: item.count,
    amount: item.amount
  }));

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" orientation="left" />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === 'amount') {
                return [formatCurrency(Number(value)), 'Order Amount'];
              }
              return [value, 'Order Count'];
            }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="count" name="Orders" fill="#3498DB" />
          <Bar yAxisId="right" dataKey="amount" name="Amount" fill="#F1C40F" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
