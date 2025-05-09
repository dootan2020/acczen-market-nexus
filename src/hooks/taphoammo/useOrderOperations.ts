
import { useApiCommon } from './useApiCommon';
import { supabase } from '@/integrations/supabase/client';
import { TaphoammoIntegration } from '@/services/taphoammo/TaphoammoIntegration';
import { toast } from 'sonner';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';

// Create a singleton instance of TaphoammoIntegration
const taphoammoIntegration = new TaphoammoIntegration();

export const useOrderOperations = () => {
  const { loading, setLoading, error, setError, retry, withRetry } = useApiCommon();

  // Buy products through Edge Function
  const buyProducts = async (
    kioskToken: string,
    userToken: string,
    quantity: number
  ) => {
    setLoading(true);
    setError(null);

    try {
      // First call Edge Function to handle purchase
      const { data, error: functionError } = await supabase.functions.invoke('purchase-product', {
        body: JSON.stringify({
          kioskToken,
          quantity
        })
      });

      if (functionError) {
        console.error('Edge function error:', functionError);
        throw new Error(functionError.message || 'Failed to call purchase function');
      }

      if (!data || data.success === false) {
        const errorMessage = data?.message || 'Failed to purchase product';
        console.error('Purchase failed:', errorMessage);
        throw new Error(errorMessage);
      }

      return data;
    } catch (err: any) {
      let errorMsg = 'Unknown error during purchase';
      
      // Enhanced error handling
      if (err instanceof Error) {
        errorMsg = err.message;
      } else if (typeof err === 'string') {
        errorMsg = err;
      } else if (err && typeof err === 'object') {
        errorMsg = err.message || err.error || JSON.stringify(err);
      }
      
      console.error('Error in buyProducts:', errorMsg);
      
      // Show user-friendly message for common errors
      if (err instanceof TaphoammoError) {
        if (err.code === TaphoammoErrorCodes.INSUFFICIENT_FUNDS) {
          toast.error("Insufficient funds to complete purchase");
        } else if (err.code === TaphoammoErrorCodes.STOCK_UNAVAILABLE) {
          toast.error("Product is out of stock");
        } else if (err.code === TaphoammoErrorCodes.API_TEMP_DOWN) {
          toast.error("Service is temporarily unavailable. Please try again later");
        } else {
          toast.error(`Purchase failed: ${err.message}`);
        }
      } else if (errorMsg.includes('HTML') || errorMsg.includes('proxy')) {
        toast.error("Our supplier API is temporarily unavailable. Please try again later.");
      } else {
        toast.error(`Purchase failed: ${errorMsg}`);
      }
      
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get products for an order
  const getProducts = async (orderId: string, userToken: string) => {
    setLoading(true);
    setError(null);

    try {
      // Use withRetry to get products with error handling
      const data = await withRetry(
        async () => taphoammoIntegration.getProducts(orderId, userToken),
        'getProducts'
      );

      return data;
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      
      // Don't show error for processing orders
      if (err instanceof TaphoammoError && err.code === TaphoammoErrorCodes.ORDER_PROCESSING) {
        console.log('Order still processing:', orderId);
      } else {
        setError(errorMsg);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Poll for order completion
  const checkOrderUntilComplete = async (
    orderId: string,
    userToken: string,
    maxRetries: number = 5
  ) => {
    setLoading(true);
    
    try {
      const result = await taphoammoIntegration.checkOrderUntilComplete(
        orderId, userToken, maxRetries, 2000
      );
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to check order status';
      setError(errorMsg);
      return {
        success: false,
        message: errorMsg
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    buyProducts,
    getProducts,
    checkOrderUntilComplete,
    loading,
    error,
    retry
  };
};
