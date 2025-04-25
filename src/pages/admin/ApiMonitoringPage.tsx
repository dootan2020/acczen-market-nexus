
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import { ApiLogEntry } from '@/types/api-logs';
import { 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  RefreshCw
} from 'lucide-react';

const ApiMonitoringPage = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const { data: apiLogs, isLoading, error, refetch } = useQuery({
    queryKey: ['api-logs', activeTab, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('api_logs')
        .select('*');
      
      // Filter by API if not "all"
      if (activeTab !== "all") {
        query = query.eq('api', activeTab);
      }
      
      // Filter by search query if provided
      if (searchQuery) {
        query = query.or(`endpoint.ilike.%${searchQuery}%,status.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as ApiLogEntry[];
    }
  });
  
  const getStatusColor = (status: string) => {
    if (status === 'success') return 'bg-green-500';
    if (status === 'error') return 'bg-red-500';
    return 'bg-yellow-500'; // pending or other status
  };
  
  const getStatusIcon = (status: string) => {
    if (status === 'success') return <CheckCircle className="h-4 w-4" />;
    if (status === 'error') return <XCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };
  
  // Calculate error rates for alerts
  const apiErrorRates = React.useMemo(() => {
    if (!apiLogs) return {};
    
    const rates: Record<string, { total: number, errors: number, rate: number }> = {};
    
    for (const log of apiLogs) {
      if (!rates[log.api]) {
        rates[log.api] = { total: 0, errors: 0, rate: 0 };
      }
      
      rates[log.api].total += 1;
      if (log.status === 'error') {
        rates[log.api].errors += 1;
      }
    }
    
    // Calculate error rates
    Object.keys(rates).forEach(api => {
      rates[api].rate = rates[api].total > 0 
        ? (rates[api].errors / rates[api].total) * 100 
        : 0;
    });
    
    return rates;
  }, [apiLogs]);
  
  // Get unique API providers
  const apiProviders = React.useMemo(() => {
    if (!apiLogs) return [];
    
    const providers = new Set<string>();
    apiLogs.forEach(log => providers.add(log.api));
    return ['all', ...Array.from(providers)];
  }, [apiLogs]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">API Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor external API health and performance
          </p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              className="pl-8 w-full md:w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Alerts Section */}
      <div className="space-y-4 mb-6">
        {Object.entries(apiErrorRates).map(([api, stats]) => (
          stats.rate > 10 && (
            <Alert key={api} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>High error rate detected in {api} API</AlertTitle>
              <AlertDescription>
                Error rate: {stats.rate.toFixed(1)}% ({stats.errors} of {stats.total} requests failed)
              </AlertDescription>
            </Alert>
          )
        ))}
        
        {apiLogs?.some(log => 
          log.api === 'taphoammo' && 
          log.status === 'error' && 
          new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ) && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Taphoammo API Issues Detected</AlertTitle>
            <AlertDescription>
              There have been errors with the Taphoammo API in the last 24 hours.
              This may affect product availability and orders.
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      {/* API Logs Section */}
      <Card>
        <CardHeader>
          <CardTitle>API Activity Log</CardTitle>
          <CardDescription>
            Track and analyze external API calls and performance
          </CardDescription>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-auto">
              {apiProviders.map(provider => (
                <TabsTrigger key={provider} value={provider}>
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>Error loading API logs</AlertTitle>
              <AlertDescription>
                {(error as Error).message}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>API</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiLogs?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No API logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    apiLogs?.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {log.api}
                        </TableCell>
                        <TableCell>{log.endpoint}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`rounded-full w-2 h-2 ${getStatusColor(log.status)}`}></div>
                            <span className="capitalize">{log.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.response_time ? `${log.response_time.toFixed(2)}ms` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiMonitoringPage;
