
import React from 'react';
import { format } from 'date-fns';
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { ChartData } from '../types';

interface ApiPerformanceChartProps {
  chartData: ChartData[];
  timeRange: number;
  setTimeRange: (days: number) => void;
}

export function ApiPerformanceChart({ 
  chartData, 
  timeRange, 
  setTimeRange 
}: ApiPerformanceChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">API Performance</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant={timeRange === 7 ? "default" : "outline"} 
            size="sm"
            onClick={() => setTimeRange(7)}
          >
            7 days
          </Button>
          <Button 
            variant={timeRange === 14 ? "default" : "outline"} 
            size="sm"
            onClick={() => setTimeRange(14)}
          >
            14 days
          </Button>
          <Button 
            variant={timeRange === 30 ? "default" : "outline"} 
            size="sm"
            onClick={() => setTimeRange(30)}
          >
            30 days
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          {chartData.length > 0 ? (
            <ChartContainer
              config={{
                calls: {
                  label: "API Calls"
                },
                successRate: {
                  color: "#22c55e",
                  label: "Success Rate"
                },
                avgTime: {
                  color: "#3b82f6",
                  label: "Avg Response Time"
                }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 40, left: 30, bottom: 30 }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    horizontal={true} 
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                    height={40}
                    tick={{ fontSize: 12, fill: '#888' }}
                    padding={{ left: 20, right: 20 }}
                    tickMargin={10}
                    minTickGap={15}
                  />
                  <YAxis 
                    yAxisId="left" 
                    orientation="left"
                    tick={{ fontSize: 12, fill: '#888' }}
                    tickFormatter={(value) => `${value}`}
                    domain={['auto', 'auto']}
                    label={{ 
                      value: 'API Calls', 
                      angle: -90, 
                      position: 'insideLeft', 
                      dy: 50, 
                      fontSize: 12,
                      fill: '#666'
                    }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tick={{ fontSize: 12, fill: '#888' }}
                    tickFormatter={(value) => 
                      value > 100 ? `${Math.round(value)}ms` : `${value}%`
                    }
                    domain={[0, 'dataMax + 10']}
                    label={{ 
                      value: 'Success % / Time (ms)', 
                      angle: -90, 
                      position: 'insideRight', 
                      dx: -10, 
                      fontSize: 12,
                      fill: '#666'
                    }}
                  />
                  <Tooltip 
                    content={
                      <CustomTooltip />
                    }
                    wrapperStyle={{ outline: 'none' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={30} 
                    align="right" 
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: '10px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="calls"
                    name="API Calls"
                    stroke="#6b7280"
                    strokeWidth={2}
                    yAxisId="left"
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="successRate"
                    name="Success Rate"
                    stroke="#22c55e"
                    strokeWidth={2}
                    yAxisId="right"
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgTime"
                    name="Avg Response Time"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    yAxisId="right"
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 1 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No data available for the selected period</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Custom tooltip component for better formatting
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border/50 rounded-lg shadow-md p-3">
        <p className="text-sm font-medium mb-2">{format(new Date(label), 'MMMM d, yyyy')}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center mb-1 last:mb-0">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-muted-foreground">{entry.name}: </span>
            <span className="text-xs font-medium ml-1">
              {entry.name === 'Success Rate' 
                ? `${entry.value.toFixed(1)}%` 
                : entry.name === 'Avg Response Time' 
                  ? `${entry.value.toFixed(0)}ms` 
                  : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};
