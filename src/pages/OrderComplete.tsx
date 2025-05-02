
import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Copy, ShoppingBag } from 'lucide-react';
import Layout from '@/components/Layout';
import { toast } from 'sonner';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface OrderData {
  id: string;
  total: number;
  items: OrderItem[];
  payment_method?: string;
  digital_items?: Array<{
    name: string;
    keys: string[];
  }>;
}

const OrderComplete: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderData as OrderData | undefined;

  // If accessed directly without order data, redirect to home
  useEffect(() => {
    if (!orderData) {
      navigate('/');
    }
  }, [orderData, navigate]);

  if (!orderData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p>No order information found. Redirecting...</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderData.id);
    toast.success("Order ID copied to clipboard");
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Product key copied to clipboard");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="border-green-200 animate-fade-in">
            <CardHeader className="bg-green-50 border-b border-green-200">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <CardTitle className="text-2xl text-green-700">Order Completed Successfully</CardTitle>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              <div className="bg-muted/30 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-medium">{orderData.id}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyOrderId}
                  title="Copy Order ID"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Order Summary</h3>
                
                <div className="space-y-2">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium">${item.total.toFixed(2)}</p>
                    </div>
                  ))}
                  
                  <div className="flex justify-between pt-2">
                    <p className="font-bold">Total</p>
                    <p className="font-bold">${orderData.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              {orderData.digital_items && orderData.digital_items.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium">Digital Products</h3>
                  
                  {orderData.digital_items.map((digitalItem, index) => (
                    <div key={index} className="space-y-2">
                      <p className="font-medium">{digitalItem.name}</p>
                      
                      {digitalItem.keys.map((key, keyIndex) => (
                        <div key={keyIndex} className="bg-muted/30 p-3 rounded-lg flex justify-between items-center">
                          <code className="font-mono text-sm">{key}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyKey(key)}
                            title="Copy Key"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                <p>We've sent a confirmation email with your order details. Your product will be available instantly or processed based on the product type.</p>
              </div>
            </CardContent>
            
            <CardFooter className="bg-muted/20 p-6 flex flex-col sm:flex-row gap-4">
              <Button asChild className="w-full sm:w-auto">
                <Link to="/dashboard">
                  View My Orders
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link to="/products">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default OrderComplete;
