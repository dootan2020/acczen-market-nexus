
import React from 'react';
import { format } from 'date-fns';
import { CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { ApiStats } from '../types';

interface ApiStatsCardsProps {
  apiStats: ApiStats;
  timeRange: number;
}

export function ApiStatsCards({ apiStats, timeRange }: ApiStatsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-4">
      <Card className="h-full">
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{apiStats.total}</p>
          <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
        </CardContent>
      </Card>
      
      <Card className="h-full">
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {apiStats.total > 0 ? 
              `${Math.round((apiStats.success / apiStats.total) * 100)}%` : 
              'N/A'}
          </p>
          <div className="flex items-center">
            <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
            <p className="text-xs text-muted-foreground">
              {apiStats.success} successful / {apiStats.failed} failed
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="h-full">
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {apiStats.avgResponseTime > 0 ? 
              `${apiStats.avgResponseTime.toFixed(0)}ms` : 
              'N/A'}
          </p>
          <p className="text-xs text-muted-foreground">Across all endpoints</p>
        </CardContent>
      </Card>
      
      <Card className="h-full">
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {apiStats.lastSync ? 
              format(new Date(apiStats.lastSync), 'HH:mm:ss') : 
              'Never'}
          </p>
          {apiStats.lastSync && (
            <p className="text-xs text-muted-foreground">
              {format(new Date(apiStats.lastSync), 'yyyy-MM-dd')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
