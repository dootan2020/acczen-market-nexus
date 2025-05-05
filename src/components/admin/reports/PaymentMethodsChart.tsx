
import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { ChartData } from '@/types/reports';
import { formatCurrency } from '@/utils/formatters';

interface PaymentMethodsChartProps {
  data: ChartData[];
}

export const PaymentMethodsChart: React.FC<PaymentMethodsChartProps> = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Ensure all data items have a value property, defaulting to 0 if missing
  const safeData = data.map(item => ({
    ...item,
    value: typeof item.value === 'undefined' ? 0 : item.value
  }));
  
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={safeData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {safeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
