
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ProxyType, buildProxyUrl, getProxyOptions, getStoredProxy, setStoredProxy } from '@/utils/corsProxy';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const APIMonitoringPage: React.FC = () => {
  const [proxyType, setProxyType] = React.useState<ProxyType>(getStoredProxy());
  const { isAdmin } = useAuth();
  
  const handleProxyChange = (value: string) => {
    if (value === 'direct' || value === 'corsproxy.io' || value === 'allorigins' || value === 'corsanywhere' || value === 'admin') {
      setProxyType(value);
      setStoredProxy(value);
    }
  };

  const proxyOptions = getProxyOptions();

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Bạn không có quyền truy cập vào trang này.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Cấu hình CORS Proxy</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Chọn loại proxy để sử dụng khi gọi API bên ngoài
              </p>
              
              <div className="flex items-center gap-2">
                <Select value={proxyType} onValueChange={handleProxyChange}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Chọn loại proxy" />
                  </SelectTrigger>
                  <SelectContent>
                    {proxyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline">Kiểm tra kết nối</Button>
              </div>
              
              <div className="mt-4">
                <p className="text-sm">
                  Proxy URL hiện tại: <code className="bg-muted p-1 rounded">{buildProxyUrl('https://example.com', proxyType)}</code>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIMonitoringPage;
