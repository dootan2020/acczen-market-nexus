
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { TaphoammoProduct } from '@/types/products';
import { toast } from 'sonner';

export const useStockSync = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncProductStock = async (kioskToken: string): Promise<{
    success: boolean;
    message?: string;
    stockData?: TaphoammoProduct;
    oldQuantity?: number;
    newQuantity?: number;
  }> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('sync-inventory', {
        body: JSON.stringify({
          kioskToken,
          syncType: 'manual'
        })
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Đồng bộ thất bại');
      }
      
      const stockData: TaphoammoProduct = {
        kiosk_token: kioskToken,
        name: data.name,
        stock_quantity: data.new_quantity,
        price: data.new_price
      };
      
      return {
        success: true,
        message: `Đồng bộ thành công. Tồn kho: ${data.old_quantity} → ${data.new_quantity}`,
        stockData,
        oldQuantity: data.old_quantity,
        newQuantity: data.new_quantity
      };
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error in syncProductStock:', errorMsg);
      setError(errorMsg);
      
      return {
        success: false,
        message: `Lỗi đồng bộ: ${errorMsg}`
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    syncProductStock,
    loading,
    error
  };
};
