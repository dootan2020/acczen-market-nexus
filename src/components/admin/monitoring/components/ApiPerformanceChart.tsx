
import React from 'react';
import { format } from 'date-fns';
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
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
      <CardHeader>
        <CardTitle>API Performance</CardTitle>
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
        <div className="h-[300px]">
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
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                    height={40}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="left" 
                    orientation="left"
                    tick={{ fontSize: 12 }}
                    label={{ value: 'API Calls', angle: -90, position: 'insideLeft', dy: 50, fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Success % / Time (ms)', angle: -90, position: 'insideRight', dx: -10, fontSize: 12 }}
                  />
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent 
                        formatter={(value: number, name: string) => {
                          if (name === 'successRate') return [`${value.toFixed(0)}%`, 'Success Rate'];
                          if (name === 'avgTime') return [`${value.toFixed(0)}ms`, 'Avg Response Time'];
                          return [value.toString(), 'API Calls'];
                        }}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="calls"
                    name="calls"
                    stroke="#6b7280"
                    strokeWidth={2}
                    yAxisId="left"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="successRate"
                    name="successRate"
                    stroke="#22c55e"
                    strokeWidth={2}
                    yAxisId="right"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgTime"
                    name="avgTime"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    yAxisId="right"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
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
