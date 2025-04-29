
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrencyContext } from '@/contexts/CurrencyContext';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';
import CheckoutEmpty from '@/components/checkout/CheckoutEmpty';
import OrderSummary from '@/components/checkout/OrderSummary';
import CheckoutCard from '@/components/checkout/CheckoutCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { z } from 'zod';

// Define validation schema for checkout
const checkoutSchema = z.object({
  hasEnoughBalance: z.boolean().refine(val => val === true, {
    message: "Số dư không đủ để hoàn tất giao dịch này"
  }),
  hasItems: z.boolean().refine(val => val === true, {
    message: "Không có sản phẩm nào trong giỏ hàng"
  }),
  validStock: z.boolean().refine(val => val === true, {
    message: "Một số sản phẩm không đủ số lượng"
  })
});

type CheckoutValidation = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { convertVNDtoUSD } = useCurrencyContext();
  const { cartItems, totalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<CheckoutValidation>({
    hasEnoughBalance: true,
    hasItems: true,
    validStock: true
  });
  
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
      // Save current location to redirect back after login
      localStorage.setItem('previousPath', location.pathname);
      navigate("/login");
      return;
    }
    
    // Fetch user balance
    const fetchBalance = async () => {
      try {
        setError(null);
        const { data, error } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', user.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        setUserBalance(data.balance || 0);
        
        // Get items and total
        const items = singleProduct ? [{ ...singleProduct, quantity }] : cartItems;
        const total = singleProduct ? singleProduct.price * quantity : totalPrice;
        
        // Validate checkout data
        validateCheckout(data.balance || 0, items, total);
        
      } catch (error) {
        console.error('Error fetching user balance:', error);
        setError('Không thể tải thông tin số dư. Vui lòng thử lại.');
        toast({
          title: "Failed to fetch balance",
          description: "Please try refreshing the page",
          variant: "destructive",
        });
      }
    };
    
    fetchBalance();
  }, [user, navigate, location, toast, cartItems, totalPrice, singleProduct, quantity]);

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

  const validateCheckout = (balance: number, checkoutItems: typeof items, totalAmount: number) => {
    const newValidation = {
      hasEnoughBalance: balance >= totalAmount,
      hasItems: checkoutItems.length > 0,
      validStock: true
    };
    
    // Check for item availability
    const unavailableItem = checkoutItems.find(item => 
      item.stock_quantity !== undefined && 
      item.quantity !== undefined && 
      item.stock_quantity < item.quantity
    );
    
    if (unavailableItem) {
      newValidation.validStock = false;
    }
    
    setValidation(newValidation);
    
    // Set error message if validation fails
    if (!newValidation.hasEnoughBalance) {
      setError('Số dư không đủ. Vui lòng nạp thêm tiền để tiếp tục.');
    } else if (!newValidation.hasItems) {
      setError('Không có sản phẩm nào để thanh toán.');
    } else if (!newValidation.validStock) {
      const item = unavailableItem as (typeof items)[0];
      setError(`Sản phẩm "${item.name}" không đủ số lượng.`);
    } else {
      setError(null);
    }
    
    return newValidation.hasEnoughBalance && 
           newValidation.hasItems && 
           newValidation.validStock;
  };

  const handlePurchase = async () => {
    // Revalidate before proceeding
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to complete your purchase",
        variant: "destructive",
      });
      localStorage.setItem('previousPath', location.pathname);
      navigate("/login");
      return;
    }
    
    // Final validation check
    const isValid = validateCheckout(userBalance, items, total);
    if (!isValid) return;
    
    setIsProcessing(true);
    setError(null);
    
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
      
      if (error) {
        throw error;
      }
      
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
      setError(error instanceof Error ? error.message : "Có lỗi xảy ra trong quá trình thanh toán.");
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
          aria-label="Back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Lỗi thanh toán</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <CheckoutCard 
              balanceUSD={balanceUSD}
              totalUSD={totalUSD}
              hasEnoughBalance={hasEnoughBalance}
              isProcessing={isProcessing}
              onPurchase={handlePurchase}
              isValid={validation.hasEnoughBalance && validation.hasItems && validation.validStock}
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
