import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { usePurchaseProduct } from "@/hooks/usePurchaseProduct";
import { PurchaseModalHeader } from "./PurchaseModalHeader";
import { PurchaseModalProduct } from "./PurchaseModalProduct";
import { PurchaseModalInfo } from "./PurchaseModalInfo";
import { PurchaseModalActions } from "./PurchaseModalActions";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { taphoammoApi } from "@/utils/api/taphoammoApi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowPathIcon, ArrowRightIcon, ClipboardIcon } from "lucide-react";

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
  const [purchaseResult, setPurchaseResult] = useState<{
    orderId?: string;
    productKeys?: string[];
  }>({});
  const navigate = useNavigate();
  const { isProcessing, executePurchase } = usePurchaseProduct();
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [isCheckingKiosk, setIsCheckingKiosk] = useState<boolean>(false);
  const [kioskActive, setKioskActive] = useState<boolean | null>(null);

  // Kiểm tra trạng thái kiosk khi modal mở
  useEffect(() => {
    const checkKioskStatus = async () => {
      if (open && kioskToken) {
        try {
          setIsCheckingKiosk(true);
          const isActive = await taphoammoApi.checkKioskActive(kioskToken);
          setKioskActive(isActive);
          
          if (!isActive) {
            setPurchaseError("Sản phẩm này tạm thời không khả dụng. Vui lòng thử lại sau hoặc chọn sản phẩm khác.");
          }
        } catch (error) {
          console.error("Lỗi kiểm tra kiosk:", error);
          // Không đặt lỗi ở đây để vẫn có thể tiếp tục mua hàng nếu có lỗi
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

    try {
      setIsProcessing(true);

      // Check kiosk status first
      const isActive = await taphoammoApi.checkKioskActive(kioskToken);
      if (!isActive) {
        toast.error("Sản phẩm này tạm thời không khả dụng. Vui lòng thử lại sau hoặc chọn sản phẩm khác.");
        return;
      }

      const orderData = await taphoammoApi.order.buyProducts(kioskToken, quantity);
      
      if (!orderData.order_id) {
        throw new Error("Không nhận được mã đơn hàng");
      }

      setPurchaseResult({ orderId: orderData.order_id });
      await checkOrderStatus(orderData.order_id);

      toast.success("Đặt hàng thành công!");

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi xử lý đơn hàng';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const checkOrderStatus = async (orderId: string) => {
    try {
      const result = await taphoammoApi.order.getProducts(orderId);
      
      if (result.success === "true" && Array.isArray(result.data)) {
        const keys = result.data.map(item => item.product);
        setPurchaseResult(prev => ({ ...prev, productKeys: keys }));
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái đơn hàng:", error);
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
                isProcessing={isProcessing}
                onCancel={() => onOpenChange(false)}
                onConfirm={handleConfirmPurchase}
              />
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
                      onClick={() => copyToClipboard(purchaseResult.productKeys?.join('\n') || '')}
                    >
                      <ClipboardIcon className="w-4 h-4 mr-2" />
                      Sao chép tất cả
                    </Button>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-md font-mono text-sm whitespace-pre-wrap break-all">
                    {purchaseResult.productKeys.map((key, index) => (
                      <div key={index} className="mb-2">{key}</div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-4">
                  <Button 
                    variant="outline"
                    onClick={() => checkOrderStatus(purchaseResult.orderId!)}
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    Kiểm tra đơn hàng
                  </Button>
                </div>
              )}

              <div className="flex justify-between mt-4 pt-4 border-t">
                <Button 
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Đóng
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard/purchases')}
                >
                  <ArrowRightIcon className="w-4 h-4 mr-2" />
                  Xem đơn hàng
                </Button>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
