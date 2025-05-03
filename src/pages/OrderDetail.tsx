
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/purchases/StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCurrencyContext } from '@/contexts/CurrencyContext';
import { useAuth } from '@/contexts/AuthContext';
import { OrderDetailsData, OrderItem } from '@/types/orders';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatUSD, convertVNDtoUSD } = useCurrencyContext();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetailsData | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id || !user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch order details
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select(`
            id, 
            status, 
            total_amount, 
            created_at, 
            updated_at, 
            user_id
          `)
          .eq('id', id)
          .single();
          
        if (orderError) throw orderError;
        
        // Verify this is the user's order
        if (order.user_id !== user.id) {
          throw new Error('You do not have permission to view this order');
        }
        
        // Fetch order items with product details
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            id,
            order_id,
            product_id,
            quantity,
            price,
            total,
            created_at,
            data,
            product:products(id, name, slug, image_url)
          `)
          .eq('order_id', id);
        
        if (itemsError) throw itemsError;
        
        // Get user profile info
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email, username, full_name')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        setOrderDetails({
          ...order,
          items: items as OrderItem[],
          customer: {
            email: profile.email,
            username: profile.username,
            full_name: profile.full_name
          }
        });
        
      } catch (err: any) {
        console.error('Error fetching order details:', err);
        setError(err.message || 'Failed to load order details');
        toast.error('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, user]);

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      toast.success('Product key copied to clipboard');
      
      // Reset copied status after 2 seconds
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy key:', err);
      toast.error('Failed to copy key to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader className="bg-red-50 dark:bg-red-900/20">
            <CardTitle className="flex items-center text-red-700 dark:text-red-400">
              <AlertCircle className="mr-2 h-5 w-5" />
              Error Loading Order
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p>{error || 'Unable to load order details'}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => navigate('/dashboard/purchases')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to purchases
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const createdDate = new Date(orderDetails.created_at).toLocaleString();
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Order #{id?.substring(0, 8)}</h1>
          <p className="text-muted-foreground">Placed on {createdDate}</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard/purchases')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to purchases
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Summary */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <div className="flex items-center space-x-2">
              <StatusBadge status={orderDetails.status} />
              <p className="text-xl font-bold">
                {formatUSD(convertVNDtoUSD(orderDetails.total_amount))}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {orderDetails.items.map((item) => {
              const productKeys = item.data?.product_keys || [];
              
              return (
                <div key={item.id} className="border rounded-md p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{item.product?.name || 'Product'}</h3>
                      <div className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × {formatUSD(convertVNDtoUSD(item.price))}
                      </div>
                    </div>
                    <p className="font-medium">
                      {formatUSD(convertVNDtoUSD(item.total))}
                    </p>
                  </div>
                  
                  {/* Product Keys */}
                  {productKeys.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Product Keys:</h4>
                      <div className="space-y-2">
                        {productKeys.map((key: string, index: number) => (
                          <div 
                            key={index} 
                            className="bg-muted p-2 rounded flex justify-between items-center break-all"
                          >
                            <code className="text-xs font-mono">{key}</code>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 shrink-0"
                              onClick={() => handleCopyKey(key)}
                            >
                              {copiedKey === key ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
        
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{orderDetails.customer?.email || 'N/A'}</p>
            </div>
            {orderDetails.customer?.full_name && (
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{orderDetails.customer.full_name}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Order Status</p>
              <StatusBadge status={orderDetails.status} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="font-medium">{createdDate}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetail;
