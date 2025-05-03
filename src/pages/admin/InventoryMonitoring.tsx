import React, { useState, useEffect } from 'react';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, RefreshCw, Settings } from 'lucide-react';
import SyncInventoryButton from '@/components/admin/inventory/SyncInventoryButton';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, formatDistance } from 'date-fns';
import { toast } from 'sonner';

interface InventoryCacheItem {
  id: string;
  product_id: string;
  kiosk_token: string;
  stock_quantity: number;
  price: number;
  last_checked_at: string;
  cached_until: string;
  last_sync_status: string;
  sync_message: string | null;
  retry_count: number;
  products: { name: string } | null;
}

interface SyncHistoryItem {
  id: string;
  product_id: string;
  kiosk_token: string;
  old_quantity: number;
  new_quantity: number;
  old_price: number | null;
  new_price: number | null;
  sync_type: string;
  status: string;
  message: string | null;
  created_at: string;
}

const InventoryMonitoring = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('cache');
  
  // Fetch inventory cache data
  const { data: cacheData, isLoading: isLoadingCache, error: cacheError } = useQuery({
    queryKey: ['inventory-cache'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_cache')
        .select('*, products(name)')
        .order('last_checked_at', { ascending: false });
        
      if (error) throw error;
      return data as InventoryCacheItem[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Fetch sync history
  const { data: historyData, isLoading: isLoadingHistory, error: historyError } = useQuery({
    queryKey: ['sync-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_sync_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (error) throw error;
      return data as SyncHistoryItem[];
    },
    enabled: activeTab === 'history',
  });
  
  // Trigger a manual sync for all products
  const syncAllMutation = useMutation({
    mutationFn: async () => {
      return await supabase.functions.invoke('sync-inventory', {
        body: JSON.stringify({
          type: 'priority',
          limit: 10,
          syncType: 'manual'
        })
      });
    },
    onSuccess: (data) => {
      toast.success(`Đồng bộ thành công ${data.data.updated || 0} sản phẩm`);
      queryClient.invalidateQueries({ queryKey: ['inventory-cache'] });
      queryClient.invalidateQueries({ queryKey: ['sync-history'] });
    },
    onError: (error) => {
      toast.error(`Lỗi đồng bộ: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  // Format time difference
  const formatTimeDiff = (dateStr: string) => {
    try {
      return formatDistance(new Date(dateStr), new Date(), { addSuffix: true });
    } catch (e) {
      return 'Unknown';
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: string, message: string | null) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Thành công</Badge>;
      case 'error':
        return (
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Lỗi</Badge>
            {message && (
              <span className="text-xs text-red-500 truncate max-w-[150px]" title={message}>
                {message}
              </span>
            )}
          </div>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Container>
      <div className="flex justify-between items-center mb-6">
        <Heading title="Giám sát kho hàng" description="Theo dõi và quản lý đồng bộ hóa kho hàng" />
        <Button
          onClick={() => syncAllMutation.mutate()}
          disabled={syncAllMutation.isPending}
        >
          {syncAllMutation.isPending ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Đồng bộ tất cả
        </Button>
      </div>
      
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tổng sản phẩm</p>
              <h3 className="text-2xl font-semibold">{cacheData?.length || 0}</h3>
            </div>
            <div className="rounded-full bg-primary/10 p-2">
              <svg className="h-6 w-6 text-primary" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21L16 19L13 21L10 19L7 21L5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sản phẩm còn hàng</p>
              <h3 className="text-2xl font-semibold">
                {cacheData?.filter(item => item.stock_quantity > 0).length || 0}
              </h3>
            </div>
            <div className="rounded-full bg-green-100 p-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sản phẩm lỗi đồng bộ</p>
              <h3 className="text-2xl font-semibold">
                {cacheData?.filter(item => item.last_sync_status === 'error').length || 0}
              </h3>
            </div>
            <div className="rounded-full bg-red-100 p-2">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="cache">Dữ liệu cache</TabsTrigger>
          <TabsTrigger value="history">Lịch sử đồng bộ</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cache">
          {isLoadingCache ? (
            <div className="flex justify-center items-center py-10">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : cacheError ? (
            <div className="flex justify-center items-center py-10">
              <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
              <p className="text-red-500">Lỗi tải dữ liệu</p>
            </div>
          ) : (
            <Card>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên sản phẩm</TableHead>
                      <TableHead>Mã kiosk</TableHead>
                      <TableHead className="text-right">Số lượng</TableHead>
                      <TableHead className="text-right">Giá</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Cập nhật lúc</TableHead>
                      <TableHead>Hết hạn</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cacheData && cacheData.length > 0 ? (
                      cacheData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.products?.name || 'N/A'}</TableCell>
                          <TableCell className="font-mono text-xs">{item.kiosk_token}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={item.stock_quantity > 0 ? 'outline' : 'destructive'}>
                              {item.stock_quantity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(item.last_sync_status, item.sync_message)}
                            {item.retry_count > 0 && (
                              <Badge variant="outline" className="ml-1 bg-amber-50 text-amber-700 border-amber-200">
                                {item.retry_count} lần thử
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs">
                            <span title={format(new Date(item.last_checked_at), 'dd/MM/yyyy HH:mm:ss')}>
                              {formatTimeDiff(item.last_checked_at)}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs">
                            <span title={format(new Date(item.cached_until), 'dd/MM/yyyy HH:mm:ss')}>
                              {formatTimeDiff(item.cached_until)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <SyncInventoryButton 
                              kioskToken={item.kiosk_token}
                              productName={item.products?.name || 'Sản phẩm'}
                              onSuccess={() => {
                                queryClient.invalidateQueries({ queryKey: ['inventory-cache'] });
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                          Không có dữ liệu
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="history">
          {isLoadingHistory ? (
            <div className="flex justify-center items-center py-10">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : historyError ? (
            <div className="flex justify-center items-center py-10">
              <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
              <p className="text-red-500">Lỗi tải dữ liệu</p>
            </div>
          ) : (
            <Card>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã kiosk</TableHead>
                      <TableHead>Loại đồng bộ</TableHead>
                      <TableHead className="text-center">Số lượng trước</TableHead>
                      <TableHead className="text-center">Số lượng sau</TableHead>
                      <TableHead className="text-right">Giá trước</TableHead>
                      <TableHead className="text-right">Giá sau</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thời gian</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyData && historyData.length > 0 ? (
                      historyData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-xs">{item.kiosk_token}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {item.sync_type === 'manual' ? 'Thủ công' : 
                               item.sync_type === 'scheduled' ? 'Định kỳ' : 
                               item.sync_type === 'jit' ? 'Theo yêu cầu' : item.sync_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">{item.old_quantity}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center">
                              {item.new_quantity}
                              {item.new_quantity !== item.old_quantity && (
                                <Badge 
                                  variant="outline" 
                                  className={`ml-1 ${
                                    item.new_quantity > item.old_quantity 
                                      ? 'bg-green-50 text-green-700 border-green-200'
                                      : 'bg-red-50 text-red-700 border-red-200'
                                  }`}
                                >
                                  {item.new_quantity > item.old_quantity ? '+' : ''}
                                  {item.new_quantity - item.old_quantity}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {item.old_price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.old_price) : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.new_price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.new_price) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(item.status, item.message)}
                          </TableCell>
                          <TableCell className="text-xs">
                            <span title={format(new Date(item.created_at), 'dd/MM/yyyy HH:mm:ss')}>
                              {formatTimeDiff(item.created_at)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                          Không có dữ liệu
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="settings">
          <Card className="p-6">
            <h3 className="text-lg font-medium flex items-center mb-4">
              <Settings className="h-5 w-5 mr-2" />
              Cài đặt đồng bộ
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Cấu hình đồng bộ tự động</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Đồng bộ hóa kho hàng sẽ chạy tự động theo lịch trình đã cài đặt
                </p>
                
                <div className="grid gap-4">
                  {['Standard sync', 'High-priority products sync', 'Low-stock products sync'].map((syncType) => (
                    <ConfigItem 
                      key={syncType}
                      name={syncType}
                      description={
                        syncType === 'Standard sync' ? 'Cập nhật tất cả sản phẩm' :
                        syncType === 'High-priority products sync' ? 'Cập nhật sản phẩm ưu tiên cao' : 
                        'Cập nhật sản phẩm sắp hết hàng'
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
};

// Component for displaying sync configuration items
interface ConfigItemProps {
  name: string;
  description: string;
}

const ConfigItem: React.FC<ConfigItemProps> = ({ name, description }) => {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('sync_configuration')
          .select('*')
          .eq('name', name)
          .single();
          
        if (error) throw error;
        setConfig(data);
      } catch (err) {
        console.error('Error fetching config:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConfig();
  }, [name]);
  
  const toggleActive = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('sync_configuration')
        .update({ is_active: !config.is_active })
        .eq('id', config.id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (newData) => {
      setConfig(newData);
      toast.success(`${name} ${newData.is_active ? 'đã được kích hoạt' : 'đã bị tắt'}`);
      queryClient.invalidateQueries({ queryKey: ['sync-configuration'] });
    },
    onError: (error) => {
      toast.error(`Lỗi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  if (isLoading || !config) {
    return (
      <div className="rounded-lg border p-4 flex items-center justify-between">
        <div className="flex-1">
          <h5 className="font-medium">{name}</h5>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button variant="ghost" size="sm" disabled>
          <RefreshCw className="h-4 w-4 animate-spin" />
        </Button>
      </div>
    );
  }
  
  return (
    <div className="rounded-lg border p-4 flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h5 className="font-medium">{name}</h5>
          <Badge variant={config.is_active ? 'default' : 'outline'}>
            {config.is_active ? 'Đang hoạt động' : 'Đã tắt'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Khoảng thời gian: {config.schedule_interval / 60} phút | Độ ưu tiên: {config.priority}
        </p>
      </div>
      
      <Button 
        variant={config.is_active ? 'default' : 'outline'} 
        size="sm"
        onClick={() => toggleActive.mutate()}
        disabled={toggleActive.isPending}
      >
        {toggleActive.isPending ? (
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
        ) : null}
        {config.is_active ? 'Tắt' : 'Kích hoạt'}
      </Button>
    </div>
  );
};

export default InventoryMonitoring;
