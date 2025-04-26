
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

const APIMonitoringPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<any[]>([]);
  
  useEffect(() => {
    fetchApiStatus();
  }, []);
  
  const fetchApiStatus = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setApiStatus([
        { id: '1', name: 'Product API', status: 'healthy', latency: '120ms', lastChecked: new Date().toISOString(), uptime: '99.9%' },
        { id: '2', name: 'Payment API', status: 'healthy', latency: '200ms', lastChecked: new Date().toISOString(), uptime: '99.8%' },
        { id: '3', name: 'User API', status: 'healthy', latency: '150ms', lastChecked: new Date().toISOString(), uptime: '99.95%' },
        { id: '4', name: 'Order API', status: 'degraded', latency: '500ms', lastChecked: new Date().toISOString(), uptime: '98.7%' },
      ]);
    } catch (error) {
      console.error('Failed to fetch API status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">API Monitoring</h1>
        <Button 
          variant="outline" 
          onClick={fetchApiStatus}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="status">
        <TabsList className="mb-4">
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Current API Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>API Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Latency</TableHead>
                    <TableHead>Last Checked</TableHead>
                    <TableHead>Uptime</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiStatus.map((api) => (
                    <TableRow key={api.id}>
                      <TableCell className="font-medium">{api.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {api.status === 'healthy' ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                          )}
                          <span className={api.status === 'healthy' ? 'text-green-500' : 'text-amber-500'}>
                            {api.status.charAt(0).toUpperCase() + api.status.slice(1)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{api.latency}</TableCell>
                      <TableCell>{new Date(api.lastChecked).toLocaleString()}</TableCell>
                      <TableCell>{api.uptime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>API Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Historical data will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>API Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No recent alerts.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIMonitoringPage;
