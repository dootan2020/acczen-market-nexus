
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { taphoammoApiService } from "@/services/TaphoammoApiService";
import { useSecureTransaction } from "@/hooks/useSecureTransaction";
import { TaphoammoError, TaphoammoErrorCodes } from "@/types/taphoammo-errors";

interface PurchaseProduct {
  id: string;
  name: string;
  price: number;
  kioskToken: string | null;
  quantity: number;
}

export function usePurchaseProduct() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { processPurchase, checkBalance } = useSecureTransaction({
    showToasts: false // We'll handle toasts ourselves for better UX
  });

  const validatePurchase = async (product: PurchaseProduct) => {
    if (!user) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để mua sản phẩm",
        variant: "destructive",
      });
      return false;
    }

    if (!product.kioskToken) {
      toast({
        title: "Lỗi sản phẩm",
        description: "Sản phẩm không có mã kiosk để mua",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Check if kiosk is active before purchase
      const isActive = await taphoammoApiService.checkKioskActive(product.kioskToken);
      if (!isActive) {
        toast({
          title: "Sản phẩm tạm thời không khả dụng",
          description: "Sản phẩm này hiện không thể mua. Vui lòng thử lại sau hoặc chọn sản phẩm khác.",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      // Check if error is due to kiosk unavailability
      if (err instanceof TaphoammoError && err.code === TaphoammoErrorCodes.API_TEMP_DOWN) {
        toast({
          title: "Sản phẩm tạm thời không khả dụng",
          description: err.message,
          variant: "destructive",
        });
        return false;
      }
      console.error("Lỗi kiểm tra kiosk:", err);
      // Continue with process if we can't check kiosk due to other errors
    }

    try {
      // Check user balance using our balance validation
      const { sufficient, balance, required } = await checkBalance(product.price, product.quantity);
      
      if (!sufficient) {
        toast({
          title: "Số dư không đủ",
          description: `Bạn cần ${required.toFixed(0)}đ nhưng chỉ có ${balance.toFixed(0)}đ`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    } catch (err: any) {
      toast({
        title: "Lỗi kiểm tra số dư",
        description: err.message || "Không thể kiểm tra số dư của bạn",
        variant: "destructive",
      });
      return false;
    }
  };

  const executePurchase = async (product: PurchaseProduct) => {
    setIsProcessing(true);

    try {
      const isValid = await validatePurchase(product);
      if (!isValid) {
        setIsProcessing(false);
        return;
      }

      // Use our secure transaction processing
      const result = await processPurchase(product.id, product.quantity);
      
      if (!result) {
        // Error already handled in processPurchase
        return;
      }
      
      toast({
        title: "Đặt hàng thành công",
        description: `Mã đơn hàng: ${result.order_id}`,
      });
      
      return result.order_id;
    } catch (error: any) {
      console.error("Lỗi mua hàng:", error);
      
      // Specific error handling for API issues
      if (error instanceof TaphoammoError && error.code === TaphoammoErrorCodes.API_TEMP_DOWN) {
        toast({
          title: "Sản phẩm tạm thời không khả dụng",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }
      
      toast({
        title: "Lỗi đặt hàng",
        description: error instanceof Error ? error.message : "Lỗi không xác định khi mua sản phẩm",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    executePurchase,
    validatePurchase
  };
}
