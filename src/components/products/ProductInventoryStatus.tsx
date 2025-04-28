
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useStockOperations } from '@/hooks/taphoammo/useStockOperations';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProductInventoryStatusProps {
  kioskToken: string;
  stock: number;
  productId: string;
  productName: string;
}

const ProductInventoryStatus = ({ kioskToken, stock, productId, productName }: ProductInventoryStatusProps) => {
  const { syncProductStock, loading, cacheInfo } = useStockOperations();
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [notifyEmail, setNotifyEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState<boolean>(false);

  useEffect(() => {
    // Format the last checked time
    if (cacheInfo.lastChecked) {
      setLastUpdate(
        formatDistanceToNow(cacheInfo.lastChecked, {
          addSuffix: true,
          locale: vi
        })
      );
    }

    // Check if cache is expired
    if (cacheInfo.expiresAt) {
      setIsExpired(new Date() > cacheInfo.expiresAt);
    }

    // Setup timer to update the relative time
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
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [cacheInfo.lastChecked, cacheInfo.expiresAt]);

  // Check if user already subscribed for notifications
  useEffect(() => {
    if (stock === 0 && user?.id && productId) {
      checkSubscriptionStatus();
    }
  }, [stock, user?.id, productId]);

  const handleSyncStock = async () => {
    try {
      const result = await syncProductStock(kioskToken);
      
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

  const handleSubscribeToNotifications = async (close: () => void) => {
    if (!productId) return;
    
    try {
      setIsSubmitting(true);
      
      const email = user?.email || notifyEmail;
      
      if (!email) {
        toast.error('Vui lòng nhập email');
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('process-stock-notifications', {
        body: JSON.stringify({
          action: 'subscribe',
          email,
          productId,
          userId: user?.id
        })
      });

      if (error) {
        toast.error(`Lỗi: ${error.message}`);
        return;
      }

      if (data.success) {
        toast.success('Đã đăng ký nhận thông báo khi có hàng');
        setSubscribed(true);
        close();
      } else if (data.inStock) {
        toast.info('Sản phẩm hiện đã có hàng, không cần đăng ký thông báo');
        close();
      } else {
        toast.error(data.message || 'Đăng ký thông báo thất bại');
      }
    } catch (err: any) {
      toast.error(`Lỗi: ${err.message || 'Không thể đăng ký thông báo'}`);
    } finally {
      setIsSubmitting(false);
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

  // Hiển thị trạng thái tồn kho
  const renderStockStatus = () => {
    if (stock <= 0) {
      return (
        <Badge variant="destructive" className="mb-2">
          <AlertCircle className="w-3 h-3 mr-1" /> Hết hàng
        </Badge>
      );
    } else if (stock < 5) {
      return (
        <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 mb-2">
          <AlertCircle className="w-3 h-3 mr-1" /> Sắp hết hàng (còn {stock})
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-green-500 hover:bg-green-600 text-white mb-2">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Còn hàng ({stock > 99 ? '99+' : stock})
        </Badge>
      );
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-1">
        {renderStockStatus()}
        
        {stock <= 0 && !subscribed && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Báo khi có hàng
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thông báo khi có hàng</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Chúng tôi sẽ thông báo cho bạn khi sản phẩm "{productName}" có hàng trở lại.
                </p>
                
                {!user?.email && (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email của bạn</Label>
                    <Input 
                      id="email" 
                      placeholder="Nhập email của bạn" 
                      value={notifyEmail} 
                      onChange={(e) => setNotifyEmail(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Hủy</Button>
                </DialogClose>
                <DialogClose>
                  {(props) => (
                    <Button 
                      onClick={() => handleSubscribeToNotifications(props.onClick)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Đăng ký thông báo
                    </Button>
                  )}
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {stock <= 0 && subscribed && (
          <Button variant="outline" size="sm" onClick={handleUnsubscribe}>
            Hủy thông báo
          </Button>
        )}
      </div>
      
      <div className="flex items-center text-xs text-muted-foreground gap-2">
        <Clock className="w-3 h-3" />
        <span>
          {lastUpdate ? (
            <>Cập nhật: {lastUpdate}</>
          ) : (
            'Chưa có dữ liệu cập nhật'
          )}
        </span>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleSyncStock}
          disabled={loading}
          title="Cập nhật tồn kho"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-3 w-3 ${isExpired ? 'text-yellow-500' : ''}`}
            >
              <path d="M22 12c0 6-4.39 10-9.806 10C7.792 22 4.24 19.665 3 16" />
              <path d="M2 12C2 6 6.39 2 11.806 2 16.209 2 19.76 4.335 21 8" />
              <path d="M7 17l-4-1-1 4" />
              <path d="M17 7l4 1 1-4" />
            </svg>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProductInventoryStatus;

