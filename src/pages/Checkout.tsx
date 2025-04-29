
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrencyContext } from '@/contexts/CurrencyContext';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';
import CheckoutEmpty from '@/components/checkout/CheckoutEmpty';
import OrderSummary from '@/components/checkout/OrderSummary';
import CheckoutCard from '@/components/checkout/CheckoutCard';

const Checkout = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { convertVNDtoUSD } = useCurrencyContext();
  const { cartItems, totalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  
  // Check if we have a single product purchase instead of cart
  const singleProduct = location.state?.product;
  const quantity = location.state?.quantity || 1;
  
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to complete your purchase",
        variant: "destructive",
      });
      navigate("/login", { state: { from: location } });
      return;
    }
    
    // Fetch user balance
    const fetchBalance = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setUserBalance(data.balance || 0);
      } catch (error) {
        console.error('Error fetching user balance:', error);
        toast({
          title: "Failed to fetch balance",
          description: "Please try refreshing the page",
          variant: "destructive",
        });
      }
    };
    
    fetchBalance();
  }, [user, navigate, location, toast]);

  // Get items and total based on whether it's a cart checkout or single product
  const items = singleProduct 
    ? [{ ...singleProduct, quantity }] 
    : cartItems;
    
  const total = singleProduct 
    ? singleProduct.price * quantity
    : totalPrice;
    
  const totalUSD = convertVNDtoUSD(total);
  const balanceUSD = convertVNDtoUSD(userBalance);
  const hasEnoughBalance = userBalance >= total;

  const handlePurchase = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    
    try {
      // Call the purchase-product edge function to process the purchase
      const { data, error } = await supabase.functions.invoke('purchase-product', {
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            quantity: item.quantity
          }))
        })
      });
      
      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.message || "Failed to process the purchase");
      }
      
      // Clear cart on successful purchase
      if (!singleProduct) {
        clearCart();
      }
      
      // Prepare order data for order complete page
      const orderData = {
        id: data.order.id,
        total: data.order.totalUSD,
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: convertVNDtoUSD(item.price),
          total: convertVNDtoUSD(item.price * item.quantity)
        })),
        payment_method: 'Account Balance'
      };
      
      toast({
        title: "Purchase Successful",
        description: `Order #${data.order.id} has been completed`,
      });
      
      // Redirect to order complete page
      navigate('/order-complete', { state: { orderData } });
      
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !singleProduct) {
    return (
      <div className="container mx-auto py-12 px-4">
        <CheckoutEmpty />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <CheckoutCard 
              balanceUSD={balanceUSD}
              totalUSD={totalUSD}
              hasEnoughBalance={hasEnoughBalance}
              isProcessing={isProcessing}
              onPurchase={handlePurchase}
            />
          </div>

          <div>
            <OrderSummary items={items} total={total} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
