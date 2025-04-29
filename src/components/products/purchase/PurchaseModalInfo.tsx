
import { AlertTriangle, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import StockSoldBadges from "@/components/products/inventory/StockSoldBadges";

interface PurchaseModalInfoProps {
  stock?: number;
  soldCount?: number;
  totalPrice?: number;
  description?: string;
  insufficientBalance?: boolean;
}

export function PurchaseModalInfo({ 
  stock = 0, 
  soldCount = 0, 
  totalPrice = 0,
  description = "",
  insufficientBalance = false
}: PurchaseModalInfoProps) {
  const { user } = useAuth();
  const { formatVND } = useCurrencyContext();
  
  // Get user balance from auth context
  const userBalance = user?.user_metadata?.balance || 0;
  const isEnoughBalance = userBalance >= totalPrice;
  const showWarning = insufficientBalance || !isEnoughBalance;
  
  return (
    <div className="space-y-4">
      {/* Stock information */}
      <div className="mb-2">
        <StockSoldBadges stock={stock} soldCount={soldCount} />
      </div>
      
      {/* Short description */}
      {description && (
        <div className="text-sm text-muted-foreground">
          <p className="line-clamp-2">{description}</p>
        </div>
      )}
      
      {/* Balance information */}
      <div className="bg-gray-50 p-3 rounded-md border">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Số dư của bạn:</span>
          <span className="font-medium">{formatVND(userBalance)}</span>
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm text-muted-foreground">Cần thanh toán:</span>
          <span className="font-medium text-[#2ECC71]">{formatVND(totalPrice)}</span>
        </div>
      </div>
      
      {/* Warning if not enough balance */}
      {showWarning && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 flex gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm text-red-600">
              Số dư của bạn không đủ để mua sản phẩm này.
            </p>
            <Button
              asChild
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Link to="/deposit">Nạp tiền ngay</Link>
            </Button>
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <div className="flex gap-2 text-sm text-muted-foreground">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <p>
          Sản phẩm sẽ được gửi đến tài khoản của bạn ngay sau khi thanh toán thành công.
        </p>
      </div>
    </div>
  );
}
