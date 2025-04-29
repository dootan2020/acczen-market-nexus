
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Clock, X, RefreshCw, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { debounce } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { corsProxyOptions, DEFAULT_USER_TOKEN, testTaphoammoConnection } from '@/utils/taphoammoApi';

interface RecentToken {
  token: string;
  timestamp: number;
  name: string;
}

interface ProductImportFormProps {
  onFetchProduct: (token: string, corsProxyUrl: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  recentTokens?: RecentToken[];
  onClearRecent?: () => void;
}

const ProductImportForm: React.FC<ProductImportFormProps> = ({ 
  onFetchProduct, 
  isLoading, 
  error,
  recentTokens = [],
  onClearRecent
}) => {
  const [kioskToken, setKioskToken] = useState('');
  const [corsProxyUrl, setCorsProxyUrl] = useState(corsProxyOptions[0].value);
  const [testStatus, setTestStatus] = useState<{ success: boolean; message: string } | null>(null);
  
  // Create a debounced version of the test connection function
  const debouncedTestConnection = debounce(async (token: string, proxy: string) => {
    if (!token.trim()) return;
    
    setTestStatus(null);
    const result = await testTaphoammoConnection(token, proxy);
    setTestStatus(result);
  }, 500);
  
  // When token or proxy changes, reset test status
  useEffect(() => {
    setTestStatus(null);
  }, [kioskToken, corsProxyUrl]);

  const handleTestConnection = async () => {
    if (!kioskToken.trim()) return;
    
    setTestStatus(null);
    const result = await testTaphoammoConnection(kioskToken, corsProxyUrl);
    setTestStatus(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kioskToken.trim()) return;
    
    await onFetchProduct(kioskToken, corsProxyUrl);
  };
  
  const handleTokenSelect = (token: string) => {
    setKioskToken(token);
    debouncedTestConnection(token, corsProxyUrl);
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
                    if (onClearRecent) {
                      // Remove specific token
                      const updatedTokens = recentTokens.filter(t => t.token !== item.token);
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
        <Label htmlFor="corsProxyUrl">CORS Proxy</Label>
        <Select 
          value={corsProxyUrl} 
          onValueChange={setCorsProxyUrl}
          disabled={isLoading}
        >
          <SelectTrigger id="corsProxyUrl">
            <SelectValue placeholder="Chọn CORS proxy" />
          </SelectTrigger>
          <SelectContent>
            {corsProxyOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Chọn CORS proxy để giải quyết vấn đề CORS khi tải sản phẩm từ API. AllOrigins được khuyến nghị để có kết quả tốt nhất.
        </p>
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
            'Xác minh & tải sản phẩm'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProductImportForm;
