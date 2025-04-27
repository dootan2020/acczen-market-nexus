
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ProxyType, buildProxyUrl, getProxyOptions, getStoredProxy, setStoredProxy } from '@/utils/corsProxy';
import { AlertTriangle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTaphoammoAPI } from '@/hooks/useTaphoammoAPI';

const APIMonitoringPage: React.FC = () => {
  const [proxyType, setProxyType] = useState<ProxyType>(getStoredProxy());
  const [testStatus, setTestStatus] = useState<{
    isLoading: boolean;
    success?: boolean;
    message?: string;
  }>({
    isLoading: false
  });
  const { isAdmin } = useAuth();
  const { testConnection } = useTaphoammoAPI();
  
  const handleProxyChange = (value: string) => {
    if (value === 'direct' || value === 'corsproxy.io' || value === 'allorigins' || value === 'corsanywhere' || value === 'admin') {
      setProxyType(value as ProxyType);
      setStoredProxy(value as ProxyType);
    }
  };

  const handleTestConnection = async () => {
    setTestStatus({ isLoading: true });
    
    try {
      // Use a test Kiosk token to check connection - replace with a known valid token
      const testToken = "PQDYRSNMC9";
      const systemToken = "0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9";
      
      const result = await testConnection(testToken, systemToken, proxyType);
      setTestStatus({ 
        isLoading: false, 
        success: result.success,
        message: result.message
      });
    } catch (error) {
      setTestStatus({ 
        isLoading: false, 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
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
                <Button 
                  variant="outline" 
                  onClick={handleTestConnection}
                  disabled={testStatus.isLoading}
                >
                  {testStatus.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang kiểm tra...
                    </>
                  ) : (
                    'Kiểm tra kết nối'
                  )}
                </Button>
              </div>
              
              {/* Test connection result */}
              {testStatus.message && (
                <div className={`mt-2 p-3 rounded-md ${testStatus.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center">
                    {testStatus.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <p className={`text-sm ${testStatus.success ? 'text-green-700' : 'text-red-700'}`}>
                      {testStatus.message}
                    </p>
                  </div>
                </div>
              )}
              
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
