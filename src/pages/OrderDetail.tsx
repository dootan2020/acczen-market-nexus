
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useTaphoammoApi } from '@/hooks/useTaphoammoApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductKeys } from '@/components/dashboard/purchases/ProductKeys';
import { StatusBadge } from '@/components/dashboard/purchases/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/formatters';

const OrderDetail = () => {
  const { id: orderId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getOrderProducts, loading, error } = useTaphoammoApi();
  const [orderProducts, setOrderProducts] = useState<any[]>([]);
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [cachedData, setCachedData] = useState<boolean>(false);

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    
    try {
      setIsRefreshing(true);
      const result = await getOrderProducts(orderId);
      
      if (result.success) {
        setOrderProducts(result.products || []);
        setCachedData(!!result.cached);
        
        // Get order info from the API response if available
        if (result.orderInfo) {
          setOrderInfo(result.orderInfo);
        }
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      toast.error("Failed to load order details");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const handleRefresh = () => {
    fetchOrderDetails();
    toast.info("Refreshing order details...");
  };

  const productKeysAvailable = orderProducts && orderProducts.length > 0;
  
  // Display skeleton during initial loading
  if (loading && !isRefreshing && !productKeysAvailable) {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <div className="mb-6">
          <Link to="/purchases" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Purchases</span>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-between text-sm border-b pb-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Products</h3>
                {[1, 2].map((i) => (
                  <div key={i} className="mb-4 p-4 border rounded-md">
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <div className="mb-6">
        <Link to="/purchases" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Back to Purchases</span>
        </Link>
      </div>
      
      <Card className="shadow-md">
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle className="text-xl md:text-2xl">Order #{orderId}</CardTitle>
              <p className="text-muted-foreground mt-1">
                {orderInfo?.created_at ? new Date(orderInfo.created_at).toLocaleString() : 'Processing'}
              </p>
            </div>
            <div className="mt-2 md:mt-0">
              {orderInfo?.status && <StatusBadge status={orderInfo.status} />}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="py-6">
          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">Failed to load order details</p>
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orderInfo && (
                <div className="flex justify-between text-sm border-b pb-4">
                  <span className="text-muted-foreground">Order Total</span>
                  <span className="font-medium">{formatCurrency(orderInfo.total_amount)}</span>
                </div>
              )}
              
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Products</h3>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>
                
                {cachedData && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3 mb-4 text-sm">
                    <p className="text-amber-700 dark:text-amber-400">
                      This data is from a local cache. Refresh to check for the latest product keys.
                    </p>
                  </div>
                )}
                
                {productKeysAvailable ? (
                  <div className="space-y-4">
                    {orderProducts.map((product, index) => (
                      <div key={index} className="bg-background border rounded-md p-4">
                        <h4 className="font-medium mb-2">Product Key {index + 1}</h4>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-muted-foreground">ID: {product.id}</span>
                        </div>
                        
                        <div className="bg-muted p-3 rounded font-mono text-sm break-all">
                          {product.product}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/50 rounded-md">
                    {loading || isRefreshing ? (
                      <p>Loading product keys...</p>
                    ) : (
                      <p>No product keys available. They may be processing.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetail;
