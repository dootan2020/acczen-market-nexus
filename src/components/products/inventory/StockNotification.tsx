
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface StockNotificationProps {
  productId: string;
  productName: string;
  subscribed: boolean;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
}

const StockNotification = ({
  productId,
  productName,
  subscribed,
  onSubscribe,
  onUnsubscribe,
}: StockNotificationProps) => {
  const [notifyEmail, setNotifyEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { user } = useAuth();

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
        onSubscribe();
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

  if (subscribed) {
    return (
      <Button variant="outline" size="sm" onClick={onUnsubscribe}>
        Hủy thông báo
      </Button>
    );
  }

  return (
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
          <Button 
            onClick={(e) => {
              const closeDialog = () => {
                const closeButton = e.currentTarget.closest('[data-state="open"]')?.querySelector('button[data-state="closed"]');
                if (closeButton instanceof HTMLButtonElement) {
                  closeButton.click();
                }
              };
              handleSubscribeToNotifications(closeDialog);
            }}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Đăng ký thông báo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StockNotification;
