
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useInventorySync } from '@/hooks/useInventorySync';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SyncInventoryButtonProps {
  kioskToken: string;
  productName: string;
  onSuccess?: (data: any) => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon"; // Removed "xs" as it's not a valid size
}

const SyncInventoryButton: React.FC<SyncInventoryButtonProps> = ({
  kioskToken,
  productName,
  onSuccess,
  variant = "outline",
  size = "icon"
}) => {
  const { syncProductStock, loading } = useInventorySync();
  const [lastSyncResult, setLastSyncResult] = useState<'success' | 'error' | null>(null);
  
  const handleSyncClick = async () => {
    if (!kioskToken) {
      toast.error('Không có mã kiosk để đồng bộ');
      return;
    }
    
    try {
      const result = await syncProductStock(kioskToken);
      
      if (result.success) {
        setLastSyncResult('success');
        toast.success(result.message || 'Đồng bộ thành công');
        if (onSuccess && result.stockData) {
          onSuccess(result.stockData);
        }
      } else {
        setLastSyncResult('error');
        toast.error(result.message || 'Đồng bộ thất bại');
      }
      
      // Reset status after 3 seconds
      setTimeout(() => setLastSyncResult(null), 3000);
    } catch (err) {
      setLastSyncResult('error');
      console.error('Error syncing inventory:', err);
      toast.error('Lỗi đồng bộ kho hàng');
      
      // Reset status after 3 seconds
      setTimeout(() => setLastSyncResult(null), 3000);
    }
  };
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          onClick={handleSyncClick}
          disabled={loading}
          className={lastSyncResult === 'success' ? 'text-green-500' : lastSyncResult === 'error' ? 'text-red-500' : ''}
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : lastSyncResult === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : lastSyncResult === 'error' ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Đồng bộ kho hàng cho {productName}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default SyncInventoryButton;
