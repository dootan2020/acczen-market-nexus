
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
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
import { taphoammoApi } from "@/utils/taphoammoApi";

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
  const { convertVNDtoUSD, formatUSD, formatVND } = useCurrencyContext();

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
      console.log("Bắt đầu xử lý mua hàng");
      
      // 1. Check user balance
      console.log("Kiểm tra số dư người dùng:", user.id);
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('balance, username')
        .eq('id', user.id)
        .single();
      
      if (userError) {
        throw new Error("Không thể kiểm tra số dư: " + userError.message);
      }
      
      const totalCost = productPrice * quantity;
      console.log("Chi phí:", totalCost, "Số dư:", userData.balance);
      
      if (userData.balance < totalCost) {
        // Convert amounts to USD for display in error message
        const totalCostUSD = convertVNDtoUSD(totalCost);
        const balanceUSD = convertVNDtoUSD(userData.balance);
        
        throw new Error(`Số dư không đủ. Bạn cần ${formatUSD(totalCostUSD)} nhưng chỉ có ${formatUSD(balanceUSD)}`);
      }
      
      // 2. Check stock availability using our API client
      console.log("Kiểm tra tồn kho cho:", kioskToken);
      try {
        const stockInfo = await taphoammoApi.getStock(kioskToken, user.id);
        console.log("Thông tin tồn kho:", stockInfo);
        
        if (stockInfo.stock_quantity < quantity) {
          throw new Error(`Không đủ hàng trong kho. Bạn yêu cầu ${quantity} nhưng chỉ còn ${stockInfo.stock_quantity}`);
        }
      } catch (stockError) {
        console.warn("Cảnh báo khi kiểm tra tồn kho:", stockError);
        // Continue with purchase even if stock check fails
        // The buy request will fail if there's no stock anyway
      }
      
      // 3. Make purchase request
      console.log("Thực hiện mua hàng");
      const orderData = await taphoammoApi.buyProducts(kioskToken, quantity, user.id);
      console.log("Kết quả mua hàng:", orderData);
      
      if (!orderData.order_id) {
        throw new Error("Không nhận được mã đơn hàng từ API");
      }
      
      // 4. Create order record in database
      console.log("Lưu thông tin đơn hàng vào database");
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'completed',
          total_amount: totalCost
        })
        .select('id')
        .single();
      
      if (orderError) {
        console.error("Lỗi tạo đơn hàng:", orderError);
        throw new Error("Lỗi khi lưu thông tin đơn hàng");
      }
      
      // 5. Add order items
      console.log("Lưu chi tiết đơn hàng:", order.id);
      const orderItemData = {
        order_id: order.id,
        product_id: productId,
        quantity: quantity,
        price: productPrice,
        total: totalCost,
        data: {
          kiosk_token: kioskToken,
          taphoammo_order_id: orderData.order_id,
          product_keys: orderData.product_keys || []
        }
      };
      
      const { error: itemError } = await supabase
        .from('order_items')
        .insert(orderItemData);
      
      if (itemError) {
        console.error("Lỗi lưu chi tiết đơn hàng:", itemError);
      }
      
      // 6. Update user balance
      console.log("Cập nhật số dư người dùng");
      const newBalance = userData.balance - totalCost;
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', user.id);
      
      if (balanceError) {
        console.error("Lỗi cập nhật số dư:", balanceError);
      }
      
      // 7. Log transaction
      console.log("Lưu lịch sử giao dịch");
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'purchase',
          amount: -totalCost, // Use negative amount for purchases
          description: `Mua ${quantity} x ${productName}`,
          reference_id: order.id
        });
      
      if (transactionError) {
        console.error("Lỗi lưu giao dịch:", transactionError);
      }
      
      // 8. Check for product keys if needed
      console.log("Kiểm tra trạng thái đơn hàng:", orderData.order_id);
      let productKeys = orderData.product_keys || [];
      
      if (orderData.status === "processing" || !productKeys.length) {
        console.log("Đơn hàng đang xử lý, kiểm tra product keys");
        
        const checkResult = await taphoammoApi.checkOrderUntilComplete(orderData.order_id, user.id);
        console.log("Kết quả kiểm tra đơn hàng:", checkResult);
        
        if (checkResult.success && checkResult.product_keys?.length) {
          productKeys = checkResult.product_keys;
          
          // Update product keys in database
          const { data: orderItem, error: fetchError } = await supabase
            .from('order_items')
            .select('id, data')
            .eq('order_id', order.id)
            .single();
          
          if (!fetchError && orderItem) {
            // Fix: Type check and access data properties safely
            const itemData = orderItem.data as Record<string, any> || {};
            
            const updatedData = {
              kiosk_token: typeof itemData === 'object' ? itemData.kiosk_token : kioskToken,
              taphoammo_order_id: typeof itemData === 'object' ? itemData.taphoammo_order_id : orderData.order_id,
              product_keys: productKeys
            };
            
            await supabase
              .from('order_items')
              .update({ data: updatedData })
              .eq('id', orderItem.id);
          }
        }
      }
      
      // 9. Show success message
      toast({
        title: "Đặt hàng thành công",
        description: `Mã đơn hàng: ${orderData.order_id}`,
      });
      
      // 10. Navigate to order details page
      setTimeout(() => {
        navigate(`/orders/${order.id}`);
      }, 1000);
      
    } catch (error) {
      console.error("Lỗi mua hàng:", error);
      
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

  // Calculate USD price for display
  const totalPriceVND = productPrice * quantity;
  const totalPriceUSD = convertVNDtoUSD(totalPriceVND);

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
                {formatUSD(totalPriceUSD)}
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
