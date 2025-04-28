
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Clipboard, RefreshCw, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PurchaseResultCardProps {
  orderId?: string;
  productKeys?: string[];
  isCheckingOrder: boolean;
  onCheckOrder: (orderId: string) => Promise<void>;
  onReset: () => void;
  onClose: () => void;
}

export const PurchaseResultCard = ({
  orderId,
  productKeys,
  isCheckingOrder,
  onCheckOrder,
  onReset,
  onClose,
}: PurchaseResultCardProps) => {
  const navigate = useNavigate();
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Đã sao chép vào clipboard!");
    } catch (err) {
      toast.error("Không thể sao chép. Vui lòng thử lại.");
    }
  };

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Kết Quả Mua Hàng</h3>
        <p className="text-sm text-muted-foreground">
          Mã đơn hàng: {orderId}
        </p>
      </div>

      {productKeys?.length ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Thông tin sản phẩm</h4>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => copyToClipboard(productKeys?.join('\n\n') || '')}
            >
              <Clipboard className="w-4 h-4 mr-2" />
              Sao chép tất cả
            </Button>
          </div>
          
          <div className="bg-muted p-4 rounded-md font-mono text-sm whitespace-pre-wrap break-all">
            {productKeys.map((key, index) => (
              <div key={index} className="mb-2 pb-2 border-b border-gray-200 last:border-0">
                {key}
              </div>
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
              onClick={() => orderId && onCheckOrder(orderId)}
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
          onClick={onReset}
        >
          Đặt lại
        </Button>
        <div className="space-x-2">
          <Button 
            variant="outline"
            onClick={onClose}
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
  );
};
