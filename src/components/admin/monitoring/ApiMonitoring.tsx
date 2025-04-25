
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format, subDays } from 'date-fns';
import { Loader, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface ApiLogEntry {
  id: string;
  api: string;
  endpoint: string;
  status: string;
  response_time: number;
  details: any;
  created_at: string;
}

interface ApiStats {
  total: number;
  success: number;
  failed: number;
  avgResponseTime: number;
  lastSync?: string;
}

export function ApiMonitoring() {
  const [timeRange, setTimeRange] = React.useState<number>(7); // Default to 7 days
  
  const { data: apiLogs, isLoading, refetch } = useQuery({
    queryKey: ['api-logs', timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_logs')
        .select('*')
        .eq('api', 'taphoammo')
        .gte('created_at', format(subDays(new Date(), timeRange), 'yyyy-MM-dd'))
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as ApiLogEntry[];
    }
  });
  
  // Calculate API stats
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
    
    // Calculate average response time from logs that have it
    const logsWithResponseTime = apiLogs.filter(log => log.response_time);
    if (logsWithResponseTime.length > 0) {
      stats.avgResponseTime = logsWithResponseTime.reduce(
        (total, log) => total + (log.response_time || 0), 0
      ) / logsWithResponseTime.length;
    }
    
    // Find last successful sync
    const lastSyncLog = apiLogs.find(log => 
      log.endpoint === 'sync-all' && log.status === 'success'
    );
    if (lastSyncLog) {
      stats.lastSync = lastSyncLog.created_at;
    }
    
    return stats;
  }, [apiLogs]);
  
  // Prepare chart data
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
  
  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Success</Badge>;
      case 'error':
      case 'api-error':
      case 'transaction-error':
        return <Badge variant="destructive">Error</Badge>;
      case 'critical-error':
        return <Badge variant="destructive" className="bg-red-700">Critical</Badge>;
      case 'started':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Started</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
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
      
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{apiStats.total}</p>
            <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
          </CardContent>
        </Card>
        
        <Card>
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
        
        <Card>
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
        
        <Card>
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
                  calls: {},
                  successRate: {
                    color: "#22c55e"
                  },
                  avgTime: {
                    color: "#3b82f6"
                  }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
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
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="successRate"
                      name="successRate"
                      stroke="#22c55e"
                      strokeWidth={2}
                      yAxisId="right"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgTime"
                      name="avgTime"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      yAxisId="right"
                      dot={false}
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
            getStatusBadge={getStatusBadge} 
          />
        </TabsContent>
        
        <TabsContent value="errors" className="mt-6">
          <LogsTable 
            logs={(apiLogs || []).filter(log => 
              ['error', 'api-error', 'critical-error', 'transaction-error'].includes(log.status)
            )} 
            isLoading={isLoading} 
            getStatusBadge={getStatusBadge} 
          />
        </TabsContent>
        
        <TabsContent value="sync" className="mt-6">
          <LogsTable 
            logs={(apiLogs || []).filter(log => 
              log.endpoint === 'sync' || log.endpoint === 'sync-all'
            )} 
            isLoading={isLoading} 
            getStatusBadge={getStatusBadge} 
          />
        </TabsContent>
        
        <TabsContent value="orders" className="mt-6">
          <LogsTable 
            logs={(apiLogs || []).filter(log => 
              log.endpoint === 'process-order'
            )} 
            isLoading={isLoading} 
            getStatusBadge={getStatusBadge} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface LogsTableProps {
  logs: ApiLogEntry[];
  isLoading: boolean;
  getStatusBadge: (status: string) => React.ReactNode;
}

function LogsTable({ logs, isLoading, getStatusBadge }: LogsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Endpoint</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Response Time</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                <Loader className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              </TableCell>
            </TableRow>
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No logs found
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                </TableCell>
                <TableCell>{log.endpoint}</TableCell>
                <TableCell>{getStatusBadge(log.status)}</TableCell>
                <TableCell>
                  {log.response_time ? `${Math.round(log.response_time)}ms` : "N/A"}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {log.details ? (
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  ) : (
                    "No details"
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
