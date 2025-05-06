
import React, { useState, useEffect } from 'react';
import { ShoppingCart, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ProductQuantity from './ProductQuantity';
import { PurchaseConfirmModal } from './purchase/PurchaseConfirmModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useStockOperations } from '@/hooks/taphoammo/useStockOperations';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProductActionsProps {
  product: {
    id: string;
    name: string;
    price: number;
    sale_price?: number | string | null;
    image_url?: string;
    stock_quantity: number;
    kiosk_token?: string;
    description?: string;
    is_visible?: boolean;
  };
}

const ProductActions: React.FC<ProductActionsProps> = ({ product }) => {
  const [quantity, setQuantity] = useState('1');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const { 
    checkStockAvailability, 
    loading: stockLoading,
    stockData,
    error: stockError
  } = useStockOperations();
  
  const [stockMessage, setStockMessage] = useState<string | null>(null);
  const [localStockQuantity, setLocalStockQuantity] = useState<number>(product.stock_quantity);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);
  const [isEmergency, setIsEmergency] = useState<boolean>(false);
  
  const maxQuantity = Math.min(10, localStockQuantity);
  const effectivePrice = product.sale_price && Number(product.sale_price) > 0 && Number(product.sale_price) < product.price
    ? Number(product.sale_price)
    : product.price;
  
  const isOutOfStock = localStockQuantity <= 0;
  
  // Check stock on component mount
  useEffect(() => {
    if (product.kiosk_token) {
      refreshStockInfo();
    }
  }, [product.kiosk_token]);
  
  const refreshStockInfo = async () => {
    if (!product.kiosk_token) {
      setStockMessage("No kiosk token available for this product");
      return;
    }
    
    try {
      const stockResult = await checkStockAvailability(
        1, // Just checking availability, not quantity yet
        product.kiosk_token,
        { showToasts: false } // Don't show toasts for initial check
      );
      
      if (stockResult.stockData) {
        setLocalStockQuantity(stockResult.stockData.stock_quantity);
        setLastChecked(stockResult.stockData.last_checked || null);
        setIsCached(stockResult.stockData.cached || false);
        setIsEmergency(stockResult.stockData.emergency || false);
        
        // Update stock message based on quantity
        if (stockResult.stockData.stock_quantity <= 0) {
          setStockMessage("This product is currently out of stock");
        } else if (stockResult.stockData.stock_quantity < 10) {
          setStockMessage(`Low stock: Only ${stockResult.stockData.stock_quantity} items left`);
        } else {
          setStockMessage(null);
        }
      }
      
      // If using cached data, show a message
      if (stockResult.cached) {
        setStockMessage(prev => prev || "Using cached data - may not be current");
      }
      
      // If not available, show the message
      if (!stockResult.available) {
        setStockMessage(stockResult.message || "Product is not available");
      }
    } catch (error) {
      console.error("Error checking stock:", error);
      setStockMessage("Could not retrieve stock information");
    }
  };
  
  const handleBuyNow = async () => {
    if (!product.kiosk_token) {
      toast.error("This product cannot be purchased directly");
      return;
    }
    
    if (localStockQuantity <= 0) {
      toast.error("This product is out of stock");
      return;
    }
    
    const parsedQuantity = parseInt(quantity) || 1;
    
    // Check real-time stock availability again before opening purchase modal
    try {
      const stockResult = await checkStockAvailability(
        parsedQuantity,
        product.kiosk_token
      );
      
      if (!stockResult.available) {
        setStockMessage(stockResult.message || "Product is not available");
        toast.error(stockResult.message || "Product is not available");
        
        // Update local stock quantity if we got new data
        if (stockResult.stockData) {
          setLocalStockQuantity(stockResult.stockData.stock_quantity);
          setLastChecked(stockResult.stockData.last_checked || null);
          setIsCached(stockResult.stockData.cached || false);
          setIsEmergency(stockResult.stockData.emergency || false);
        }
        
        return;
      }
      
      // Update local state with the latest stock data
      if (stockResult.stockData) {
        setLocalStockQuantity(stockResult.stockData.stock_quantity);
        setLastChecked(stockResult.stockData.last_checked || null);
        setIsCached(stockResult.stockData.cached || false);
        setIsEmergency(stockResult.stockData.emergency || false);
      }
    } catch (error) {
      console.error("Error checking stock:", error);
      // Continue to purchase modal, will do another check there
    }
    
    setIsPurchaseModalOpen(true);
  };
  
  // Format time ago for last checked time
  const getTimeAgo = (date: Date | null) => {
    if (!date) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };
  
  const isStockDataStale = () => {
    if (!lastChecked) return true;
    
    const now = new Date();
    const diffMs = now.getTime() - lastChecked.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    return diffMins > 30; // Data is stale if older than 30 minutes
  };
  
  return (
    <div className="space-y-4">
      {stockMessage && (
        <Alert 
          variant={localStockQuantity <= 0 ? "destructive" : "default"} 
          className={localStockQuantity > 0 && localStockQuantity < 10 ? "bg-amber-50 border-amber-200 text-amber-800" : ""}
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{stockMessage}</AlertDescription>
        </Alert>
      )}
      
      {/* Stock update time information */}
      {lastChecked && (
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Stock updated: {getTimeAgo(lastChecked)}</span>
          {isStockDataStale() && (
            <span className="text-amber-600">Data may be outdated</span>
          )}
        </div>
      )}
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="quantity" className="block text-sm font-medium font-poppins text-gray-700">
            Quantity
          </label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={refreshStockInfo}
                  disabled={stockLoading || !product.kiosk_token}
                >
                  {stockLoading ? (
                    <span className="flex items-center">
                      <span className="mr-1">Updating</span>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <span className="mr-1">Refresh Stock</span>
                      <RefreshCw className="h-3 w-3" />
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Check latest stock information</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <ProductQuantity
          value={quantity}
          onChange={setQuantity}
          maxQuantity={maxQuantity}
          disabled={localStockQuantity <= 0 || stockLoading}
        />
      </div>
      
      <div className="flex gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">
                <Button 
                  size="lg" 
                  className={`w-full flex ${isOutOfStock ? 'bg-gray-400 hover:bg-gray-400' : 'bg-[#2ECC71] hover:bg-[#27AE60]'}`}
                  onClick={handleBuyNow}
                  disabled={localStockQuantity <= 0 || stockLoading}
                >
                  {isOutOfStock ? (
                    <>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Out of Stock
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Buy Now
                    </>
                  )}
                </Button>
              </div>
            </TooltipTrigger>
            {isOutOfStock && (
              <TooltipContent>
                <p>This product is currently out of stock</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <PurchaseConfirmModal
        open={isPurchaseModalOpen}
        onOpenChange={setIsPurchaseModalOpen}
        productId={product.id}
        productName={product.name}
        productPrice={effectivePrice}
        productImage={product.image_url || '/placeholder.svg'}
        quantity={parseInt(quantity) || 1}
        kioskToken={product.kiosk_token || null}
        stock={localStockQuantity}
      />
    </div>
  );
};

export default ProductActions;
