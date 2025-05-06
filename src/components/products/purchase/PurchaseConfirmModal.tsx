
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { PurchaseModalInfo } from './PurchaseModalInfo';
import { PurchaseModalActions } from './PurchaseModalActions';
import { PurchaseResultCard } from './PurchaseResultCard';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useCurrencyContext } from '@/contexts/CurrencyContext';
import { useOrderOperations } from '@/hooks/taphoammo/useOrderOperations';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ShieldCheck } from 'lucide-react';

interface PurchaseConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string; // Keeping prop for compatibility but not using it
  quantity: number;
  kioskToken: string | null;
  stock: number;
}

export const PurchaseConfirmModal: React.FC<PurchaseConfirmModalProps> = ({
  open,
  onOpenChange,
  productId,
  productName,
  productPrice,
  productImage, // Not used anymore
  quantity,
  kioskToken,
  stock
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { formatUSD, convertVNDtoUSD } = useCurrencyContext();
  const { buyProducts, checkOrderUntilComplete, loading: processingOrder } = useOrderOperations();
  
  // State variables
  const [userBalance, setUserBalance] = useState(0);
  const [totalPrice, setTotalPrice] = useState(productPrice * quantity);
  const [loading, setLoading] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [productKeys, setProductKeys] = useState<string[] | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [checkingOrder, setCheckingOrder] = useState(false);
  
  // Load user balance
  useEffect(() => {
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
        setInsufficientBalance(data.balance < totalPrice);
      } catch (err) {
        console.error('Error loading user balance:', err);
      }
    };
    
    if (open) {
      loadUserBalance();
    }
  }, [open, user?.id, totalPrice]);
  
  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setPurchaseComplete(false);
      setError(null);
      setOrderDetails(null);
      setProductKeys(undefined);
    }
  }, [open]);
  
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
    
    setLoading(true);
    setError(null);
    
    try {
      // Call our Edge Function to handle the purchase
      const order = await buyProducts(
        kioskToken,
        user.id,
        quantity
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {purchaseComplete ? 'Purchase Complete' : 'Confirm Purchase'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {purchaseComplete ? 'Your order has been processed successfully.' : 'Review your purchase details before completing the transaction.'}
          </DialogDescription>
        </DialogHeader>
        
        <Separator />
        
        {!purchaseComplete ? (
          <>
            <div className="space-y-2 p-4 bg-muted/30 rounded-md">
              <h3 className="font-semibold text-base">{productName}</h3>
              <div className="flex gap-2 items-center text-sm text-muted-foreground">
                <span>Quantity: {quantity}</span>
                <span>•</span>
                <span>{formatUSD(convertVNDtoUSD(productPrice))} each</span>
              </div>
              
              <div className="flex items-center mt-2 text-sm text-emerald-600 gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                <span>Secure transaction</span>
              </div>
            </div>
            
            <PurchaseModalInfo 
              stock={stock}
              totalPrice={totalPrice}
              insufficientBalance={insufficientBalance}
              userBalance={userBalance}
            />
            
            <PurchaseModalActions 
              isProcessing={loading}
              onCancel={() => onOpenChange(false)}
              onConfirm={handlePurchase}
              onDeposit={handleDeposit}
              disabled={!kioskToken || stock < quantity}
              insufficientBalance={insufficientBalance}
              hasError={!!error}
            />
          </>
        ) : (
          <PurchaseResultCard
            orderId={orderDetails?.orderId || ''}
            productKeys={productKeys}
            isCheckingOrder={checkingOrder}
            onCheckOrder={handleCheckOrder}
            onReset={handleReset}
            onClose={handleViewOrder}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
