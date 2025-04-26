
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrencyContext } from '@/contexts/CurrencyContext';

export const useOrderConfirmation = () => {
  const { convertVNDtoUSD } = useCurrencyContext();

  const sendOrderConfirmationEmail = useCallback(async (
    userId: string, 
    orderData: {
      id: string;
      items: Array<{
        name: string;
        quantity: number;
        price: number;
        product_id?: string;
      }>;
      total: number;
      payment_method?: string;
      transaction_id?: string;
      digital_items?: Array<{
        name: string;
        keys?: string[];
      }>;
    }
  ) => {
    try {
      const response = await supabase.functions.invoke('send-notification-email', {
        body: {
          user_id: userId,
          template: 'order_confirmation',
          data: {
            order_id: orderData.id,
            date: new Date().toISOString(),
            total: convertVNDtoUSD(orderData.total),
            payment_method: orderData.payment_method || 'Account Balance',
            transaction_id: orderData.transaction_id,
            items: orderData.items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: convertVNDtoUSD(item.price),
              total: convertVNDtoUSD(item.price * item.quantity)
            })),
            digital_items: orderData.digital_items || []
          }
        }
      });

      if (!response.data?.success) {
        console.error("Failed to send order confirmation email:", response.error);
        return { success: false, error: response.error };
      }

      return { success: true };
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      return { success: false, error };
    }
  }, [convertVNDtoUSD]);

  const sendOrderStatusUpdateEmail = useCallback(async (
    userId: string,
    orderData: {
      id: string;
      status: string;
      updated_at: string;
      message?: string;
    }
  ) => {
    try {
      const response = await supabase.functions.invoke('send-notification-email', {
        body: {
          user_id: userId,
          template: 'order_status_update',
          data: {
            order_id: orderData.id,
            status: orderData.status,
            updated_at: orderData.updated_at,
            message: orderData.message
          }
        }
      });

      if (!response.data?.success) {
        console.error("Failed to send order status update email:", response.error);
        return { success: false, error: response.error };
      }

      return { success: true };
    } catch (error) {
      console.error("Error sending status update email:", error);
      return { success: false, error };
    }
  }, []);

  return {
    sendOrderConfirmationEmail,
    sendOrderStatusUpdateEmail
  };
};
