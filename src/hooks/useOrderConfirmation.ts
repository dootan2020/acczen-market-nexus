
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrencyContext } from '@/contexts/CurrencyContext';
import { toast } from 'sonner';
import { Json } from '@/types/supabase';
import { 
  OrderEmailPayload, 
  OrderEmailItem, 
  DigitalEmailItem,
  isOrderRow 
} from '@/types/orders';

// Define types for order data
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  product_id?: string;
}

export interface DigitalItem {
  name: string;
  keys?: string[];
}

export interface OrderConfirmationData {
  id: string;
  items: OrderItem[];
  total: number;
  payment_method?: string;
  transaction_id?: string;
  digital_items?: DigitalItem[];
}

export interface OrderStatusUpdateData {
  id: string;
  status: string;
  updated_at: string;
  message?: string;
}

// Define the interface for order data from the database
interface OrderRow {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: OrderItemRow[];
}

interface OrderItemRow {
  id: string;
  quantity: number;
  price: number;
  total: number;
  data: Json | null;
  product?: ProductInfo | null;
}

interface ProductInfo {
  id: string;
  name: string;
}

interface OrderItemData {
  product_keys?: string[];
  kiosk_token?: string;
  taphoammo_order_id?: string;
  [key: string]: any;  // Allow for other properties
}

// Type guard to check if a value is a non-null object
const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

// Safely extract product keys from Json data
const safeGetProductKeys = (data: Json | null | undefined): string[] | undefined => {
  if (!data) return undefined;
  
  if (isObject(data) && Array.isArray(data.product_keys)) {
    return data.product_keys as string[];
  }
  
  return undefined;
};

export const useOrderConfirmation = () => {
  const { convertVNDtoUSD } = useCurrencyContext();

  const sendOrderConfirmationEmail = useCallback(async (
    userId: string, 
    orderData: OrderConfirmationData
  ) => {
    try {
      toast.info("Sending order confirmation email...");
      
      // Process items to ensure they have proper USD pricing
      const processedItems = orderData.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: convertVNDtoUSD(item.price),
        total: convertVNDtoUSD(item.price * item.quantity)
      }));
      
      // Create properly typed email payload
      const emailPayload: OrderEmailPayload = {
        order_id: orderData.id,
        date: new Date().toISOString(),
        total: convertVNDtoUSD(orderData.total),
        payment_method: orderData.payment_method || 'Account Balance',
        transaction_id: orderData.transaction_id,
        items: processedItems,
        digital_items: orderData.digital_items || []
      };
      
      const response = await supabase.functions.invoke('send-notification-email', {
        body: {
          user_id: userId,
          template: 'order_confirmation',
          data: emailPayload
        }
      });

      if (!response.data?.success) {
        console.error("Failed to send order confirmation email:", response.error);
        toast.error("Failed to send confirmation email. Please try again later.");
        return { success: false, error: response.error };
      }

      toast.success("Order confirmation email sent successfully!");
      return { success: true };
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      toast.error("Failed to send confirmation email. Please try again later.");
      return { success: false, error };
    }
  }, [convertVNDtoUSD]);

  const sendOrderStatusUpdateEmail = useCallback(async (
    userId: string,
    orderData: OrderStatusUpdateData
  ) => {
    try {
      toast.info("Sending order status update...");
      
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
        toast.error("Failed to send status update email. Please try again later.");
        return { success: false, error: response.error };
      }

      toast.success("Order status update email sent successfully!");
      return { success: true };
    } catch (error) {
      console.error("Error sending status update email:", error);
      toast.error("Failed to send status update email. Please try again later.");
      return { success: false, error };
    }
  }, []);

  const resendOrderConfirmationEmail = useCallback(async (
    userId: string,
    orderId: string
  ) => {
    try {
      toast.info("Retrieving order data...");
      
      // Fetch the order data from the database with strong typing
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          order_items (
            id,
            quantity,
            price,
            total,
            data,
            product:products(id, name)
          )
        `)
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();
      
      if (orderError || !orderData) {
        console.error("Failed to fetch order data:", orderError);
        toast.error("Failed to retrieve order details. Please try again later.");
        return { success: false, error: orderError || new Error("Order not found") };
      }
      
      // Use type guard to ensure we have the right structure
      if (!isOrderRow(orderData)) {
        console.error("Invalid order data structure:", orderData);
        toast.error("Failed to process order details. Invalid data format.");
        return { success: false, error: new Error("Invalid order data structure") };
      }
      
      // Process the order data for email sending
      const confirmationData: OrderConfirmationData = {
        id: orderData.id,
        items: orderData.order_items.map(item => ({
          name: item.product?.name || "Unknown Product",
          quantity: item.quantity,
          price: item.price,
          product_id: item.product?.id
        })),
        total: orderData.total_amount,
        payment_method: "Account Balance", // Default value
        digital_items: orderData.order_items
          .filter(item => {
            const productKeys = safeGetProductKeys(item.data);
            return productKeys && productKeys.length > 0;
          })
          .map(item => {
            const productKeys = safeGetProductKeys(item.data);
            return {
              name: item.product?.name || "Unknown Product",
              keys: productKeys || []
            };
          })
      };
      
      // Send the email with the reconstructed data
      return await sendOrderConfirmationEmail(userId, confirmationData);
    } catch (error) {
      console.error("Error resending confirmation email:", error);
      toast.error("Failed to resend confirmation email. Please try again later.");
      return { success: false, error };
    }
  }, [sendOrderConfirmationEmail]);

  return {
    sendOrderConfirmationEmail,
    sendOrderStatusUpdateEmail,
    resendOrderConfirmationEmail
  };
};
