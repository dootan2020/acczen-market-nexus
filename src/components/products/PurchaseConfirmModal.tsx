
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PurchaseConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  kioskToken: string | null;
}

export const PurchaseConfirmModal = ({
  open,
  onOpenChange,
  productId,
  productName,
  productPrice,
  productImage,
  quantity,
  kioskToken
}: PurchaseConfirmModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleConfirmPurchase = async () => {
    if (!user) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để mua sản phẩm",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!kioskToken) {
      toast({
        title: "Lỗi sản phẩm",
        description: "Sản phẩm không có mã kiosk để mua",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      console.log("Gọi Edge Function process-taphoammo-order để mua sản phẩm");
      console.log("Params:", { kioskToken, quantity, userToken: user.id });
      
      // First check stock to make sure product is available
      const { data: stockData, error: stockError } = await supabase.functions.invoke('process-taphoammo-order', {
        body: JSON.stringify({
          action: 'check_stock',
          kioskToken,
          quantity
        })
      });
      
      if (stockError) {
        console.error("Stock check error:", stockError);
        throw new Error("Lỗi khi kiểm tra tồn kho: " + stockError.message);
      }
      
      if (!stockData.success || !stockData.available) {
        throw new Error(stockData.message || "Sản phẩm này đã hết hàng");
      }
      
      // If stock is available, proceed with purchase
      const { data, error } = await supabase.functions.invoke('process-taphoammo-order', {
        body: JSON.stringify({
          action: 'buy_product',
          kioskToken,
          quantity,
          userToken: user.id
        })
      });
      
      if (error) {
        console.error("Purchase error:", error);
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new Error(data.message || "Lỗi khi xử lý đơn hàng");
      }
      
      // Show success notification briefly before redirect
      toast({
        title: "Đặt hàng thành công",
        description: "Đang chuyển đến trang chi tiết đơn hàng...",
      });
      
      // Redirect to the order details page
      setTimeout(() => {
        navigate(`/orders/${data.order_id}`);
      }, 500);
      
    } catch (error) {
      console.error("Purchase error:", error);
      
      toast({
        title: "Lỗi đặt hàng",
        description: error instanceof Error ? error.message : "Lỗi không xác định khi mua sản phẩm",
        variant: "destructive",
      });
      
    } finally {
      setIsProcessing(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xác nhận mua hàng</DialogTitle>
          <DialogDescription>
            Vui lòng xác nhận thông tin mua hàng dưới đây
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border">
              <img
                src={productImage}
                alt={productName}
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div>
              <h3 className="font-medium leading-tight">{productName}</h3>
              <p className="text-sm text-muted-foreground">
                Số lượng: {quantity}
              </p>
              <p className="font-medium text-primary">
                {new Intl.NumberFormat('vi-VN', { 
                  style: 'currency', 
                  currency: 'VND' 
                }).format(productPrice * quantity)}
              </p>
            </div>
          </div>
          
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="mb-2 text-muted-foreground">Thông tin quan trọng:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Đơn hàng sẽ được xử lý ngay sau khi xác nhận</li>
              <li>Số dư tài khoản của bạn sẽ bị trừ tương ứng</li>
              <li>Bạn sẽ nhận được thông tin sản phẩm trong trang chi tiết đơn hàng</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isProcessing}
          >
            Hủy bỏ
          </Button>
          
          <Button 
            type="button" 
            onClick={handleConfirmPurchase}
            disabled={isProcessing}
            className="bg-[#F97316] hover:bg-[#EA580C]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Xác nhận mua'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
