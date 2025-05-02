import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useCurrencyContext } from '@/contexts/CurrencyContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BalancePaymentTab from '@/components/checkout/BalancePaymentTab';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

const Checkout: React.FC = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { convertVNDtoUSD, formatUSD } = useCurrencyContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [balanceUSD, setBalanceUSD] = useState(0);
  const [hasEnoughBalance, setHasEnoughBalance] = useState(false);
  const totalUSD = convertVNDtoUSD(totalPrice);
  
  // Check for direct checkout from product page
  const productFromLocation = location.state?.product;
  const productQuantity = location.state?.quantity || 1;
  
  // Items to process - either from cart or from direct product purchase
  const itemsToProcess = productFromLocation 
    ? [{ ...productFromLocation, quantity: productQuantity }]
    : cartItems;
    
  // Calculate total if coming directly from product
  const checkoutTotal = productFromLocation
    ? productFromLocation.price * productQuantity
    : totalPrice;
    
  const checkoutTotalUSD = convertVNDtoUSD(checkoutTotal);

  useEffect(() => {
    // Redirect if no items to checkout
    if (itemsToProcess.length === 0) {
      navigate('/cart');
      return;
    }

    // Check user's balance
    const fetchBalance = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', user.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          const userBalanceUSD = convertVNDtoUSD(data.balance);
          setBalanceUSD(userBalanceUSD);
          setHasEnoughBalance(userBalanceUSD >= checkoutTotalUSD);
        }
      } catch (error) {
        console.error('Error fetching user balance:', error);
        toast.error('Could not load account balance');
      }
    };

    fetchBalance();
  }, [user, checkoutTotalUSD]);

  // If not logged in, redirect to login
  useEffect(() => {
    if (!user) {
      // Save the current path to redirect back after login
      localStorage.setItem('previousPath', location.pathname);
      navigate('/login');
    }
  }, [user, navigate, location.pathname]);

  const handlePurchase = async () => {
    if (!user || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Format items for the purchase API
      const purchaseItems = itemsToProcess.map(item => ({
        id: item.id,
        quantity: item.quantity
      }));
      
      // Call purchase function API
      const { data, error } = await supabase.functions.invoke('purchase-product', {
        body: { items: purchaseItems }
      });
      
      if (error || !data.success) {
        throw new Error(error?.message || data?.message || 'Error processing purchase');
      }
      
      // Clear cart if this was a cart purchase
      if (!productFromLocation) {
        clearCart();
      }
      
      // Show success message
      toast.success('Purchase completed successfully');
      
      // Redirect to order complete page
      navigate('/order-complete', { 
        state: { 
          orderData: {
            id: data.order.id,
            total: checkoutTotalUSD,
            items: itemsToProcess.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: convertVNDtoUSD(item.price),
              total: convertVNDtoUSD(item.price * item.quantity)
            }))
          } 
        } 
      });
      
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Failed to complete purchase');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-10">
            <div className="text-center">
              <LoadingSpinner className="mx-auto" />
              <p className="mt-2">Redirecting to login...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Checkout items summary */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                {itemsToProcess.length} {itemsToProcess.length === 1 ? 'item' : 'items'} in your order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {itemsToProcess.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-20 h-20 object-cover rounded" 
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                      <p className="mt-1">
                        {formatUSD(convertVNDtoUSD(item.price * item.quantity))}
                      </p>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 mt-4 border-t">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatUSD(checkoutTotalUSD)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Payment options */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Choose how you want to pay</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="balance">
                <TabsList className="grid grid-cols-1 mb-4">
                  <TabsTrigger value="balance">Account Balance</TabsTrigger>
                </TabsList>
                
                <TabsContent value="balance">
                  <BalancePaymentTab
                    balanceUSD={balanceUSD}
                    totalUSD={checkoutTotalUSD}
                    hasEnoughBalance={hasEnoughBalance}
                    isProcessing={isProcessing}
                    onPurchase={handlePurchase}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        
        <Button
          onClick={handlePurchase}
          disabled={isProcessing || !hasEnoughBalance}
          className="min-w-[150px]"
        >
          {isProcessing ? (
            <>
              <LoadingSpinner className="mr-2" />
              Processing...
            </>
          ) : (
            <>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Complete Purchase
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Checkout;
