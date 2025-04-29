
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProxyType } from '@/utils/corsProxy';

interface ProductImportFormProps {
  onFetchProduct: (token: string, proxyType: ProxyType) => Promise<void>;
  onTestConnection: (token: string, proxyType: ProxyType) => Promise<{ success: boolean; message: string }>;
  isLoading: boolean;
  error: string | null;
}

const ProductImportForm: React.FC<ProductImportFormProps> = ({ 
  onFetchProduct, 
  onTestConnection, 
  isLoading, 
  error 
}) => {
  const [kioskToken, setKioskToken] = useState('');
  const [proxyType, setProxyType] = useState<ProxyType>('cloudflare');
  const [testStatus, setTestStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    if (!kioskToken.trim()) return;
    
    setTestStatus(null);
    const result = await onTestConnection(kioskToken, proxyType);
    setTestStatus(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kioskToken.trim()) return;
    
    await onFetchProduct(kioskToken, proxyType);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {testStatus && (
        <Alert variant={testStatus.success ? "default" : "destructive"}>
          <AlertDescription>{testStatus.message}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="kioskToken">Token sản phẩm</Label>
        <Input
          id="kioskToken"
          placeholder="Nhập token cho sản phẩm cần import"
          value={kioskToken}
          onChange={(e) => setKioskToken(e.target.value)}
          disabled={isLoading}
          required
        />
        <p className="text-xs text-muted-foreground">
          Token sản phẩm được cung cấp bởi TaphoaMMO hoặc các nhà cung cấp khác.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="proxyType">Loại Proxy</Label>
        <Select 
          value={proxyType} 
          onValueChange={(value) => setProxyType(value as ProxyType)}
          disabled={isLoading}
        >
          <SelectTrigger id="proxyType">
            <SelectValue placeholder="Chọn loại proxy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cloudflare">Cloudflare Workers</SelectItem>
            <SelectItem value="cors-anywhere">CORS Anywhere</SelectItem>
            <SelectItem value="direct">Kết nối trực tiếp</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Chọn proxy để giải quyết vấn đề CORS khi tải sản phẩm từ API.
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleTestConnection}
          disabled={isLoading || !kioskToken.trim()}
        >
          Kiểm tra kết nối
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || !kioskToken.trim()}
        >
          {isLoading ? 'Đang xác minh...' : 'Xác minh & tải sản phẩm'}
        </Button>
      </div>
    </form>
  );
};

export default ProductImportForm;
