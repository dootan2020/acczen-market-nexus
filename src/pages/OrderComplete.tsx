
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import TrustBadges from '@/components/trust/TrustBadges';
import { useOrderConfirmation } from '@/hooks/useOrderConfirmation';
import { useAuth } from '@/contexts/AuthContext';

const OrderComplete = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const orderData = location.state?.orderData;
  const { sendOrderConfirmationEmail } = useOrderConfirmation();

  useEffect(() => {
    if (orderData?.id && user?.id) {
      // Send order confirmation email when component mounts
      sendOrderConfirmationEmail(user.id, {
        id: orderData.id,
        items: orderData.items || [],
        total: orderData.total || 0,
        payment_method: orderData.payment_method || 'Account Balance',
        transaction_id: orderData.transaction_id,
        digital_items: orderData.digital_items || []
      });
    }
  }, [orderData, user]);

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="text-center bg-green-50 border-b border-green-100 pb-6">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl md:text-3xl text-green-700">Order Completed Successfully!</CardTitle>
            <CardDescription className="text-green-600 mt-2">
              Thank you for your purchase. Your order has been processed successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {orderData ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order Number</p>
                    <p className="font-medium">{orderData.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Order Summary
                  </h3>
                  
                  <div className="space-y-2">
                    {orderData.items && orderData.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <div>
                          <p>{item.name} × {item.quantity}</p>
                          <p className="text-sm text-muted-foreground">
                            ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price} each
                          </p>
                        </div>
                        <p className="font-medium">
                          ${typeof item.total === 'number' ? item.total.toFixed(2) : item.total}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between pt-4 border-t">
                    <p className="font-medium">Total</p>
                    <p className="font-bold">${typeof orderData.total === 'number' ? orderData.total.toFixed(2) : orderData.total}</p>
                  </div>
                </div>
                
                {orderData.digital_items && orderData.digital_items.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-medium mb-3">Your Digital Products</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {orderData.digital_items.map((item: any, index: number) => (
                        <div key={index} className="mb-4 last:mb-0">
                          <p className="font-medium">{item.name}</p>
                          {item.keys && item.keys.length > 0 ? (
                            <div className="mt-2 space-y-1">
                              {item.keys.map((key: string, keyIndex: number) => (
                                <div key={keyIndex} className="bg-white p-2 rounded border text-sm font-mono">
                                  {key}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground mt-1">No keys available</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-6">
                  <TrustBadges variant="compact" />
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No order information available.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard/purchases')}
              className="w-full sm:w-auto"
            >
              View Purchase History
            </Button>
            <Button 
              onClick={() => navigate('/')}
              className="w-full sm:w-auto"
            >
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default OrderComplete;
