
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { TaphoammoProduct } from '@/types/products';

interface CacheInfo {
  lastChecked?: Date;
  expiresAt?: Date;
  isCached?: boolean;
}

interface StockCacheInfo extends TaphoammoProduct {
  cached?: boolean;
  cacheUpdatedAt?: Date;
  cacheExpiresAt?: Date;
}

interface InventoryCacheData {
  id: string;
  product_id: string;
  kiosk_token: string;
  stock_quantity: number;
  price: number;
  source: string;
  last_checked_at: string;
  last_sync_status: string;
  sync_message: string;
  cached_until: string;
  retry_count: number;
  created_at: string;
  updated_at: string;
  name?: string;
  products?: { name: string };
}

export const useStockCache = () => {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo>({});

  const checkStockCache = async (kioskToken: string): Promise<{
    cached: boolean;
    data?: StockCacheInfo;
  }> => {
    const { data: cacheData } = await supabase
      .from('inventory_cache')
      .select('*, products(name)')
      .eq('kiosk_token', kioskToken)
      .single();

    if (cacheData && new Date(cacheData.cached_until) > new Date()) {
      const productName = cacheData.products?.name || 'Sản phẩm';
      setCacheInfo({
        lastChecked: new Date(cacheData.last_checked_at),
        expiresAt: new Date(cacheData.cached_until),
        isCached: true
      });

      return {
        cached: true,
        data: {
          kiosk_token: kioskToken,
          name: productName,
          stock_quantity: cacheData.stock_quantity,
          price: cacheData.price,
          cached: true,
          cacheUpdatedAt: new Date(cacheData.last_checked_at),
          cacheExpiresAt: new Date(cacheData.cached_until)
        }
      };
    }

    return { cached: false };
  };

  return {
    cacheInfo,
    setCacheInfo,
    checkStockCache
  };
};

export type { StockCacheInfo, InventoryCacheData, CacheInfo };
