
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format, subDays } from 'date-fns';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface ApiLogEntry {
  id: string;
  api: string;
  endpoint: string;
  status: string;
  response_time: number;
  created_at: string;
  details: any;
}

interface ApiHealth {
  api_name: string;
  is_open: boolean;
  half_open: boolean;
  error_count: number;
  last_error: string | null;
  opened_at: string | null;
  updated_at: string;
  consecutive_success: number;
}

const ApiHealthMonitor: React.FC = () => {
  // Fetch API health status
  const { data: apiHealth, isLoading: isHealthLoading } = useQuery({
    queryKey: ['api-health'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_health')
        .select('*')
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      return data as ApiHealth[];
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refresh every minute
  });
  
  // Fetch recent API logs
  const { data: apiLogs, isLoading: isLogsLoading } = useQuery({
    queryKey: ['api-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (error) throw error;
      return data as ApiLogEntry[];
    },
    staleTime: 30000, // 30 seconds
  });
  
  // Prepare chart data
  const chartData = React.useMemo(() => {
    if (!apiLogs) return [];
    
    const lastWeek = subDays(new Date(), 7);
    
    // Filter logs from the last week
    const recentLogs = apiLogs.filter(log => 
      new Date(log.created_at) >= lastWeek
    );
    
    // Group by day and calculate stats
    const dailyStats = recentLogs.reduce((acc, log) => {
      const day = format(new Date(log.created_at), 'yyyy-MM-dd');
      
      if (!acc[day]) {
        acc[day] = {
          date: day,
          errorCount: 0,
          successCount: 0,
          avgResponseTime: 0,
          totalLogs: 0,
          totalResponseTime: 0
        };
      }
      
      acc[day].totalLogs++;
      
      if (log.status === 'error' || log.status === 'critical-error') {
        acc[day].errorCount++;
      }
      
      if (log.status === 'success') {
        acc[day].successCount++;
      }
      
      if (log.response_time) {
        acc[day].totalResponseTime += log.response_time;
      }
      
      return acc;
    }, {} as Record<string, any>);
    
    // Calculate averages and format for chart
    return Object.values(dailyStats).map(day => ({
      ...day,
      avgResponseTime: day.totalLogs > 0 
        ? Math.round(day.totalResponseTime / day.totalLogs) 
        : 0,
      errorRate: day.totalLogs > 0 
        ? Math.round((day.errorCount / day.totalLogs) * 100) 
        : 0
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [apiLogs]);
  
  // Calculate error rates by endpoint
  const endpointStats = React.useMemo(() => {
    if (!apiLogs) return [];
    
    const stats = apiLogs.reduce((acc, log) => {
      const key = `${log.api}-${log.endpoint}`;
      
      if (!acc[key]) {
        acc[key] = {
          api: log.api,
          endpoint: log.endpoint,
          totalCalls: 0,
          errors: 0,
          avgResponseTime: 0,
          totalResponseTime: 0,
          lastStatus: 'unknown',
          lastCalled: null
        };
      }
      
      acc[key].totalCalls++;
      
      if (log.status === 'error' || log.status === 'critical-error') {
        acc[key].errors++;
      }
      
      if (log.response_time) {
        acc[key].totalResponseTime += log.response_time;
      }
      
      // Track most recent status and timestamp
      if (!acc[key].lastCalled || new Date(log.created_at) > new Date(acc[key].lastCalled)) {
        acc[key].lastStatus = log.status;
        acc[key].lastCalled = log.created_at;
      }
      
      return acc;
    }, {} as Record<string, any>);
    
    // Calculate averages and sort by error rate
    return Object.values(stats)
      .map(endpoint => ({
        ...endpoint,
        avgResponseTime: endpoint.totalCalls > 0 
          ? Math.round(endpoint.totalResponseTime / endpoint.totalCalls) 
          : 0,
        errorRate: endpoint.totalCalls > 0 
          ? Math.round((endpoint.errors / endpoint.totalCalls) * 100) 
          : 0
      }))
      .sort((a, b) => b.errorRate - a.errorRate);
  }, [apiLogs]);
  
  // Get status badge
  const renderStatusBadge = (status: string) => {
    switch(status) {
      case 'success':
        return <Badge className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge className="bg-orange-500">Error</Badge>;
      case 'critical-error':
        return <Badge className="bg-red-500">Critical Error</Badge>;
      case 'cache-fallback':
        return <Badge className="bg-blue-500">Cache Fallback</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Get circuit state badge
  const renderCircuitBadge = (health: ApiHealth) => {
    if (health.is_open) {
      return (
        <Badge className="bg-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Open
        </Badge>
      );
    }
    
    if (health.half_open) {
      return (
        <Badge className="bg-yellow-500 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Half-Open
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-green-500 flex items-center gap-1">
        <CheckCircle className="w-3 h-3" /> Closed
      </Badge>
    );
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Health Status</CardTitle>
          <CardDescription>Current status of external API integrations</CardDescription>
        </CardHeader>
        <CardContent>
          {isHealthLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !apiHealth || apiHealth.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No API health data available
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>API</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Error Count</TableHead>
                  <TableHead>Last Error</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiHealth.map(health => (
                  <TableRow key={health.api_name}>
                    <TableCell className="font-medium">{health.api_name}</TableCell>
                    <TableCell>{renderCircuitBadge(health)}</TableCell>
                    <TableCell>{health.error_count}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {health.last_error || 'None'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(health.updated_at), 'yyyy-MM-dd HH:mm:ss')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>API Performance Metrics</CardTitle>
          <CardDescription>Response times and error rates over time</CardDescription>
        </CardHeader>
        <CardContent>
          {isLogsLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : !chartData || chartData.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No API performance data available
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgResponseTime"
                    name="Avg Response Time (ms)"
                    stroke="#3498DB"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="errorRate"
                    name="Error Rate (%)"
                    stroke="#E74C3C"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Endpoint Reliability</CardTitle>
          <CardDescription>Performance and reliability by endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          {isLogsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !endpointStats || endpointStats.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No endpoint statistics available
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>API / Endpoint</TableHead>
                  <TableHead>Total Calls</TableHead>
                  <TableHead>Error Rate</TableHead>
                  <TableHead>Avg Response (ms)</TableHead>
                  <TableHead>Last Status</TableHead>
                  <TableHead>Last Called</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {endpointStats.map((stat, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="font-medium">{stat.api}</div>
                      <div className="text-sm text-muted-foreground">{stat.endpoint}</div>
                    </TableCell>
                    <TableCell>{stat.totalCalls}</TableCell>
                    <TableCell>
                      <span className={
                        stat.errorRate > 20 ? "text-red-500" :
                        stat.errorRate > 5 ? "text-yellow-500" : "text-green-500"
                      }>
                        {stat.errorRate}%
                      </span>
                    </TableCell>
                    <TableCell>{stat.avgResponseTime}</TableCell>
                    <TableCell>{renderStatusBadge(stat.lastStatus)}</TableCell>
                    <TableCell>
                      {stat.lastCalled && format(new Date(stat.lastCalled), 'yyyy-MM-dd HH:mm:ss')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent API Calls</CardTitle>
          <CardDescription>Latest API activity and errors</CardDescription>
        </CardHeader>
        <CardContent>
          {isLogsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !apiLogs || apiLogs.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No API logs available
            </div>
          ) : (
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>API</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiLogs.slice(0, 50).map(log => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                      </TableCell>
                      <TableCell>{log.api}</TableCell>
                      <TableCell>{log.endpoint}</TableCell>
                      <TableCell>{renderStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        {log.response_time ? `${log.response_time.toFixed(2)} ms` : 'N/A'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.details ? JSON.stringify(log.details) : ''}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiHealthMonitor;
