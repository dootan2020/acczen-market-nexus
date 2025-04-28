import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useStockOperations } from '@/hooks/taphoammo/useStockOperations';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getStoredProxy, setStoredProxy, ProxyType } from '@/utils/corsProxy';
import StockBadge from './inventory/StockBadge';
import StockNotification from './inventory/StockNotification';
import StockUpdateButton from './inventory/StockUpdateButton';
import ProxySelector from './inventory/ProxySelector';
import StockTimestamp from './inventory/StockTimestamp';

interface ProductInventoryStatusProps {
  kioskToken: string;
  stock: number;
  productId: string;
  productName: string;
}

const ProductInventoryStatus = ({
  kioskToken,
  stock,
  productId,
  productName,
}: ProductInventoryStatusProps) => {
  const { syncProductStock, loading, cacheInfo } = useStockOperations();
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [currentProxy, setCurrentProxy] = useState<ProxyType>(getStoredProxy());
  const [responseTime, setResponseTime] = useState<number | null>(null);

  useEffect(() => {
    if (cacheInfo.lastChecked) {
      setLastUpdate(
        formatDistanceToNow(cacheInfo.lastChecked, {
          addSuffix: true,
          locale: vi
        })
      );
    }

    if (cacheInfo.expiresAt) {
      setIsExpired(new Date() > cacheInfo.expiresAt);
    }

    const timer = setInterval(() => {
      if (cacheInfo.lastChecked) {
        setLastUpdate(
          formatDistanceToNow(cacheInfo.lastChecked, {
            addSuffix: true,
            locale: vi
          })
        );
      }
      
      if (cacheInfo.expiresAt) {
        setIsExpired(new Date() > cacheInfo.expiresAt);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [cacheInfo.lastChecked, cacheInfo.expiresAt]);

  useEffect(() => {
    if (stock === 0 && productId) {
      checkSubscriptionStatus();
    }
  }, [stock, productId]);

  useEffect(() => {
    const handler = () => setCurrentProxy(getStoredProxy());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const handleSyncStock = async () => {
    try {
      const startTime = Date.now();
      const result = await syncProductStock(kioskToken);
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || 'Đồng bộ thất bại');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Đã xảy ra lỗi khi đồng bộ tồn kho');
    }
  };
  
  const handleChangeProxy = (proxy: ProxyType) => {
    setStoredProxy(proxy);
    setCurrentProxy(proxy);
    toast.success(`Đã chuyển sang sử dụng proxy: ${proxy}`);
  };

  const checkSubscriptionStatus = async () => {
    if (!user?.id || !productId) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('process-stock-notifications', {
        body: JSON.stringify({
          action: 'check',
          productId,
          userId: user.id
        })
      });

      if (!error && data.success && data.subscribed) {
        setSubscribed(true);
      }
    } catch (err) {
      console.error('Error checking notification status:', err);
    }
  };

  const handleUnsubscribe = async () => {
    if (!productId || !user?.id) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('process-stock-notifications', {
        body: JSON.stringify({
          action: 'unsubscribe',
          productId,
          userId: user.id
        })
      });

      if (error) {
        toast.error(`Lỗi: ${error.message}`);
        return;
      }

      if (data.success) {
        toast.success('Đã hủy đăng ký thông báo');
        setSubscribed(false);
      } else {
        toast.error(data.message || 'Hủy đăng ký thông báo thất bại');
      }
    } catch (err: any) {
      toast.error(`Lỗi: ${err.message || 'Không thể hủy đăng ký thông báo'}`);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-1">
        <StockBadge stock={stock} />
        
        {stock <= 0 && (
          <StockNotification
            productId={productId}
            productName={productName}
            subscribed={subscribed}
            onSubscribe={() => setSubscribed(true)}
            onUnsubscribe={handleUnsubscribe}
          />
        )}
      </div>
      
      <div className="flex items-center text-xs text-muted-foreground gap-2">
        <StockTimestamp lastUpdate={lastUpdate} />
        <ProxySelector
          currentProxy={currentProxy}
          responseTime={responseTime}
          onProxyChange={handleChangeProxy}
        />
        <StockUpdateButton
          loading={loading}
          isExpired={isExpired}
          onUpdate={handleSyncStock}
        />
      </div>
    </div>
  );
};

export default ProductInventoryStatus;
