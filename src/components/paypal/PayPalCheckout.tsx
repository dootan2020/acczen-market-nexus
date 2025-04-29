
import React, { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { PAYPAL_OPTIONS } from './paypal-config';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PayPalErrorBoundary } from './PayPalErrorBoundary';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PayPalCheckoutProps {
  amount: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  className?: string;
}

const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  amount,
  items,
  onSuccess,
  onError,
  className
}) => {
  const [loading, setLoading] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Reset error state when the component mounts or amount changes
    setPaypalError(null);
  }, [amount]);

  const createOrderHandler = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-paypal-order', {
        body: JSON.stringify({
          amount,
          items: items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            unit_amount: item.price
          }))
        })
      });
      
      if (error) {
        throw new Error('Failed to create PayPal order');
      }
      
      return data.id;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      setPaypalError('Failed to create PayPal order. Please try again later.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const onApproveHandler = async (data: any, actions: any) => {
    try {
      setLoading(true);
      
      // Capture the order
      const { data: captureData, error } = await supabase.functions.invoke('capture-paypal-order', {
        body: JSON.stringify({
          orderId: data.orderID
        })
      });
      
      if (error || !captureData.success) {
        throw new Error('Failed to capture PayPal order');
      }
      
      // Process the order in our database
      const { data: orderData, error: orderError } = await supabase.functions.invoke('process-transaction', {
        body: JSON.stringify({
          user_id: user?.id,
          items: items.map(item => ({
            id: item.id,
            quantity: item.quantity
          })),
          transaction_type: 'purchase',
          payment_method: 'paypal',
          payment_data: {
            paypal_order_id: data.orderID,
            paypal_payer_id: captureData.payer_id,
            paypal_payment_id: captureData.payment_id
          }
        })
      });
      
      if (orderError) {
        throw new Error('Failed to process order');
      }
      
      // Show success message
      toast({
        title: "Payment Successful",
        description: "Your purchase has been completed",
      });
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess({
          ...captureData,
          order: orderData.order
        });
      }
      
      // Prepare order data for the completion page
      const orderCompleteData = {
        id: orderData.order_id,
        total: amount,
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        })),
        payment_method: 'PayPal',
        transaction_id: data.orderID
      };
      
      // Navigate to the order complete page
      navigate('/order-complete', { state: { orderData: orderCompleteData } });
      
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      
      toast({
        title: "Payment Failed",
        description: "There was an issue processing your payment",
        variant: "destructive",
      });
      
      // Call the error callback if provided
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const onErrorHandler = (err: any) => {
    console.error('PayPal error:', err);
    setPaypalError('An error occurred with PayPal. Please try again later.');
    
    if (onError) {
      onError(err);
    }
    
    toast({
      title: "PayPal Error",
      description: "There was an issue with PayPal. Please try again later.",
      variant: "destructive",
    });
  };

  const onCancelHandler = () => {
    toast({
      title: "Payment Cancelled",
      description: "Your PayPal payment was cancelled",
    });
  };

  return (
    <div className={className}>
      <PayPalErrorBoundary>
        <PayPalScriptProvider options={PAYPAL_OPTIONS}>
          {paypalError ? (
            <Card className="p-4 border-red-200 bg-red-50">
              <div className="text-center space-y-4">
                <p className="text-red-700">{paypalError}</p>
                <Button onClick={() => setPaypalError(null)}>Try Again</Button>
              </div>
            </Card>
          ) : (
            <PayPalButtons
              style={{ layout: "vertical" }}
              createOrder={createOrderHandler}
              onApprove={onApproveHandler}
              onCancel={onCancelHandler}
              onError={onErrorHandler}
              disabled={loading || amount <= 0}
            />
          )}
        </PayPalScriptProvider>
      </PayPalErrorBoundary>
    </div>
  );
};

export default PayPalCheckout;
