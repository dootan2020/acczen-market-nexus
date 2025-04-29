
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define the type for order data including discount
export interface OrderConfirmationData {
  id: string;
  items?: {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  total?: number;
  payment_method?: string;
  transaction_id?: string;
  digital_items?: {
    name: string;
    keys?: string[];
  }[];
  discount?: { // Added discount property
    percentage: number;
    amount: number;
  };
}

export const useOrderConfirmation = () => {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOrderConfirmationEmail = async (userId: string, orderData: OrderConfirmationData) => {
    setIsSending(true);
    setError(null);
    
    try {
      const { error } = await supabase.functions.invoke('send-notification-email', {
        body: JSON.stringify({
          type: 'order_confirmation',
          user_id: userId,
          data: {
            order_id: orderData.id,
            items: orderData.items || [],
            total: orderData.total || 0,
            payment_method: orderData.payment_method || 'Account Balance',
            transaction_id: orderData.transaction_id,
            digital_items: orderData.digital_items || [],
            discount: orderData.discount || null,
            date: new Date().toISOString()
          }
        })
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error('Error sending order confirmation email:', err);
      setError(err.message || 'Failed to send confirmation email');
    } finally {
      setIsSending(false);
    }
  };

  return {
    isSending,
    error,
    sendOrderConfirmationEmail
  };
};

export default useOrderConfirmation;
