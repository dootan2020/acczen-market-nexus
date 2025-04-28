
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseModalHeader } from "./PurchaseModalHeader";
import { PurchaseModalProduct } from "./PurchaseModalProduct";
import { PurchaseModalInfo } from "./PurchaseModalInfo";
import { PurchaseModalActions } from "./PurchaseModalActions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowRight, Clipboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { OrderData } from "@/types/orders";

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

// Define a simpler interface for purchase result to prevent circular references
interface PurchaseResult {
  orderId?: string;
  productKeys?: string[];
}

// Define a simple interface for order item data to prevent deep recursion
interface OrderItemData {
  kiosk_token?: string;
  taphoammo_order_id?: string;
  product_keys?: string[];
  [key: string]: any;
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
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResult>({});
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [isCheckingKiosk, setIsCheckingKiosk] = useState<boolean>(false);
  const [kioskActive, setKioskActive] = useState<boolean | null>(null);
  const [isCheckingOrder, setIsCheckingOrder] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkKioskStatus = async () => {
      if (open && kioskToken) {
        try {
          setIsCheckingKiosk(true);
          
          const { data, error } = await supabase.functions.invoke('taphoammo-api', {
            body: JSON.stringify({
              endpoint: 'getStock',
              kioskToken,
              userToken: '0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9'
            })
          });
          
          if (error) throw new Error(error.message);
          
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
      }
    };
    
    checkKioskStatus();
  }, [open, kioskToken]);

  const handleConfirmPurchase = async () => {
    if (!kioskToken) {
      toast.error("Sản phẩm không có mã kiosk để mua");
      return;
    }
    
    if (!user) {
      toast.error("Bạn cần đăng nhập để mua sản phẩm");
      navigate("/login");
      return;
    }

    try {
      setIsProcessing(true);
      setPurchaseError(null);
      
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();
      
      if (userError) {
        throw new Error("Không thể kiểm tra số dư: " + userError.message);
      }
      
      const totalCost = productPrice * quantity;
      
      if (userData.balance < totalCost) {
        throw new Error(`Số dư không đủ. Bạn cần ${totalCost.toLocaleString()} VND nhưng chỉ có ${userData.balance.toLocaleString()} VND`);
      }

      // Use explicit type casting to handle API response
      const { data: orderData, error } = await supabase.functions.invoke('taphoammo-api', {
        body: JSON.stringify({
          endpoint: 'buyProducts',
          kioskToken,
          userToken: '0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9',
          quantity
        })
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Type safety check for API response
      const apiResponse = orderData as { success?: string; message?: string; description?: string; order_id?: string };
      
      if (!apiResponse || apiResponse.success === "false") {
        throw new Error(apiResponse?.message || apiResponse?.description || "Đã xảy ra lỗi khi mua sản phẩm");
      }

      // Safely extract order ID and set purchase result
      const orderId = apiResponse.order_id;
      if (!orderId) {
        throw new Error("Không nhận được mã đơn hàng từ API");
      }
      
      setPurchaseResult({ orderId });
      
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
        throw new Error("Lỗi khi lưu thông tin đơn hàng");
      }
      
      const orderItemData = {
        order_id: order.id,
        product_id: productId,
        quantity: quantity,
        price: productPrice,
        total: totalCost,
        data: {
          kiosk_token: kioskToken,
          taphoammo_order_id: orderId
        }
      };
      
      await supabase.from('order_items').insert(orderItemData);
      
      const newBalance = userData.balance - totalCost;
      await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', user.id);
      
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'purchase',
          amount: -totalCost,
          description: `Mua ${quantity} x ${productName}`,
          reference_id: order.id
        });
      
      await checkOrderStatus(orderId);
      
      toast.success("Đặt hàng thành công!");

    } catch (error) {
      console.error("Lỗi mua hàng:", error);
      const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi xử lý đơn hàng';
      toast.error(errorMessage);
      setPurchaseError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const checkOrderStatus = async (orderId: string) => {
    if (!orderId) return;
    
    try {
      setIsCheckingOrder(true);
      
      const { data, error } = await supabase.functions.invoke('taphoammo-api', {
        body: JSON.stringify({
          endpoint: 'getProducts',
          orderId,
          userToken: '0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9'
        })
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Safely check the API response structure
      if (data && 
          typeof data === 'object' && 
          'success' in data && 
          data.success === "true" && 
          'data' in data && 
          Array.isArray(data.data) && 
          data.data.length > 0) {
        
        // Extract product keys from response
        const productKeys = data.data.map((item: any) => item.product);
        
        // Update state with product keys
        setPurchaseResult(prev => ({ 
          ...prev, 
          productKeys 
        }));
        
        // Update order item in database if user is logged in
        if (user) {
          // Use typed query to avoid deep instantiation
          const { data: orderItemsData } = await supabase
            .from('order_items')
            .select('id, data')
            .eq('data->>taphoammo_order_id', orderId)
            .maybeSingle();
          
          if (orderItemsData) {
            // Safely extract data without causing deep instantiation
            const itemData: OrderItemData = {};
            
            // Copy existing properties if data is an object
            if (orderItemsData.data && typeof orderItemsData.data === 'object') {
              Object.keys(orderItemsData.data).forEach(key => {
                // Use type assertion to avoid TypeScript errors
                const dataObj = orderItemsData.data as Record<string, any>;
                itemData[key] = dataObj[key];
              });
            }
            
            // Add product keys
            itemData.product_keys = productKeys;
            
            // Update the database
            await supabase
              .from('order_items')
              .update({ data: itemData })
              .eq('id', orderItemsData.id);
          }
        }
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái đơn hàng:", error);
    } finally {
      setIsCheckingOrder(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Đã sao chép vào clipboard!");
    } catch (err) {
      toast.error("Không thể sao chép. Vui lòng thử lại.");
    }
  };

  const handleReset = () => {
    setPurchaseResult({});
    setPurchaseError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <PurchaseModalHeader />
        
        <div className="grid gap-4 py-4">
          {!purchaseResult.orderId ? (
            <>
              <PurchaseModalProduct
                productName={productName}
                productImage={productImage}
                quantity={quantity}
                totalPrice={productPrice * quantity}
              />
              <PurchaseModalInfo />
              
              <PurchaseModalActions
                isProcessing={isProcessing || isCheckingKiosk}
                onCancel={() => onOpenChange(false)}
                onConfirm={handleConfirmPurchase}
                disabled={kioskActive === false}
              />
              
              {purchaseError && (
                <div className="text-sm text-red-500 mt-2">
                  {purchaseError}
                </div>
              )}
            </>
          ) : (
            <Card className="p-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Kết Quả Mua Hàng</h3>
                <p className="text-sm text-muted-foreground">
                  Mã đơn hàng: {purchaseResult.orderId}
                </p>
              </div>

              {purchaseResult.productKeys?.length ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Thông tin sản phẩm</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(purchaseResult.productKeys?.join('\n\n') || '')}
                    >
                      <Clipboard className="w-4 h-4 mr-2" />
                      Sao chép tất cả
                    </Button>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-md font-mono text-sm whitespace-pre-wrap break-all">
                    {purchaseResult.productKeys.map((key, index) => (
                      <div key={index} className="mb-2 pb-2 border-b border-gray-200 last:border-0">{key}</div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-4">
                  {isCheckingOrder ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mb-2"></div>
                      <p className="text-sm text-muted-foreground">Đang kiểm tra đơn hàng...</p>
                    </div>
                  ) : (
                    <Button 
                      variant="outline"
                      onClick={() => checkOrderStatus(purchaseResult.orderId!)}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Kiểm tra đơn hàng
                    </Button>
                  )}
                </div>
              )}

              <div className="flex justify-between mt-4 pt-4 border-t">
                <Button 
                  variant="outline"
                  onClick={handleReset}
                >
                  Đặt lại
                </Button>
                <div className="space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Đóng
                  </Button>
                  <Button 
                    onClick={() => navigate('/dashboard/purchases')}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Xem đơn hàng
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
