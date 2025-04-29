
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TaphoammoStock {
  name?: string;
  stock_quantity: number;
  price: number;
  cached?: boolean;
}

export interface PurchaseResult {
  success: boolean;
  order_id?: string;
  status?: string;
  product_keys?: string[];
  error?: string;
}

export interface OrderProductsResult {
  success: boolean;
  products?: Array<{
    id: string;
    product: string;
  }>;
  cached?: boolean;
  error?: string;
  orderInfo?: {
    created_at: string;
    status: string;
    total_amount: number;
  };
}

export function useTaphoammoApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Check stock availability for a given kiosk token
   */
  const checkStock = async (
    kioskToken: string, 
    productId?: string
  ): Promise<{
    success: boolean;
    stockInfo?: TaphoammoStock;
    cached?: boolean;
    message?: string;
  }> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('sync-products', {
        body: { kioskToken, productId }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to check stock');
      }
      
      return {
        success: true,
        stockInfo: data.stockInfo as TaphoammoStock,
        cached: !!data.cached,
        message: data.message
      };
      
    } catch (err: any) {
      setError(err.message || 'Failed to check stock');
      
      toast.error('Error checking stock', {
        description: err.message || 'An unknown error occurred',
      });
      
      return {
        success: false,
        message: err.message
      };
      
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Purchase product using a kiosk token
   */
  const purchaseProduct = async (
    kioskToken: string,
    productId: string,
    quantity = 1,
    promotion?: string
  ): Promise<PurchaseResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('purchase-product', {
        body: { kioskToken, productId, quantity, promotion }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to purchase product');
      }
      
      toast.success('Purchase successful!', {
        description: `Order ID: ${data.order_id}`,
      });
      
      return {
        success: true,
        order_id: data.order_id,
        status: data.status,
        product_keys: data.product_keys
      };
      
    } catch (err: any) {
      setError(err.message || 'Failed to purchase product');
      
      toast.error('Purchase failed', {
        description: err.message || 'An unknown error occurred',
      });
      
      return {
        success: false,
        error: err.message
      };
      
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Get products for an order
   */
  const getOrderProducts = async (
    orderId: string
  ): Promise<OrderProductsResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-order-products', {
        body: { orderId }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to get order products');
      }
      
      return {
        success: true,
        products: data.products,
        cached: !!data.cached
      };
      
    } catch (err: any) {
      setError(err.message || 'Failed to get order products');
      
      toast.error('Error retrieving order products', {
        description: err.message || 'An unknown error occurred',
      });
      
      return {
        success: false,
        error: err.message
      };
      
    } finally {
      setLoading(false);
    }
  };
  
  return {
    checkStock,
    purchaseProduct,
    getOrderProducts,
    loading,
    error
  };
}
