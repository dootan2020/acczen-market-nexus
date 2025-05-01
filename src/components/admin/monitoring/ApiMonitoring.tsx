
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ApiLog } from '@/types/api-logs';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { format, subDays } from 'date-fns';
import { RefreshCw } from 'lucide-react';
import { ApiStatsCards } from './components/ApiStatsCards';
import { ApiPerformanceChart } from './components/ApiPerformanceChart';
import { LogsTable } from './components/LogsTable';
import { ApiStats, ChartData } from './types';

export function ApiMonitoring() {
  const [timeRange, setTimeRange] = React.useState<number>(7);
  
  const { data: apiLogs, isLoading, refetch } = useQuery({
    queryKey: ['api-logs', timeRange],
    queryFn: async () => {
      const { data: logs, error } = await supabase
        .from('api_logs')
        .select('*')
        .eq('api', 'taphoammo')
        .gte('created_at', format(subDays(new Date(), timeRange), 'yyyy-MM-dd'))
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return logs as ApiLog[];
    }
  });
  
  const apiStats = React.useMemo(() => {
    if (!apiLogs || apiLogs.length === 0) {
      return {
        total: 0,
        success: 0,
        failed: 0,
        avgResponseTime: 0
      };
    }
    
    const stats: ApiStats = {
      total: apiLogs.length,
      success: apiLogs.filter(log => log.status === 'success').length,
      failed: apiLogs.filter(log => 
        ['error', 'api-error', 'critical-error', 'transaction-error'].includes(log.status)
      ).length,
      avgResponseTime: 0
    };
    
    const logsWithResponseTime = apiLogs.filter(log => log.response_time);
    if (logsWithResponseTime.length > 0) {
      stats.avgResponseTime = logsWithResponseTime.reduce(
        (total, log) => total + (log.response_time || 0), 0
      ) / logsWithResponseTime.length;
    }
    
    const lastSyncLog = apiLogs.find(log => 
      log.endpoint === 'sync-all' && log.status === 'success'
    );
    if (lastSyncLog) {
      stats.lastSync = lastSyncLog.created_at;
    }
    
    return stats;
  }, [apiLogs]);
  
  const chartData = React.useMemo(() => {
    if (!apiLogs) return [];
    
    const days = Array.from({ length: timeRange }, (_, i) => {
      const date = subDays(new Date(), i);
      return format(date, 'yyyy-MM-dd');
    }).reverse();
    
    return days.map(day => {
      const dayLogs = apiLogs.filter(log => 
        log.created_at.startsWith(day)
      );
      
      return {
        date: day,
        calls: dayLogs.length,
        successRate: dayLogs.length > 0 
          ? (dayLogs.filter(log => log.status === 'success').length / dayLogs.length) * 100 
          : 0,
        avgTime: dayLogs.filter(log => log.response_time).length > 0
          ? dayLogs.filter(log => log.response_time).reduce((sum, log) => sum + (log.response_time || 0), 0) / 
              dayLogs.filter(log => log.response_time).length
          : 0
      };
    });
  }, [apiLogs, timeRange]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">API Monitoring</h2>
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <ApiStatsCards apiStats={apiStats} timeRange={timeRange} />
      
      <ApiPerformanceChart 
        chartData={chartData} 
        timeRange={timeRange}
        setTimeRange={setTimeRange}
      />
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Logs</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="sync">Sync Calls</TabsTrigger>
          <TabsTrigger value="orders">Order Processing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <LogsTable 
            logs={apiLogs || []} 
            isLoading={isLoading} 
          />
        </TabsContent>
        
        <TabsContent value="errors" className="mt-6">
          <LogsTable 
            logs={(apiLogs || []).filter(log => 
              ['error', 'api-error', 'critical-error', 'transaction-error'].includes(log.status)
            )} 
            isLoading={isLoading} 
          />
        </TabsContent>
        
        <TabsContent value="sync" className="mt-6">
          <LogsTable 
            logs={(apiLogs || []).filter(log => 
              log.endpoint === 'sync' || log.endpoint === 'sync-all'
            )} 
            isLoading={isLoading} 
          />
        </TabsContent>
        
        <TabsContent value="orders" className="mt-6">
          <LogsTable 
            logs={(apiLogs || []).filter(log => 
              log.endpoint === 'process-order'
            )} 
            isLoading={isLoading} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
