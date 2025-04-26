
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useCurrencyContext } from '@/contexts/CurrencyContext';

// ProxyType enum to match what we're using in our new implementation
enum ProxyType {
  DIRECT = 'direct',
  CORSPROXY_IO = 'corsproxy.io'
}

// Helper function to get current proxy setting
const getStoredProxy = (): ProxyType => {
  return ProxyType.DIRECT; // Default to direct
};

export const usePurchaseTaphoammo = (kioskToken: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const { user } = useAuth();
  const { convertVNDtoUSD, formatUSD } = useCurrencyContext();
  
  const purchaseProduct = async (quantity = 1) => {
    if (!user?.id) {
      toast.error("You must be logged in to make a purchase");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    setOrderDetails(null);
    
    try {
      // Get the proxy type
      const proxyType = getStoredProxy();
      
      // Step 1: Check balance
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();
      
      if (userError) {
        throw new Error(userError.message);
      }
      
      // Step 2: Call Edge Function to handle purchase
      const { data, error } = await supabase.functions.invoke('purchase-product', {
        body: JSON.stringify({ 
          kioskToken,
          quantity,
          proxyType
        })
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new Error(data.message || "Failed to purchase product");
      }
      
      // Step 3: Update UI if successful
      setSuccess(true);
      setOrderDetails(data);
      
      // Show success notification
      toast.success("Product purchased successfully!", {
        description: `Your order ID: ${data.orderId}`,
      });
      
      return data;
      
    } catch (err) {
      console.error("Purchase error:", err);
      setError(err instanceof Error ? err.message : "Failed to purchase product");
      
      toast.error("Purchase failed", {
        description: err instanceof Error ? err.message : "Failed to purchase product",
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const validatePurchase = async (productPrice: number, quantity = 1): Promise<{ 
    valid: boolean; 
    message?: string; 
    orderDetails?: any;
  }> => {
    if (!user?.id) {
      return { valid: false, message: "You must be logged in to make a purchase" };
    }
    
    try {
      // Step 1: Check balance
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();
      
      if (userError) {
        throw new Error(userError.message);
      }
      
      const totalPrice = productPrice * quantity;
      
      if (userData.balance < totalPrice) {
        // Convert to USD for display
        const totalPriceUSD = convertVNDtoUSD(totalPrice);
        const balanceUSD = convertVNDtoUSD(userData.balance);
        
        return { 
          valid: false, 
          message: `Insufficient balance. You need ${formatUSD(totalPriceUSD)} but your balance is ${formatUSD(balanceUSD)}` 
        };
      }
      
      return { valid: true };
      
    } catch (err) {
      console.error("Validation error:", err);
      return { 
        valid: false, 
        message: err instanceof Error ? err.message : "Failed to validate purchase" 
      };
    }
  };
  
  const checkStockAvailability = async (quantity = 1): Promise<{
    available: boolean;
    message?: string;
    stockData?: any;
  }> => {
    try {
      // Get admin info from Edge Function
      const proxyType = getStoredProxy();
      
      const { data, error } = await supabase.functions.invoke('process-taphoammo-order', {
        body: JSON.stringify({ 
          action: 'check_stock',
          kioskToken,
          quantity,
          proxyType
        })
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        return {
          available: false,
          message: data.message || "Product is not available"
        };
      }
      
      return {
        available: true,
        stockData: data.stockInfo
      };
      
    } catch (err) {
      console.error("Stock check error:", err);
      return {
        available: false,
        message: err instanceof Error ? err.message : "Failed to check stock availability"
      };
    }
  };
  
  return {
    purchaseProduct,
    validatePurchase,
    checkStockAvailability,
    isProcessing: loading,
    loading,
    error,
    success,
    orderDetails
  };
};
