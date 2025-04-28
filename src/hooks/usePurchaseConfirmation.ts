
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import type { OrderItemData } from "@/types/orders";

interface PurchaseResult {
  orderId?: string;
  productKeys?: string[];
}

export const usePurchaseConfirmation = () => {
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResult>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [isCheckingKiosk, setIsCheckingKiosk] = useState<boolean>(false);
  const [kioskActive, setKioskActive] = useState<boolean | null>(null);
  const [isCheckingOrder, setIsCheckingOrder] = useState<boolean>(false);
  const { user } = useAuth();

  const checkOrderStatus = async (orderId: string) => {
    if (!orderId || !user) return;
    
    try {
      setIsCheckingOrder(true);
      
      const { data, error } = await supabase.functions.invoke('taphoammo-api', {
        body: JSON.stringify({
          endpoint: 'getProducts',
          orderId,
          userToken: '0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9'
        })
      });
      
      if (error) throw error;
      
      if (data && 
          typeof data === 'object' && 
          'success' in data && 
          data.success === "true" && 
          'data' in data && 
          Array.isArray(data.data) && 
          data.data.length > 0) {
        
        const productKeys = data.data.map((item: any) => item.product);
        setPurchaseResult(prev => ({ ...prev, productKeys }));
        
        await updateOrderItemWithKeys(orderId, productKeys);
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái đơn hàng:", error);
    } finally {
      setIsCheckingOrder(false);
    }
  };

  const updateOrderItemWithKeys = async (orderId: string, productKeys: string[]) => {
    if (!user) return;
    
    const { data: orderItemsData } = await supabase
      .from('order_items')
      .select('id, data')
      .eq('data->>taphoammo_order_id', orderId)
      .maybeSingle();
    
    if (orderItemsData) {
      const itemData: OrderItemData = {};
      
      if (orderItemsData.data && typeof orderItemsData.data === 'object') {
        Object.keys(orderItemsData.data).forEach(key => {
          const dataObj = orderItemsData.data as Record<string, any>;
          itemData[key] = dataObj[key];
        });
      }
      
      itemData.product_keys = productKeys;
      
      await supabase
        .from('order_items')
        .update({ data: itemData })
        .eq('id', orderItemsData.id);
    }
  };

  const checkKioskStatus = async (kioskToken: string | null) => {
    if (!kioskToken) return;

    try {
      setIsCheckingKiosk(true);
      
      const { data, error } = await supabase.functions.invoke('taphoammo-api', {
        body: JSON.stringify({
          endpoint: 'getStock',
          kioskToken,
          userToken: '0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9'
        })
      });
      
      if (error) throw error;
      
      const isActive = data?.stock_quantity > 0;
      setKioskActive(isActive);
      
      if (!isActive) {
        setPurchaseError("Sản phẩm này tạm thời không khả dụng. Vui lòng thử lại sau hoặc chọn sản phẩm khác.");
      }
    } catch (error) {
      console.error("Lỗi kiểm tra kiosk:", error);
    } finally {
      setIsCheckingKiosk(false);
    }
  };

  const resetPurchase = () => {
    setPurchaseResult({});
    setPurchaseError(null);
  };

  return {
    purchaseResult,
    setPurchaseResult,
    isProcessing,
    setIsProcessing,
    purchaseError,
    setPurchaseError,
    isCheckingKiosk,
    kioskActive,
    isCheckingOrder,
    checkKioskStatus,
    checkOrderStatus,
    resetPurchase,
  };
};
