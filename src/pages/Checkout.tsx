
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, AlertTriangle, ShoppingCart, Trash2, CreditCard, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { usePurchaseTaphoammo } from '@/hooks/usePurchaseTaphoammo';

const Checkout = () => {
  const { cart, removeItem, updateQuantity, clearCart } = useCart();
  const { session } = useAuth();
  const [userBalance, setUserBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<{
    orderId?: string;
    productKeys?: string[];
    apiProduct?: boolean;
  } | null>(null);
  
  const { purchase, isProcessing: isTaphoammoProcessing } = usePurchaseTaphoammo();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session?.user) {
      toast.error('Please log in to proceed with checkout');
      navigate('/login', { state: { returnUrl: '/checkout' } });
      return;
    }

    const fetchUserBalance = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        setUserBalance(data?.balance || 0);
      } catch (error) {
        console.error('Error fetching user balance:', error);
        toast.error('Failed to fetch account balance');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserBalance();
  }, [session, navigate]);

  const handleQuantityChange = (id: string, change: number, currentQuantity: number) => {
    const newQuantity = Math.max(1, currentQuantity + change);
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };

  const handleCheckout = async () => {
    if (!session?.user) {
      toast.error('Please log in to complete your purchase');
      navigate('/login');
      return;
    }

    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (userBalance < cart.totalPrice) {
      toast.error('Insufficient balance. Please add funds to your account.');
      return;
    }

    setIsProcessing(true);

    try {
      // Check if this is a taphoammo API product
      const hasApiProduct = cart.items.some(item => {
        const productInfo = JSON.parse(localStorage.getItem(`product_${item.id}`) || '{}');
        return productInfo.kioskToken;
      });

      if (hasApiProduct && cart.items.length === 1) {
        // Handle API product purchase
        const item = cart.items[0];
        const productInfo = JSON.parse(localStorage.getItem(`product_${item.id}`) || '{}');
        
        const result = await purchase({
          kioskToken: productInfo.kioskToken,
          quantity: item.quantity,
        });

        if (result.success) {
          toast.success('Purchase successful!');
          setPurchaseResult({
            orderId: result.orderId,
            productKeys: result.productKeys,
            apiProduct: true
          });
          setShowSuccessDialog(true);
          clearCart();
          // Update user balance after successful purchase
          setUserBalance(prev => prev - cart.totalPrice);
        } else {
          toast.error(result.error || 'Failed to process your purchase');
        }
      } else {
        // Handle regular product purchase
        const { data, error } = await supabase.functions.invoke('purchase-product', {
          body: { 
            items: cart.items.map(item => ({ 
              id: item.id, 
              quantity: item.quantity 
            })),
          }
        });

        if (error) throw error;

        if (data.success) {
          toast.success('Purchase successful!');
          setPurchaseResult({
            orderId: data.orderId,
            apiProduct: false
          });
          setShowSuccessDialog(true);
          clearCart();
          // Update user balance
          setUserBalance(prev => prev - cart.totalPrice);
        } else {
          toast.error(data.message || 'Failed to process your purchase');
        }
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('An error occurred while processing your purchase');
    } finally {
      setIsProcessing(false);
    }
  };

  const hasInsufficientBalance = userBalance < cart.totalPrice;

  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : cart.items.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some products to your cart and come back to checkout</p>
          <Button onClick={() => navigate('/products')}>Browse Products</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.items.map((item) => {
                    const productInfo = JSON.parse(localStorage.getItem(`product_${item.id}`) || '{}');
                    const isApiProduct = !!productInfo.kioskToken;
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <img 
                              src={item.image || 'https://placehold.co/100x100?text=No+Image'} 
                              alt={item.name}
                              className="h-12 w-12 object-cover rounded mr-3"
                            />
                            <div>
                              {item.name}
                              {isApiProduct && (
                                <Badge variant="outline" className="ml-2 bg-blue-50">
                                  API Product
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.id, -1, item.quantity)}
                            >
                              -
                            </Button>
                            <span className="mx-2">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.id, 1, item.quantity)}
                            >
                              +
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${cart.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>$0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${cart.totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="pt-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="flex justify-between mb-2">
                      <span>Your Balance</span>
                      <span className={hasInsufficientBalance ? "text-red-500" : "text-green-500"}>
                        ${userBalance.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>After Purchase</span>
                      <span>${Math.max(0, userBalance - cart.totalPrice).toFixed(2)}</span>
                    </div>
                    
                    {hasInsufficientBalance && (
                      <div className="flex items-start gap-2 text-red-500 mt-2 p-2 bg-red-50 rounded">
                        <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">
                          Insufficient balance. Please add funds to your account before completing your purchase.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  size="lg"
                  disabled={isProcessing || isTaphoammoProcessing || hasInsufficientBalance || cart.items.length === 0}
                  onClick={handleCheckout}
                >
                  {isProcessing || isTaphoammoProcessing ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Complete Purchase
                    </>
                  )}
                </Button>
                
                {hasInsufficientBalance && (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate('/deposit')}
                  >
                    Add Funds
                  </Button>
                )}
              </div>
            </div>
            
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p className="mb-2 flex items-center justify-center">
                <Check className="h-4 w-4 text-green-500 mr-1" />
                Secure payment
              </p>
              <p>
                All purchases are processed securely and your account will be credited immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Purchase Complete
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="mb-4">Your purchase has been processed successfully.</p>
            
            {purchaseResult?.apiProduct && purchaseResult.productKeys?.length ? (
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-2">Product Keys</h3>
                <div className="space-y-2">
                  {purchaseResult.productKeys.map((key, index) => (
                    <div key={index} className="bg-background p-2 rounded font-mono text-sm">
                      {key}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>You can view your purchased products on your dashboard.</p>
            )}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              className="sm:w-full"
              onClick={() => setShowSuccessDialog(false)}
            >
              Close
            </Button>
            <Button 
              className="sm:w-full"
              onClick={() => {
                setShowSuccessDialog(false);
                navigate('/dashboard');
              }}
            >
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Checkout;
