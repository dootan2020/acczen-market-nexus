
import { supabase } from '@/integrations/supabase/client';
import { CircuitBreaker } from './circuitBreaker/CircuitBreaker';
import { taphoammoApi } from '@/services/taphoammo-api';
import { toast } from 'sonner';

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

// Define expected type for stock API response
interface StockResponse {
  stock_quantity: number;
  price: number;
  name: string;
  [key: string]: any; // Allow for other properties
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
        .select('*, products(name)')
        .eq('product_id', productId)
        .eq('kiosk_token', kioskToken)
        .single();
      
      if (cacheData) {
        // Convert the cache data to StockCacheItem with required properties
        const typedCacheData: StockCacheItem = {
          ...cacheData,
          cacheId: cacheData.id, // Use id as cacheId
          name: cacheData.products?.name || 'Unknown Product' // Provide default name
        };
        
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
      const response = await taphoammoApi.fetchTaphoammo<StockResponse>('stock', { kioskToken });
      
      if (response) {
        const stockData = response;
        
        // Update the cache with latest data
        if (stockData) {
          await updateStockCache(
            productId,
            kioskToken,
            stockData.stock_quantity,
            stockData.price,
            stockData.name || 'Unknown Product'
          );
          
          return {
            quantity: stockData.stock_quantity,
            price: stockData.price,
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
        .select('*, products(name)')
        .eq('product_id', productId)
        .eq('kiosk_token', kioskToken)
        .single();
      
      if (cacheData) {
        // Convert the cache data to StockCacheItem with required properties
        const typedCacheData: StockCacheItem = {
          ...cacheData,
          cacheId: cacheData.id, // Use id as cacheId
          name: cacheData.products?.name || 'Unknown Product' // Provide default name
        };
        
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
