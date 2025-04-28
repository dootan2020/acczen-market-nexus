
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Loader2, AlertCircle, CheckCircle, RefreshCcw, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useInterval } from '@/hooks/useInterval';

interface ApiHealthStatus {
  api_name: string;
  is_open: boolean;
  error_count: number;
  last_error: string | null;
  opened_at: string | null;
  updated_at: string;
}

interface SyncJob {
  id: string;
  job_type: string;
  status: string;
  priority: number;
  attempts: number;
  created_at: string;
}

interface SyncConfig {
  id: string;
  name: string;
  schedule_interval: number;
  is_active: boolean;
  updated_at: string;
}

interface SyncStats {
  total_syncs: number;
  success_count: number;
  error_count: number;
  average_response_time: number;
}

const InventoryDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [apiHealth, setApiHealth] = useState<ApiHealthStatus | null>(null);
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [syncConfigs, setSyncConfigs] = useState<SyncConfig[]>([]);
  const [syncStats, setSyncStats] = useState<SyncStats>({
    total_syncs: 0,
    success_count: 0,
    error_count: 0,
    average_response_time: 0
  });
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch initial data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto-refresh every 30 seconds
  useInterval(() => {
    if (document.visibilityState === 'visible') {
      fetchDashboardData(false);
    }
  }, 30000);

  const fetchDashboardData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    
    try {
      // Fetch API health status
      const { data: healthData } = await supabase
        .from('api_health')
        .select('*')
        .eq('api_name', 'taphoammo')
        .single();
        
      if (healthData) {
        setApiHealth(healthData);
      }
      
      // Fetch sync jobs
      const { data: jobsData } = await supabase
        .from('sync_job_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (jobsData) {
        setSyncJobs(jobsData);
      }
      
      // Fetch sync configs
      const { data: configsData } = await supabase
        .from('sync_configuration')
        .select('*');
        
      if (configsData) {
        setSyncConfigs(configsData);
      }
      
      // Fetch sync stats
      const { data: logs } = await supabase
        .from('api_logs')
        .select('*')
        .ilike('endpoint', 'scheduled-sync%')
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (logs && logs.length > 0) {
        const successCount = logs.filter(log => log.status === 'success').length;
        const errorCount = logs.filter(log => log.status !== 'success').length;
        const totalTime = logs.reduce((sum, log) => sum + (log.response_time || 0), 0);
        
        setSyncStats({
          total_syncs: logs.length,
          success_count: successCount,
          error_count: errorCount,
          average_response_time: logs.length > 0 ? totalTime / logs.length : 0
        });
        
        setLastSync(logs[0].created_at);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Không thể tải dữ liệu bảng điều khiển');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('sync-inventory', {
        body: JSON.stringify({ type: 'standard', limit: 10 })
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.success) {
        toast.success(`Đã đồng bộ ${data.updated} sản phẩm thành công`);
        fetchDashboardData(false);
      } else {
        toast.error(data.message || 'Đồng bộ thất bại');
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error(`Lỗi: ${error.message || 'Không thể đồng bộ'}`);
    } finally {
      setSyncing(false);
    }
  };

  const toggleSyncConfig = async (configId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('sync_configuration')
        .update({ is_active: !isActive })
        .eq('id', configId);
        
      if (error) {
        throw error;
      }
      
      setSyncConfigs(syncConfigs.map(config => 
        config.id === configId ? { ...config, is_active: !isActive } : config
      ));
      
      toast.success(`Đã ${!isActive ? 'bật' : 'tắt'} đồng bộ ${syncConfigs.find(c => c.id === configId)?.name}`);
    } catch (error: any) {
      console.error('Error toggling sync config:', error);
      toast.error(`Lỗi: ${error.message || 'Không thể cập nhật cấu hình'}`);
    }
  };

  const resetCircuitBreaker = async () => {
    if (!apiHealth) return;
    
    try {
      const { error } = await supabase
        .from('api_health')
        .update({
          is_open: false,
          error_count: 0,
          opened_at: null
        })
        .eq('api_name', 'taphoammo');
        
      if (error) {
        throw error;
      }
      
      setApiHealth({
        ...apiHealth,
        is_open: false,
        error_count: 0,
        opened_at: null
      });
      
      toast.success('Đã khởi tạo lại circuit breaker');
    } catch (error: any) {
      console.error('Error resetting circuit breaker:', error);
      toast.error(`Lỗi: ${error.message || 'Không thể khởi tạo lại circuit breaker'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý tồn kho</h2>
        <Button onClick={handleSyncNow} disabled={syncing}>
          {syncing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang đồng bộ...
            </>
          ) : (
            <>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Đồng bộ ngay
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="configs">Cấu hình đồng bộ</TabsTrigger>
          <TabsTrigger value="logs">Nhật ký</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* API Health Status */}
            <Card className={apiHealth?.is_open ? 'border-red-400' : 'border-green-400'}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Trạng thái API
                </CardTitle>
                <CardDescription>
                  TaphoaMMO API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {apiHealth?.is_open ? (
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    )}
                    <span className="text-xl font-bold">
                      {apiHealth?.is_open ? 'Lỗi kết nối' : 'Hoạt động bình thường'}
                    </span>
                  </div>
                  {apiHealth?.is_open && (
                    <Button size="sm" variant="outline" onClick={resetCircuitBreaker}>
                      Reset
                    </Button>
                  )}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Cập nhật: {format(new Date(apiHealth?.updated_at || new Date()), 'HH:mm:ss dd/MM/yyyy')}
                  </div>
                  {apiHealth?.error_count > 0 && (
                    <div className="mt-1">
                      Số lỗi: {apiHealth.error_count}
                      {apiHealth.last_error && (
                        <div className="mt-1 text-xs text-red-500 truncate max-w-[250px]">
                          Lỗi cuối: {apiHealth.last_error}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sync Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Thống kê đồng bộ
                </CardTitle>
                <CardDescription>
                  50 lần đồng bộ gần nhất
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {syncStats.success_count}/{syncStats.total_syncs} thành công
                </div>
                <div className="mt-2">
                  <Progress value={(syncStats.success_count / syncStats.total_syncs) * 100} className="h-2" />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <div>Thời gian phản hồi trung bình: {syncStats.average_response_time.toFixed(0)}ms</div>
                  {lastSync && (
                    <div className="flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      Đồng bộ cuối: {format(new Date(lastSync), 'HH:mm:ss dd/MM/yyyy')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recently Synced */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Công việc trong hàng đợi
                </CardTitle>
                <CardDescription>
                  {syncJobs.length} công việc gần nhất
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="space-y-2">
                  {syncJobs.length > 0 ? (
                    syncJobs.map(job => (
                      <div key={job.id} className="flex items-center justify-between px-2 py-1 text-sm border rounded">
                        <div className="flex items-center">
                          {job.status === 'pending' && <Clock className="h-3 w-3 text-yellow-500 mr-2" />}
                          {job.status === 'processing' && <Loader2 className="h-3 w-3 animate-spin text-blue-500 mr-2" />}
                          {job.status === 'completed' && <CheckCircle className="h-3 w-3 text-green-500 mr-2" />}
                          {job.status === 'failed' && <AlertCircle className="h-3 w-3 text-red-500 mr-2" />}
                          <span className="font-medium">{job.job_type}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(job.created_at), 'HH:mm:ss')}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-2 text-muted-foreground">
                      Không có công việc nào
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="configs">
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình đồng bộ tồn kho</CardTitle>
              <CardDescription>Quản lý các cấu hình đồng bộ tự động</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {syncConfigs.map(config => (
                  <div key={config.id} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-medium">{config.name}</h3>
                      <div className="text-sm text-muted-foreground">
                        Khoảng thời gian: {Math.floor(config.schedule_interval / 60)} phút {config.schedule_interval % 60} giây
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 text-xs rounded ${config.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {config.is_active ? 'Hoạt động' : 'Tắt'}
                      </div>
                      <Button 
                        size="sm" 
                        variant={config.is_active ? "destructive" : "default"}
                        onClick={() => toggleSyncConfig(config.id, config.is_active)}
                      >
                        {config.is_active ? 'Tắt' : 'Bật'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => fetchDashboardData()}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Làm mới
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Nhật ký đồng bộ</CardTitle>
              <CardDescription>
                Lịch sử đồng bộ tồn kho gần đây
              </CardDescription>
            </CardHeader>
            <CardContent>
              Chức năng đang được phát triển...
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryDashboard;
