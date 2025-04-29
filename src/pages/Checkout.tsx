
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, AlertTriangle, ShieldCheck, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrencyContext } from '@/contexts/CurrencyContext';
import { supabase } from '@/integrations/supabase/client';
import CheckoutEmpty from '@/components/checkout/CheckoutEmpty';
import OrderSummary from '@/components/checkout/OrderSummary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { z } from 'zod';
import { usePurchaseProduct } from '@/hooks/usePurchaseProduct';

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
  const { convertVNDtoUSD, formatUSD } = useCurrencyContext();
  const [userBalance, setUserBalance] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<CheckoutValidation>({
    hasEnoughBalance: true,
    hasItems: true,
    validStock: true
  });
  const { isProcessing, executePurchase } = usePurchaseProduct();
  
  // Check if we have a direct product purchase
  const directProduct = location.state?.product;
  const quantity = location.state?.quantity || 1;
  
  useEffect(() => {
    if (!user) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để hoàn tất mua hàng",
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
        
        // Get items and total price
        const productPrice = directProduct ? directProduct.price : 0;
        const total = productPrice * quantity;
        
        // Validate checkout data
        validateCheckout(data.balance || 0, directProduct, total);
        
      } catch (error) {
        console.error('Error fetching user balance:', error);
        setError('Không thể tải thông tin số dư. Vui lòng thử lại.');
        toast({
          title: "Lỗi tải dữ liệu",
          description: "Vui lòng làm mới trang",
          variant: "destructive",
        });
      }
    };
    
    fetchBalance();
  }, [user, navigate, location, toast, directProduct, quantity]);

  // Get total price
  const total = directProduct ? directProduct.price * quantity : 0;
  const totalUSD = convertVNDtoUSD(total);
  const balanceUSD = convertVNDtoUSD(userBalance);
  const hasEnoughBalance = userBalance >= total;

  const validateCheckout = (balance: number, product: any, totalAmount: number) => {
    if (!product) {
      setError('Không có sản phẩm để thanh toán.');
      setValidation({
        hasEnoughBalance: true,
        hasItems: false,
        validStock: true
      });
      return false;
    }
    
    const newValidation = {
      hasEnoughBalance: balance >= totalAmount,
      hasItems: !!product,
      validStock: true
    };
    
    // Check for stock availability if we have stock_quantity
    if (product?.stock_quantity !== undefined && 
        quantity !== undefined && 
        product.stock_quantity < quantity) {
      newValidation.validStock = false;
    }
    
    setValidation(newValidation);
    
    // Set error message if validation fails
    if (!newValidation.hasEnoughBalance) {
      setError(`Số dư không đủ. Bạn cần ${formatUSD(totalUSD)} nhưng chỉ có ${formatUSD(balanceUSD)}.`);
    } else if (!newValidation.hasItems) {
      setError('Không có sản phẩm để thanh toán.');
    } else if (!newValidation.validStock) {
      setError(`Sản phẩm "${product.name}" không đủ số lượng.`);
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
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để hoàn tất mua hàng",
        variant: "destructive",
      });
      localStorage.setItem('previousPath', location.pathname);
      navigate("/login");
      return;
    }
    
    if (!directProduct) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin sản phẩm",
        variant: "destructive",
      });
      return;
    }
    
    // Execute purchase using the purchase hook
    const orderId = await executePurchase({
      id: directProduct.id,
      name: directProduct.name,
      price: directProduct.price,
      kioskToken: directProduct.kiosk_token,
      quantity: quantity
    });

    if (orderId) {
      // Navigate to order completion page
      navigate('/order-complete', {
        state: {
          orderData: {
            id: orderId,
            items: [{
              name: directProduct.name,
              quantity: quantity,
              price: convertVNDtoUSD(directProduct.price),
              total: convertVNDtoUSD(directProduct.price * quantity)
            }],
            total: convertVNDtoUSD(directProduct.price * quantity),
            payment_method: 'Account Balance'
          }
        }
      });
    }
  };

  const handleGoToDeposit = () => {
    navigate('/deposit', { state: { returnTo: location.pathname, productData: location.state } });
  };

  if (!directProduct) {
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
          Quay lại
        </Button>

        <h1 className="text-3xl font-bold mb-6">Xác nhận đơn hàng</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Lỗi thanh toán</AlertTitle>
            <AlertDescription>
              {error}
              {!hasEnoughBalance && (
                <div className="mt-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleGoToDeposit}
                  >
                    Nạp tiền ngay
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin thanh toán</CardTitle>
                <CardDescription>Kiểm tra thông tin trước khi hoàn tất đơn hàng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Phương thức thanh toán</span>
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4 text-primary" />
                      <span className="font-medium">Số dư tài khoản</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="text-sm text-muted-foreground">Số dư hiện tại</span>
                    <span className={`font-medium ${!hasEnoughBalance ? 'text-destructive' : ''}`}>
                      {formatUSD(balanceUSD)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tổng đơn hàng</span>
                    <span className="font-medium">{formatUSD(totalUSD)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="text-sm font-medium">Số dư sau khi thanh toán</span>
                    <span className={`font-bold ${!hasEnoughBalance ? 'text-destructive' : 'text-primary'}`}>
                      {hasEnoughBalance ? formatUSD(balanceUSD - totalUSD) : "Không đủ số dư"}
                    </span>
                  </div>
                  
                  {hasEnoughBalance && (
                    <div className="flex items-center mt-4 rounded-md bg-green-50 p-3 text-green-700">
                      <ShieldCheck className="h-5 w-5 mr-2 flex-shrink-0" />
                      <p className="text-sm">Bạn sẽ nhận được sản phẩm số ngay sau khi hoàn tất thanh toán</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="w-full sm:w-auto"
                >
                  Hủy
                </Button>
                
                {!hasEnoughBalance && (
                  <Button
                    variant="default"
                    onClick={handleGoToDeposit}
                    className="w-full sm:w-auto"
                  >
                    Nạp tiền ngay
                  </Button>
                )}
                
                <Button
                  className="w-full sm:w-auto ml-auto bg-[#F97316] hover:bg-[#EA580C]"
                  disabled={isProcessing || !hasEnoughBalance || !validation.validStock}
                  onClick={handlePurchase}
                >
                  {isProcessing ? "Đang xử lý..." : "Xác nhận thanh toán"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Thông tin đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={directProduct.image}
                    alt={directProduct.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-medium line-clamp-2">{directProduct.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Số lượng: {quantity}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Giá</span>
                    <span>{formatUSD(convertVNDtoUSD(directProduct.price))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Số lượng</span>
                    <span>{quantity}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-medium">
                    <span>Tổng tiền</span>
                    <span>{formatUSD(totalUSD)}</span>
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
