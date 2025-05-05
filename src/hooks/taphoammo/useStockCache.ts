
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StockCacheInfo {
  kiosk_token: string;
  name?: string;
  stock_quantity: number;
  price: number;
  cached: boolean;
  cacheId: string;
  emergency?: boolean;
}

// Define the database inventory cache type to match what's in the database
interface InventoryCacheEntry {
  id: string;
  kiosk_token: string;
  stock_quantity: number;
  price: number;
  name?: string;
  created_at: string;
  updated_at: string;
  cached_until: string;
  last_checked_at: string;
  last_sync_status: string;
  product_id: string;
  retry_count: number;
  source: string;
  sync_message: string;
}

export const useStockCache = () => {
  const [cacheInfo, setCacheInfo] = useState<StockCacheInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get cache info from database
  const checkStockCache = async (kioskToken: string): Promise<{
    cached: boolean;
    data?: StockCacheInfo;
  }> => {
    setLoading(true);
    setError(null);
    
    try {
      // Check database for cached stock info
      const { data, error } = await supabase
        .from('inventory_cache')
        .select('*')
        .eq('kiosk_token', kioskToken)
        .single();
      
      if (error || !data) {
        return { cached: false };
      }
      
      // Check if cache is still valid
      const now = new Date();
      const cacheUntil = new Date(data.cached_until);
      
      if (now > cacheUntil) {
        return { cached: false };
      }
      
      // Create cache info from database data (type-safe)
      const entry = data as InventoryCacheEntry;
      const cacheInfo: StockCacheInfo = {
        kiosk_token: entry.kiosk_token,
        // Use optional chaining to safely access name
        name: entry.name || 'Unknown Product',
        stock_quantity: entry.stock_quantity,
        price: entry.price,
        cached: true,
        cacheId: entry.id,
        emergency: false
      };
      
      setCacheInfo(cacheInfo);
      
      return {
        cached: true,
        data: cacheInfo
      };
    } catch (err) {
      console.error('Error checking stock cache:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return { cached: false };
    } finally {
      setLoading(false);
    }
  };

  // Update cache in database
  const updateCache = async (kioskToken: string, stockInfo: Partial<StockCacheInfo>) => {
    try {
      const { error } = await supabase
        .from('inventory_cache')
        .upsert({
          kiosk_token: kioskToken,
          stock_quantity: stockInfo.stock_quantity,
          price: stockInfo.price,
          name: stockInfo.name || 'Unknown Product',
          last_checked_at: new Date().toISOString(),
          cached_until: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
          last_sync_status: 'success'
        }, {
          onConflict: 'kiosk_token'
        });
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (err) {
      console.error('Error updating cache:', err);
      return false;
    }
  };

  return {
    cacheInfo,
    setCacheInfo,
    checkStockCache,
    updateCache,
    loading,
    error
  };
};
