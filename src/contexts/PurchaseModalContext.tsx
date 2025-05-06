
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useOrderOperations } from '@/hooks/taphoammo/useOrderOperations';
import { useAuth } from '@/contexts/auth';

interface OrderDetails {
  orderId?: string;
  taphoammoOrderId?: string;
  [key: string]: any;
}

interface PurchaseModalContextType {
  // State
  loading: boolean;
  purchaseComplete: boolean;
  insufficientBalance: boolean;
  additionalFundsNeeded: number;
  orderDetails: OrderDetails | null;
  productKeys: string[] | undefined;
  error: string | null;
  checkingOrder: boolean;
  userBalance: number;
  
  // Quantity management
  quantity: string;
  handleQuantityChange: (value: string) => void;
  
  // Actions
  handlePurchase: () => Promise<void>;
  handleCheckOrder: () => Promise<void>;
  handleReset: () => void;
  handleDeposit: () => void;
  handleViewOrder: () => void;
  
  // Calculations
  totalPrice: number;
}

const PurchaseModalContext = createContext<PurchaseModalContextType | undefined>(undefined);

export const PurchaseModalProvider: React.FC<{
  children: ReactNode;
  productId: string;
  productName: string;
  productPrice: number;
  initialQuantity: number;
  kioskToken: string | null;
  stock: number;
  onOpenChange: (open: boolean) => void;
}> = ({ 
  children, 
  productId,
  productName,
  productPrice,
  initialQuantity,
  kioskToken, 
  stock,
  onOpenChange
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { buyProducts, checkOrderUntilComplete, loading: processingOrder } = useOrderOperations();
  
  // State
  const [userBalance, setUserBalance] = useState(0);
  const [quantity, setQuantity] = useState(initialQuantity.toString());
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [additionalFundsNeeded, setAdditionalFundsNeeded] = useState(0);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [productKeys, setProductKeys] = useState<string[] | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [checkingOrder, setCheckingOrder] = useState(false);
  
  // Update total price when quantity or product price changes
  React.useEffect(() => {
    const newQuantity = parseInt(quantity);
    const newTotalPrice = productPrice * (isNaN(newQuantity) ? 1 : newQuantity);
    setTotalPrice(newTotalPrice);
  }, [quantity, productPrice]);
  
  // Load user balance
  React.useEffect(() => {
    const loadUserBalance = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        setUserBalance(data.balance);
        
        // Check if balance is sufficient
        const isInsufficient = data.balance < totalPrice;
        setInsufficientBalance(isInsufficient);
        
        if (isInsufficient) {
          setAdditionalFundsNeeded(totalPrice - data.balance);
        } else {
          setAdditionalFundsNeeded(0);
        }
      } catch (err) {
        console.error('Error loading user balance:', err);
      }
    };
    
    loadUserBalance();
  }, [user?.id, totalPrice]);
  
  // Handle quantity change
  const handleQuantityChange = (value: string) => {
    setQuantity(value);
  };
  
  // Make purchase
  const handlePurchase = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to make a purchase');
      navigate('/login');
      return;
    }
    
    if (!kioskToken) {
      toast.error('This product cannot be purchased directly');
      return;
    }
    
    // Final check for sufficient balance
    if (insufficientBalance && productPrice > 0) {
      toast.error('Insufficient balance', {
        description: `You need more funds to complete this purchase.`
      });
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Call our Edge Function to handle the purchase
      const parsedQuantity = parseInt(quantity);
      const order = await buyProducts(
        kioskToken,
        user.id,
        isNaN(parsedQuantity) ? 1 : parsedQuantity
      );
      
      // Update state with order details
      setOrderDetails(order);
      setPurchaseComplete(true);
      
      // If product keys are available immediately, show them
      if (order.productKeys && order.productKeys.length > 0) {
        setProductKeys(order.productKeys);
      }
      
      // Update user balance
      setUserBalance(prev => prev - totalPrice);
      
      // Show success notification
      toast.success('Purchase successful!');
      
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete purchase');
      toast.error('Purchase failed', {
        description: err instanceof Error ? err.message : 'Failed to complete purchase'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Check order status and retrieve keys
  const handleCheckOrder = async () => {
    if (!orderDetails || !orderDetails.taphoammoOrderId) {
      return;
    }
    
    setCheckingOrder(true);
    
    try {
      // Check order status
      const result = await checkOrderUntilComplete(
        orderDetails.taphoammoOrderId,
        user?.id || ''
      );
      
      if (result.success && result.product_keys && result.product_keys.length > 0) {
        setProductKeys(result.product_keys);
        
        // Update order item with the product keys
        await supabase.functions.invoke('update-order-keys', {
          body: {
            orderId: orderDetails.orderId,
            productKeys: result.product_keys
          }
        });
      } else {
        toast.info('Order is still processing. Please check again later.');
      }
    } catch (err) {
      console.error('Error checking order:', err);
      toast.error('Failed to retrieve product keys. Please try again later.');
    } finally {
      setCheckingOrder(false);
    }
  };
  
  // Handle reset
  const handleReset = () => {
    setPurchaseComplete(false);
    setError(null);
    setOrderDetails(null);
    setProductKeys(undefined);
  };
  
  // Deposit funds
  const handleDeposit = () => {
    onOpenChange(false);
    navigate('/deposit');
  };
  
  // View order
  const handleViewOrder = () => {
    onOpenChange(false);
    navigate('/dashboard');
  };
  
  const value = {
    loading,
    purchaseComplete,
    insufficientBalance,
    additionalFundsNeeded,
    orderDetails,
    productKeys,
    error,
    checkingOrder,
    userBalance,
    quantity,
    handleQuantityChange,
    handlePurchase,
    handleCheckOrder,
    handleReset,
    handleDeposit,
    handleViewOrder,
    totalPrice
  };
  
  return (
    <PurchaseModalContext.Provider value={value}>
      {children}
    </PurchaseModalContext.Provider>
  );
};

export const usePurchaseModal = () => {
  const context = useContext(PurchaseModalContext);
  if (!context) {
    throw new Error('usePurchaseModal must be used within PurchaseModalProvider');
  }
  return context;
};
