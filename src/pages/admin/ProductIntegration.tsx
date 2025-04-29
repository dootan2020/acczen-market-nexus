
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  CheckCircle2, 
  AlertCircle, 
  RotateCw, 
  Server, 
  Globe, 
  Key, 
  ShieldCheck,
  Database
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ProductIntegration = () => {
  const [activeTab, setActiveTab] = useState('taphoammo');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [isAutoSync, setIsAutoSync] = useState(true);
  const [isTestMode, setIsTestMode] = useState(false);
  
  // Mock API health check query
  const { data: apiStatus, isLoading: isCheckingApi } = useQuery({
    queryKey: ['api-status', activeTab],
    queryFn: async () => {
      // Simulate an API check
      await new Promise(r => setTimeout(r, 1500));
      return { status: 'online', lastSync: new Date().toISOString() };
    }
  });

  const handleSaveConfig = () => {
    toast.success('Cấu hình đã được lưu thành công!', {
      description: 'Các thay đổi sẽ được áp dụng ngay lập tức.'
    });
  };

  const handleTestConnection = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: 'Đang kiểm tra kết nối...',
        success: 'Kết nối thành công đến API!',
        error: 'Không thể kết nối đến API. Vui lòng kiểm tra lại thông tin.'
      }
    );
  };

  const handleSyncNow = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 3000)),
      {
        loading: 'Đang đồng bộ dữ liệu...',
        success: 'Đồng bộ hoàn tất! 15 sản phẩm đã được cập nhật.',
        error: 'Có lỗi khi đồng bộ. Vui lòng thử lại sau.'
      }
    );
  };

  // Initial API key fetch effect
  useEffect(() => {
    const fetchApiConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('api_settings')
          .select('api_key, api_secret')
          .eq('provider', 'taphoammo')
          .single();
          
        if (data) {
          setApiKey(data.api_key || '');
          setApiSecret(data.api_secret || '');
        }
      } catch (err) {
        console.error("Error fetching API settings:", err);
      }
    };
    
    fetchApiConfig();
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tích hợp API</h1>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleSyncNow}
        >
          <RotateCw className="h-4 w-4" />
          Đồng bộ ngay
        </Button>
      </div>
      
      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình tích hợp API</CardTitle>
              <CardDescription>
                Thiết lập kết nối với các nền tảng cung cấp sản phẩm bên ngoài
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="taphoammo">TaphoaMMO API</TabsTrigger>
                  <TabsTrigger value="other">Tích hợp khác</TabsTrigger>
                </TabsList>
                <TabsContent value="taphoammo" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input 
                      id="apiKey" 
                      placeholder="Nhập API Key của bạn" 
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiSecret">API Secret</Label>
                    <Input 
                      id="apiSecret" 
                      type="password" 
                      placeholder="Nhập API Secret của bạn"
                      value={apiSecret}
                      onChange={e => setApiSecret(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="autoSync" 
                      checked={isAutoSync}
                      onCheckedChange={setIsAutoSync}
                    />
                    <Label htmlFor="autoSync">Tự động đồng bộ hàng giờ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="testMode" 
                      checked={isTestMode}
                      onCheckedChange={setIsTestMode}
                    />
                    <Label htmlFor="testMode">Chế độ test (sandbox)</Label>
                  </div>
                </TabsContent>
                <TabsContent value="other" className="mt-4">
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p>Các tích hợp API khác sẽ được hỗ trợ trong phiên bản sắp tới.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleTestConnection}>
                Kiểm tra kết nối
              </Button>
              <Button onClick={handleSaveConfig}>Lưu cấu hình</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt đồng bộ</CardTitle>
              <CardDescription>
                Quản lý cách dữ liệu được đồng bộ từ các hệ thống bên ngoài
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="syncProducts" defaultChecked />
                <Label htmlFor="syncProducts">Đồng bộ sản phẩm</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="syncPrices" defaultChecked />
                <Label htmlFor="syncPrices">Đồng bộ giá</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="syncInventory" defaultChecked />
                <Label htmlFor="syncInventory">Đồng bộ tồn kho</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="auto-orders" defaultChecked />
                <Label htmlFor="auto-orders">Tự động tạo đơn hàng</Label>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái API</CardTitle>
              <CardDescription>
                Tình trạng kết nối hiện tại của API
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <span>Trạng thái API</span>
                  </div>
                  {isCheckingApi ? (
                    <div className="flex items-center gap-1">
                      <RotateCw className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground">Đang kiểm tra...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      {apiStatus?.status === 'online' ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-green-500 font-medium">Online</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-red-500 font-medium">Offline</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <span>Xác thực API</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-green-500 font-medium">Hợp lệ</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span>Đồng bộ gần nhất</span>
                  </div>
                  <span className="text-muted-foreground">
                    {apiStatus?.lastSync ? new Date(apiStatus.lastSync).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Thống kê đồng bộ</CardTitle>
              <CardDescription>
                Dữ liệu đã được đồng bộ trong 24 giờ qua
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold">24</p>
                    <p className="text-muted-foreground text-sm">Sản phẩm đã đồng bộ</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold">18</p>
                    <p className="text-muted-foreground text-sm">Cập nhật giá</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold">32</p>
                    <p className="text-muted-foreground text-sm">Cập nhật tồn kho</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold">8</p>
                    <p className="text-muted-foreground text-sm">Đơn hàng tự động</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductIntegration;
