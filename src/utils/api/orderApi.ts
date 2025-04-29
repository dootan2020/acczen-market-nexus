
import { supabase } from '@/integrations/supabase/client';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const orderApi = {
  buyProducts: async (
    kioskToken: string,
    quantity: number,
    userToken: string,
    promotion?: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('purchase-product', {
        body: { 
          kioskToken, 
          quantity,
          promotion 
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new Error(data.message || "Purchase failed");
      }
      
      return data;
    } catch (error) {
      console.error("Error in buyProducts:", error);
      throw error;
    }
  },
  
  getProducts: async (
    orderId: string,
    userToken: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-order-products', {
        body: { orderId }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new Error(data.message || "Failed to get products");
      }
      
      return data;
    } catch (error) {
      console.error("Error in getProducts:", error);
      throw error;
    }
  }
};
