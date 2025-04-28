
import { supabase } from '@/integrations/supabase/client';
import { CircuitBreaker } from './circuitBreaker/CircuitBreaker';
import { fetchTaphoammo } from '@/services/taphoammo-api';

interface StockCacheItem {
  id: string;
  cacheId: string;
  product_id: string;
  kiosk_token: string;
  stock_quantity: number;
  price: number;
  name: string;
  last_checked_at: string;
  cached_until: string;
}

export async function getStockForItem(
  productId: string,
  kioskToken: string,
): Promise<{ quantity: number; price: number; lastUpdated: string }> {
  try {
    // Check if circuit is open
    const isCircuitOpen = await CircuitBreaker.isOpen();
    
    if (isCircuitOpen) {
      // If circuit is open, try to get from cache
      console.log("Circuit is open, using cached data");
      const { data: cacheData } = await supabase
        .from('inventory_cache')
        .select('*')
        .eq('product_id', productId)
        .eq('kiosk_token', kioskToken)
        .single();
      
      if (cacheData) {
        const typedCacheData = cacheData as StockCacheItem;
        return {
          quantity: typedCacheData.stock_quantity,
          price: typedCacheData.price,
          lastUpdated: typedCacheData.last_checked_at,
        };
      }
      
      // If no cache, return zeros
      return { quantity: 0, price: 0, lastUpdated: new Date().toISOString() };
    }
    
    // Circuit is closed, try live API
    try {
      const response = await fetchTaphoammo(`stock/${kioskToken}`, {}, false);
      
      if (response && Array.isArray(response)) {
        const stockData = response.find(item => item.id === productId);
        
        // Update the cache with latest data
        if (stockData) {
          const typedStockData = stockData as {
            id: string;
            stock_quantity: number;
            price: number;
            name: string;
            cacheId?: string;
          };
          
          await updateStockCache(
            productId,
            kioskToken,
            typedStockData.stock_quantity,
            typedStockData.price,
            typedStockData.name
          );
          
          return {
            quantity: typedStockData.stock_quantity,
            price: typedStockData.price,
            lastUpdated: new Date().toISOString(),
          };
        }
      }
      
      return { quantity: 0, price: 0, lastUpdated: new Date().toISOString() };
    } catch (error) {
      // If API call fails, try to get from cache
      console.error("API call failed, falling back to cache:", error);
      await CircuitBreaker.recordFailure(error as Error);
      
      const { data: cacheData } = await supabase
        .from('inventory_cache')
        .select('*')
        .eq('product_id', productId)
        .eq('kiosk_token', kioskToken)
        .single();
      
      if (cacheData) {
        const typedCacheData = cacheData as StockCacheItem;
        return {
          quantity: typedCacheData.stock_quantity,
          price: typedCacheData.price,
          lastUpdated: typedCacheData.last_checked_at,
        };
      }
      
      // If no cache, return zeros
      return { quantity: 0, price: 0, lastUpdated: new Date().toISOString() };
    }
  } catch (error) {
    console.error("Error in getStockForItem:", error);
    return { quantity: 0, price: 0, lastUpdated: new Date().toISOString() };
  }
}

async function updateStockCache(
  productId: string,
  kioskToken: string,
  quantity: number,
  price: number,
  name: string
) {
  try {
    const { data, error } = await supabase
      .from('inventory_cache')
      .upsert({
        product_id: productId,
        kiosk_token: kioskToken,
        stock_quantity: quantity,
        price: price,
        name: name,
        last_checked_at: new Date().toISOString(),
        cached_until: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating stock cache:", error);
  }
}
