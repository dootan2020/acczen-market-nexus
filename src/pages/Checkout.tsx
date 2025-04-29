
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Wallet, Clock, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrencyContext } from '@/contexts/CurrencyContext';
import PayPalDeposit from '@/components/PayPalDeposit';
import USDTDeposit from '@/components/USDTDeposit';
import TrustBadges from '@/components/trust/TrustBadges';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';

const Checkout = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { formatUSD, convertVNDtoUSD } = useCurrencyContext();
  const { cartItems, totalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('balance');
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
        <div className="max-w-3xl mx-auto text-center">
          <Card>
            <CardHeader>
              <CardTitle>Your cart is empty</CardTitle>
              <CardDescription>Add items to your cart to proceed with checkout</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button onClick={() => navigate('/')}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </CardFooter>
          </Card>
        </div>
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
            <Card>
              <CardHeader>
                <CardTitle>Checkout</CardTitle>
                <CardDescription>Complete your purchase</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="balance">
                      <Wallet className="mr-2 h-4 w-4" />
                      Account Balance
                    </TabsTrigger>
                    <TabsTrigger value="deposit">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Add Funds
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="balance" className="space-y-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Current Balance:</span>
                        <span className="font-medium text-lg">{formatUSD(balanceUSD)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Order Total:</span>
                        <span className="font-medium text-lg">{formatUSD(totalUSD)}</span>
                      </div>
                      {hasEnoughBalance ? (
                        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded border border-green-200 text-sm">
                          You have sufficient funds to complete this purchase.
                        </div>
                      ) : (
                        <div className="mt-4 p-3 bg-amber-50 text-amber-700 rounded border border-amber-200 text-sm">
                          Insufficient balance. Please add {formatUSD(totalUSD - balanceUSD)} to complete this purchase.
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      onClick={handlePurchase} 
                      disabled={isProcessing || !hasEnoughBalance}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Complete Purchase'
                      )}
                    </Button>
                    
                    <TrustBadges variant="compact" />
                  </TabsContent>
                  
                  <TabsContent value="deposit">
                    <div className="space-y-6">
                      <Tabs defaultValue="paypal">
                        <TabsList className="grid grid-cols-2 mb-6">
                          <TabsTrigger value="paypal">
                            PayPal
                          </TabsTrigger>
                          <TabsTrigger value="usdt">
                            USDT (TRC20)
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="paypal">
                          <PayPalDeposit />
                        </TabsContent>
                        
                        <TabsContent value="usdt">
                          <USDTDeposit />
                        </TabsContent>
                      </Tabs>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{formatUSD(convertVNDtoUSD(item.price * item.quantity))}</p>
                  </div>
                ))}
                <div className="pt-4 border-t mt-4">
                  <div className="flex justify-between">
                    <p>Subtotal</p>
                    <p className="font-medium">{formatUSD(totalUSD)}</p>
                  </div>
                  <div className="flex justify-between mt-2">
                    <p className="font-medium">Total</p>
                    <p className="font-bold text-lg">{formatUSD(totalUSD)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
