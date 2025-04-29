
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Clock, X, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProxyType, getProxyOptions, getStoredProxy, setStoredProxy } from '@/utils/corsProxy';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { debounce } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RecentToken {
  token: string;
  timestamp: number;
  name: string;
}

interface ProductImportFormProps {
  onFetchProduct: (token: string, proxyType: ProxyType, useMockData: boolean) => Promise<void>;
  onTestConnection: (token: string, proxyType: ProxyType) => Promise<{ success: boolean; message: string }>;
  isLoading: boolean;
  error: string | null;
  recentTokens?: RecentToken[];
  onClearRecent?: () => void;
}

const ProductImportForm: React.FC<ProductImportFormProps> = ({ 
  onFetchProduct, 
  onTestConnection, 
  isLoading, 
  error,
  recentTokens = [],
  onClearRecent
}) => {
  const [kioskToken, setKioskToken] = useState('');
  const [proxyType, setProxyType] = useState<ProxyType>(getStoredProxy());
  const [testStatus, setTestStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  // Create a debounced version of the test connection function
  const debouncedTestConnection = debounce(async (token: string, proxy: ProxyType) => {
    if (!token.trim()) return;
    
    setTestStatus(null);
    const result = await onTestConnection(token, proxy);
    setTestStatus(result);
  }, 500);
  
  // When token or proxy changes, reset test status
  useEffect(() => {
    setTestStatus(null);
  }, [kioskToken, proxyType]);

  const handleTestConnection = async () => {
    if (!kioskToken.trim()) return;
    
    setTestStatus(null);
    const result = await onTestConnection(kioskToken, proxyType);
    setTestStatus(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kioskToken.trim()) return;
    
    await onFetchProduct(kioskToken, proxyType, useMockData);
  };
  
  const handleTokenSelect = (token: string) => {
    setKioskToken(token);
    debouncedTestConnection(token, proxyType);
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
        <Alert variant={testStatus.success ? "default" : "destructive"} className="animate-in fade-in-0">
          <AlertDescription className="flex items-center justify-between">
            <span>{testStatus.message}</span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleTestConnection} 
              className="h-7 px-2"
              disabled={isLoading}
            >
              <RefreshCw size={14} className="mr-1" />
              Kiểm tra lại
            </Button>
          </AlertDescription>
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
          className="font-mono"
          autoComplete="off"
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          Token sản phẩm được cung cấp bởi TaphoaMMO hoặc các nhà cung cấp khác.
        </p>
      </div>
      
      {recentTokens.length > 0 && (
        <div className="space-y-2 bg-muted/50 p-3 rounded-md">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center">
              <Clock size={14} className="mr-1" />
              Token đã sử dụng gần đây
            </h4>
            {onClearRecent && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={onClearRecent}
                className="h-7 px-2 text-xs"
              >
                Xóa tất cả
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {recentTokens.map((item) => (
              <Badge 
                key={item.token} 
                variant={kioskToken === item.token ? "default" : "outline"}
                className="cursor-pointer flex items-center gap-1 py-1 pl-2 pr-1 hover:bg-primary/10"
                onClick={() => handleTokenSelect(item.token)}
              >
                <span className="mr-1 font-medium">{item.name.slice(0, 15)}{item.name.length > 15 ? '...' : ''}</span>
                <span className="text-xs opacity-70 hidden md:inline">
                  ({format(new Date(item.timestamp), 'HH:mm, dd/MM', { locale: vi })})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    const updatedTokens = recentTokens.filter(t => t.token !== item.token);
                    if (onClearRecent) {
                      onClearRecent();
                      // Re-add all tokens except the deleted one
                      localStorage.setItem('recent_import_tokens', JSON.stringify(updatedTokens));
                      // Force reload of page to update tokens
                      window.location.reload();
                    }
                  }}
                >
                  <X size={10} />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="proxyType">Loại Proxy</Label>
        <Select 
          value={proxyType} 
          onValueChange={(value) => {
            setProxyType(value as ProxyType);
            setStoredProxy(value as ProxyType);
          }}
          disabled={isLoading}
        >
          <SelectTrigger id="proxyType">
            <SelectValue placeholder="Chọn loại proxy" />
          </SelectTrigger>
          <SelectContent>
            {getProxyOptions().map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label} {option.value === 'allorigins' ? '(Khuyến nghị)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Chọn proxy để giải quyết vấn đề CORS khi tải sản phẩm từ API. AllOrigins được khuyến nghị để có kết quả tốt nhất.
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="debug-mode" 
                  checked={useMockData} 
                  onCheckedChange={setUseMockData} 
                />
                <Label htmlFor="debug-mode" className="cursor-pointer">Chế độ debug (dữ liệu mẫu)</Label>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="w-[200px] text-xs">
                Khi bật, hệ thống sẽ sử dụng dữ liệu mẫu thay vì gọi API thực. Hữu ích để test UI mà không tiêu tốn API call.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleTestConnection}
          disabled={isLoading || !kioskToken.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang kiểm tra...
            </>
          ) : (
            'Kiểm tra kết nối'
          )}
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || !kioskToken.trim()}
          className="relative"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xác minh...
            </>
          ) : (
            <>
              Xác minh & tải sản phẩm
              {useMockData && (
                <Badge variant="outline" className="absolute -top-3 -right-3 text-xs bg-yellow-500 text-white">
                  DEBUG
                </Badge>
              )}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProductImportForm;
